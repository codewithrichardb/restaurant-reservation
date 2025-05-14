import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Table from '@/models/Table';

// Helper function to check if user is admin
async function isAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) return false;
  
  const userRole = session.user?.role;
  return userRole === 'admin' || (userRole && String(userRole).toLowerCase() === 'admin');
}

// GET all tables
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // Get all tables
    const tables = await Table.find({}).sort({ tableNumber: 1 });
    
    return NextResponse.json(tables);
  } catch (error) {
    console.error('Error fetching tables:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tables' },
      { status: 500 }
    );
  }
}

// POST create a new table (admin only)
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
    if (!data.tableNumber || !data.capacity || !data.location) {
      return NextResponse.json(
        { error: 'Table number, capacity, and location are required' },
        { status: 400 }
      );
    }
    
    // Check if table number already exists
    const existingTable = await Table.findOne({ tableNumber: data.tableNumber });
    if (existingTable) {
      return NextResponse.json(
        { error: 'Table number already exists' },
        { status: 400 }
      );
    }
    
    // Create new table
    const table = await Table.create({
      tableNumber: data.tableNumber,
      capacity: data.capacity,
      location: data.location,
      isActive: data.isActive !== undefined ? data.isActive : true,
    });
    
    return NextResponse.json(table, { status: 201 });
  } catch (error) {
    console.error('Error creating table:', error);
    return NextResponse.json(
      { error: 'Failed to create table' },
      { status: 500 }
    );
  }
}
