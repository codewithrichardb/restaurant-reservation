import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Reservation from '@/models/Reservation';
import Table from '@/models/Table';

// Helper function to check if user is admin
async function isAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) return false;

  const userRole = session.user?.role;
  return userRole === 'admin' || (userRole && String(userRole).toLowerCase() === 'admin');
}

// PATCH assign a table to a reservation
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is admin
    if (!await isAdmin()) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { id } = params;
    const { tableId } = await req.json();

    // Validate tableId
    if (!tableId) {
      return NextResponse.json(
        { error: 'Table ID is required' },
        { status: 400 }
      );
    }

    // Find the reservation
    const reservation = await Reservation.findById(id);

    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }

    // Find the table
    const table = await Table.findById(tableId);

    if (!table) {
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 404 }
      );
    }

    // Check if table is active
    if (!table.isActive) {
      return NextResponse.json(
        { error: 'Table is not active' },
        { status: 400 }
      );
    }

    // Check if table has enough capacity
    if (table.capacity < reservation.partySize) {
      return NextResponse.json(
        { error: 'Table does not have enough capacity for this reservation' },
        { status: 400 }
      );
    }

    // Assign table to reservation
    reservation.table = tableId;
    await reservation.save();

    return NextResponse.json({
      message: 'Table assigned successfully',
      reservation,
    });
  } catch (error) {
    console.error('Error assigning table:', error);
    return NextResponse.json(
      { error: 'Failed to assign table' },
      { status: 500 }
    );
  }
}
