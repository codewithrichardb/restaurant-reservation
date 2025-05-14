import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Waitlist from '@/models/Waitlist';

// GET all waitlist entries (admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === 'admin' || 
                   (session?.user?.role && String(session?.user?.role).toLowerCase() === 'admin');
    
    // Only admins can view all waitlist entries
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    
    // Get all waitlist entries
    const waitlistEntries = await Waitlist.find({})
      .sort({ createdAt: 1 }) // Sort by creation time (first come, first served)
      .populate('user', 'name email');
    
    return NextResponse.json(waitlistEntries);
  } catch (error) {
    console.error('Error fetching waitlist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch waitlist' },
      { status: 500 }
    );
  }
}

// POST create a new waitlist entry
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const data = await req.json();
    const session = await getServerSession(authOptions);
    
    // Validate required fields
    if (!data.name || !data.email || !data.phone || !data.partySize) {
      return NextResponse.json(
        { error: 'Name, email, phone, and party size are required' },
        { status: 400 }
      );
    }
    
    // Create waitlist entry
    const waitlistEntry = await Waitlist.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      partySize: data.partySize,
      estimatedWaitTime: data.estimatedWaitTime,
      status: 'waiting',
      notified: false,
      user: session?.user?.id, // Link to user if logged in
    });
    
    return NextResponse.json(waitlistEntry, { status: 201 });
  } catch (error) {
    console.error('Error creating waitlist entry:', error);
    return NextResponse.json(
      { error: 'Failed to create waitlist entry' },
      { status: 500 }
    );
  }
}
