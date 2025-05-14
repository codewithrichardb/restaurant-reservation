import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/mongodb';
import Reservation from '@/models/Reservation';
import { authOptions } from '../../auth/[...nextauth]/route';
import { sendEmail } from '@/lib/emailService';

// GET /api/reservations/[id] - Get a specific reservation
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const id = context.params.id;

    await dbConnect();

    const reservation = await Reservation.findById(id);

    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }

    // Check if user is authorized to view this reservation
    if (
      session?.user.role !== 'admin' &&
      reservation.email !== session?.user.email
    ) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json(reservation);
  } catch (error) {
    console.error('Error fetching reservation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reservation' },
      { status: 500 }
    );
  }
}

// PATCH /api/reservations/[id] - Update a reservation
export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const id = context.params.id;
    const body = await req.json();

    await dbConnect();

    const reservation = await Reservation.findById(id);

    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }

    // Check if user is authorized to update this reservation
    if (
      session?.user.role !== 'admin' &&
      reservation.email !== session?.user.email
    ) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // If not admin, only allow updating status to 'cancelled'
    if (session?.user.role !== 'admin' && body.status && body.status !== 'cancelled') {
      return NextResponse.json(
        { error: 'Unauthorized to change status to anything other than cancelled' },
        { status: 403 }
      );
    }

    // Store the original status before updating
    const originalStatus = reservation.status;

    // Update the reservation
    const updatedReservation = await Reservation.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );

    // Send email notifications based on status change
    if (updatedReservation && body.status && body.status !== originalStatus) {
      try {
        // Send confirmation email
        if (body.status === 'confirmed') {
          await sendEmail(
            updatedReservation.email,
            'reservationConfirmed',
            updatedReservation
          );
          console.log(`Confirmation email sent to ${updatedReservation.email}`);
        }

        // Send cancellation email
        if (body.status === 'cancelled') {
          await sendEmail(
            updatedReservation.email,
            'reservationCancelled',
            updatedReservation
          );
          console.log(`Cancellation email sent to ${updatedReservation.email}`);
        }
      } catch (emailError) {
        console.error('Error sending notification email:', emailError);
        // Continue with the response even if email fails
      }
    }

    return NextResponse.json(updatedReservation);
  } catch (error) {
    console.error('Error updating reservation:', error);
    return NextResponse.json(
      { error: 'Failed to update reservation' },
      { status: 500 }
    );
  }
}

// DELETE /api/reservations/[id] - Delete a reservation (admin only)
export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const id = context.params.id;

    // Only admin can delete reservations
    if (session?.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    await dbConnect();

    const reservation = await Reservation.findByIdAndDelete(id);

    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Reservation deleted successfully' });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    return NextResponse.json(
      { error: 'Failed to delete reservation' },
      { status: 500 }
    );
  }
}
