import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Reservation from '@/models/Reservation';
import User from '@/models/User';

// POST submit feedback for a reservation
export async function POST(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = context.params;
    const data = await req.json();

    // Validate required fields
    if (!data.rating) {
      return NextResponse.json(
        { error: 'Rating is required' },
        { status: 400 }
      );
    }

    // Validate rating range
    if (data.rating < 1 || data.rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the reservation
    const reservation = await Reservation.findById(id);

    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }

    // Check if user is authorized to submit feedback
    // Either the user is the owner of the reservation or an admin
    const isAdmin = session?.user?.role === 'admin';
    const isOwner = session?.user?.email === reservation.email;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Add feedback to the reservation
    reservation.feedback = {
      rating: data.rating,
      comment: data.comment || '',
      submittedAt: new Date(),
    };

    await reservation.save();

    // If the user is logged in, add loyalty points for providing feedback
    if (session && reservation.user) {
      const user = await User.findById(reservation.user);
      if (user) {
        user.loyaltyPoints += 5; // 5 points for providing feedback
        await user.save();
      }
    }

    return NextResponse.json({
      message: 'Feedback submitted successfully',
      reservation,
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}
