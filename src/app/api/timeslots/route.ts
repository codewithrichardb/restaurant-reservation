import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/mongodb';
import TimeSlot from '@/models/TimeSlot';
import Reservation from '@/models/Reservation';
import { authOptions } from '../auth/[...nextauth]/route';

// GET /api/timeslots - Get all time slots with availability for a specific date
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    // Get all time slots
    const timeSlots = await TimeSlot.find().sort({ time: 1 });

    // Get all reservations for the specified date that are not cancelled
    const reservations = await Reservation.find({
      date,
      status: { $ne: 'cancelled' },
    });

    // Calculate availability for each time slot
    const availableTimeSlots = timeSlots.map(slot => {
      const reservationsForSlot = reservations.filter(
        res => res.timeSlot === slot.time
      );

      return {
        _id: slot._id,
        time: slot.time,
        available: reservationsForSlot.length < slot.maxReservations,
        maxReservations: slot.maxReservations
      };
    });

    return NextResponse.json(availableTimeSlots);
  } catch (error) {
    console.error('Error fetching time slots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch time slots' },
      { status: 500 }
    );
  }
}

// POST /api/timeslots - Create a new time slot (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Only admin can create time slots
    if (session?.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await req.json();

    await dbConnect();

    // Create the time slot
    const timeSlot = await TimeSlot.create(body);

    return NextResponse.json(timeSlot, { status: 201 });
  } catch (error) {
    console.error('Error creating time slot:', error);
    return NextResponse.json(
      { error: 'Failed to create time slot' },
      { status: 500 }
    );
  }
}
