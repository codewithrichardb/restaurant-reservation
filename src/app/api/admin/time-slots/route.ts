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

// GET all time slots
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
    
    // Get all time slots
    const timeSlots = await TimeSlot.find({}).sort({ time: 1 });
    
    return NextResponse.json(timeSlots);
  } catch (error) {
    console.error('Error fetching time slots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch time slots' },
      { status: 500 }
    );
  }
}

// POST create a new time slot
export async function POST(req: NextRequest) {
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
    
    // Validate required fields
    if (!data.time) {
      return NextResponse.json(
        { error: 'Time is required' },
        { status: 400 }
      );
    }
    
    // Check if time slot already exists
    const existingTimeSlot = await TimeSlot.findOne({ time: data.time });
    if (existingTimeSlot) {
      return NextResponse.json(
        { error: 'Time slot already exists' },
        { status: 400 }
      );
    }
    
    // Create new time slot
    const timeSlot = await TimeSlot.create({
      time: data.time,
      maxReservations: data.maxReservations || 4,
    });
    
    return NextResponse.json(timeSlot, { status: 201 });
  } catch (error) {
    console.error('Error creating time slot:', error);
    return NextResponse.json(
      { error: 'Failed to create time slot' },
      { status: 500 }
    );
  }
}
