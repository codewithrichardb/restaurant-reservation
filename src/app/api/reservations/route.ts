import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/mongodb';
import Reservation from '@/models/Reservation';
import { authOptions } from '../auth/[...nextauth]/route';

// GET /api/reservations - Get all reservations (admin only) or user's reservations
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const status = searchParams.get('status');

    let query: any = {};

    // If not admin, only show user's reservations
    if (session.user.role !== 'admin') {
      query.email = session.user.email;
    }

    // Add date filter if provided
    if (date) {
      query.date = date;
    }

    // Add status filter if provided
    if (status && status !== 'all') {
      query.status = status;
    }

    const reservations = await Reservation.find(query).sort({ date: 1, timeSlot: 1 });

    return NextResponse.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reservations' },
      { status: 500 }
    );
  }
}

// POST /api/reservations - Create a new reservation
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

    await dbConnect();

    // Create the reservation
    const reservation = await Reservation.create({
      ...body,
      // If user is logged in, associate the reservation with their email
      email: session?.user?.email || body.email,
      // If user is logged in, associate the reservation with their user ID
      user: session?.user?.id || undefined,
      // Set default values for new fields
      specialOccasion: body.specialOccasion || '',
      occasionDetails: body.occasionDetails || '',
      preOrders: body.preOrders || [],
      loyaltyPoints: 0,
    });

    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    console.error('Error creating reservation:', error);
    return NextResponse.json(
      { error: 'Failed to create reservation' },
      { status: 500 }
    );
  }
}
