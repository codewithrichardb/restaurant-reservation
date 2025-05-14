import { NextResponse } from 'next/server';

// Simple health check endpoint that doesn't require database access
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
}
