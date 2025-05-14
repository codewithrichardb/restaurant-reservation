import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Waitlist from '@/models/Waitlist';
import { sendEmail } from '@/lib/emailService';

// Helper function to check if user is admin
async function isAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) return false;

  const userRole = session.user?.role;
  return userRole === 'admin' || (userRole && String(userRole).toLowerCase() === 'admin');
}

// GET a single waitlist entry
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await dbConnect();

    const waitlistEntry = await Waitlist.findById(context.params.id);

    if (!waitlistEntry) {
      return NextResponse.json(
        { error: 'Waitlist entry not found' },
        { status: 404 }
      );
    }

    // Check if user is authorized to view this entry
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === 'admin' ||
                   (session?.user?.role && String(session?.user?.role).toLowerCase() === 'admin');

    // Only allow access if admin or if the entry belongs to the logged-in user
    if (!isAdmin && (!session || waitlistEntry.user?.toString() !== session.user.id)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(waitlistEntry);
  } catch (error) {
    console.error('Error fetching waitlist entry:', error);
    return NextResponse.json(
      { error: 'Failed to fetch waitlist entry' },
      { status: 500 }
    );
  }
}

// PATCH update a waitlist entry
export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await dbConnect();

    const data = await req.json();
    const session = await getServerSession(authOptions);
    const isAdmin = await isAdmin();

    const waitlistEntry = await Waitlist.findById(context.params.id);

    if (!waitlistEntry) {
      return NextResponse.json(
        { error: 'Waitlist entry not found' },
        { status: 404 }
      );
    }

    // Only allow updates if admin or if the entry belongs to the logged-in user
    if (!isAdmin && (!session || waitlistEntry.user?.toString() !== session.user.id)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Regular users can only cancel their own entries
    if (!isAdmin && data.status && data.status !== 'cancelled') {
      return NextResponse.json(
        { error: 'You can only cancel your waitlist entry' },
        { status: 403 }
      );
    }

    // Store original status for notification logic
    const originalStatus = waitlistEntry.status;
    const originalNotified = waitlistEntry.notified;

    // Update waitlist entry
    if (isAdmin) {
      // Admins can update all fields
      if (data.name !== undefined) waitlistEntry.name = data.name;
      if (data.email !== undefined) waitlistEntry.email = data.email;
      if (data.phone !== undefined) waitlistEntry.phone = data.phone;
      if (data.partySize !== undefined) waitlistEntry.partySize = data.partySize;
      if (data.estimatedWaitTime !== undefined) waitlistEntry.estimatedWaitTime = data.estimatedWaitTime;
      if (data.status !== undefined) waitlistEntry.status = data.status;
      if (data.notified !== undefined) waitlistEntry.notified = data.notified;
    } else {
      // Regular users can only update status to cancelled
      if (data.status === 'cancelled') waitlistEntry.status = 'cancelled';
    }

    await waitlistEntry.save();

    // Send notification if status changed to 'seated' and not previously notified
    if (isAdmin &&
        waitlistEntry.status === 'seated' &&
        (originalStatus !== 'seated' || !originalNotified)) {

      try {
        // TODO: Implement a specific email template for waitlist notifications
        // For now, we'll use a generic email
        await sendEmail(
          waitlistEntry.email,
          'reservationConfirmed', // Reusing this template for now
          {
            name: waitlistEntry.name,
            date: new Date().toISOString().split('T')[0],
            timeSlot: 'Now',
            partySize: waitlistEntry.partySize,
            _id: waitlistEntry._id.toString(),
          }
        );

        // Mark as notified
        waitlistEntry.notified = true;
        await waitlistEntry.save();
      } catch (emailError) {
        console.error('Error sending notification email:', emailError);
        // Continue with the response even if email fails
      }
    }

    return NextResponse.json(waitlistEntry);
  } catch (error) {
    console.error('Error updating waitlist entry:', error);
    return NextResponse.json(
      { error: 'Failed to update waitlist entry' },
      { status: 500 }
    );
  }
}

// DELETE a waitlist entry (admin only)
export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Check if user is admin
    if (!await isAdmin()) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const waitlistEntry = await Waitlist.findByIdAndDelete(context.params.id);

    if (!waitlistEntry) {
      return NextResponse.json(
        { error: 'Waitlist entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Waitlist entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting waitlist entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete waitlist entry' },
      { status: 500 }
    );
  }
}
