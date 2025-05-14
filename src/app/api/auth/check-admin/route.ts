import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ 
        isAuthenticated: false,
        isAdmin: false,
        message: 'Not authenticated'
      });
    }
    
    await dbConnect();
    
    // Get the user from the database to verify their role
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ 
        isAuthenticated: true,
        isAdmin: false,
        message: 'User not found in database'
      });
    }
    
    return NextResponse.json({
      isAuthenticated: true,
      isAdmin: user.role === 'admin',
      sessionRole: session.user.role,
      databaseRole: user.role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return NextResponse.json(
      { error: 'Failed to check admin status' },
      { status: 500 }
    );
  }
}
