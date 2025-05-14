import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Reservation from '@/models/Reservation';
import User from '@/models/User';
import Waitlist from '@/models/Waitlist';

// Helper function to check if user is admin
async function isAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) return false;
  
  const userRole = session.user?.role;
  return userRole === 'admin' || (userRole && String(userRole).toLowerCase() === 'admin');
}

// GET analytics data (admin only)
export async function GET(req: NextRequest) {
  try {
    // Check if user is admin
    if (!await isAdmin()) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    
    // Get query parameters for date range
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Build date range query
    const dateQuery: any = {};
    if (startDate) {
      dateQuery.date = { $gte: startDate };
    }
    if (endDate) {
      dateQuery.date = { ...dateQuery.date, $lte: endDate };
    }
    
    // Get reservation counts by status
    const reservationCounts = await Reservation.aggregate([
      { $match: dateQuery },
      { $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get total reservations
    const totalReservations = await Reservation.countDocuments(dateQuery);
    
    // Get average party size
    const avgPartySizeResult = await Reservation.aggregate([
      { $match: dateQuery },
      { $group: {
          _id: null,
          avgPartySize: { $avg: '$partySize' }
        }
      }
    ]);
    const avgPartySize = avgPartySizeResult.length > 0 ? avgPartySizeResult[0].avgPartySize : 0;
    
    // Get busiest day
    const busiestDayResult = await Reservation.aggregate([
      { $match: dateQuery },
      { $group: {
          _id: '$date',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);
    const busiestDay = busiestDayResult.length > 0 ? busiestDayResult[0]._id : null;
    
    // Get busiest time slot
    const busiestTimeResult = await Reservation.aggregate([
      { $match: dateQuery },
      { $group: {
          _id: '$timeSlot',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);
    const busiestTime = busiestTimeResult.length > 0 ? busiestTimeResult[0]._id : null;
    
    // Get average feedback rating
    const avgRatingResult = await Reservation.aggregate([
      { $match: { ...dateQuery, 'feedback.rating': { $exists: true } } },
      { $group: {
          _id: null,
          avgRating: { $avg: '$feedback.rating' }
        }
      }
    ]);
    const avgRating = avgRatingResult.length > 0 ? avgRatingResult[0].avgRating : 0;
    
    // Get total users
    const totalUsers = await User.countDocuments();
    
    // Get current waitlist count
    const currentWaitlist = await Waitlist.countDocuments({ status: 'waiting' });
    
    // Format the response
    const statusCounts = {};
    reservationCounts.forEach(item => {
      statusCounts[item._id] = item.count;
    });
    
    return NextResponse.json({
      totalReservations,
      statusCounts,
      avgPartySize,
      busiestDay,
      busiestTime,
      avgRating,
      totalUsers,
      currentWaitlist,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
