import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';

// API route to check database connection status
export async function GET() {
  try {
    const mongoose = await dbConnect();
    
    // Check if we have a real connection or a mock
    const readyState = mongoose.connection?.readyState;
    const isMock = !mongoose.connection?.db;
    
    return NextResponse.json({
      status: 'ok',
      database: {
        connected: readyState === 1,
        readyState: readyState,
        isMock: isMock,
      },
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    console.error('Error checking database status:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to check database status',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    }, { status: 500 });
  }
}
