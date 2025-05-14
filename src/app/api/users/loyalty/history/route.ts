import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Reservation from '@/models/Reservation';

// GET user's loyalty points history
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    // Find user by email
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Get user's reservations (which contribute to loyalty points)
    const reservations = await Reservation.find({ 
      user: user._id,
      status: 'confirmed'
    }).sort({ date: -1 });
    
    // Create loyalty history entries
    const loyaltyHistory = [];
    
    // Add reservation entries (10 points per visit)
    for (const reservation of reservations) {
      loyaltyHistory.push({
        date: reservation.date,
        points: 10,
        type: 'reservation',
        description: `Reservation on ${reservation.date} at ${reservation.timeSlot}`,
        reference: reservation._id
      });
    }
    
    // Add feedback entries (5 points per feedback)
    for (const reservation of reservations) {
      if (reservation.feedback && reservation.feedback.rating) {
        loyaltyHistory.push({
          date: reservation.feedback.submittedAt || reservation.date,
          points: 5,
          type: 'feedback',
          description: `Feedback for reservation on ${reservation.date}`,
          reference: reservation._id
        });
      }
    }
    
    // Sort by date (newest first)
    loyaltyHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return NextResponse.json(loyaltyHistory);
  } catch (error) {
    console.error('Error fetching loyalty history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loyalty history' },
      { status: 500 }
    );
  }
}
