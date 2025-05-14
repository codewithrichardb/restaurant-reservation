import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import TimeSlot from '@/models/TimeSlot';

// Helper function to check if user is admin
async function isAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) return false;

  const userRole = session.user?.role;
  return userRole === 'admin' || (userRole && String(userRole).toLowerCase() === 'admin');
}

// GET a single time slot
export async function GET(
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

    const timeSlot = await TimeSlot.findById(context.params.id);

    if (!timeSlot) {
      return NextResponse.json(
        { error: 'Time slot not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(timeSlot);
  } catch (error) {
    console.error('Error fetching time slot:', error);
    return NextResponse.json(
      { error: 'Failed to fetch time slot' },
      { status: 500 }
    );
  }
}

// PATCH update a time slot
export async function PATCH(
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

    const data = await req.json();

    const timeSlot = await TimeSlot.findById(context.params.id);

    if (!timeSlot) {
      return NextResponse.json(
        { error: 'Time slot not found' },
        { status: 404 }
      );
    }

    // Update time slot
    if (data.time !== undefined) timeSlot.time = data.time;
    if (data.maxReservations !== undefined) timeSlot.maxReservations = data.maxReservations;

    await timeSlot.save();

    return NextResponse.json(timeSlot);
  } catch (error) {
    console.error('Error updating time slot:', error);
    return NextResponse.json(
      { error: 'Failed to update time slot' },
      { status: 500 }
    );
  }
}

// DELETE a time slot
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

    const timeSlot = await TimeSlot.findByIdAndDelete(context.params.id);

    if (!timeSlot) {
      return NextResponse.json(
        { error: 'Time slot not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Time slot deleted successfully' });
  } catch (error) {
    console.error('Error deleting time slot:', error);
    return NextResponse.json(
      { error: 'Failed to delete time slot' },
      { status: 500 }
    );
  }
}
