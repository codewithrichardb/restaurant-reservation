import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import MenuItem from '@/models/MenuItem';

// Helper function to check if user is admin
async function isAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) return false;

  const userRole = session.user?.role;
  return userRole === 'admin' || (userRole && String(userRole).toLowerCase() === 'admin');
}

// GET a single menu item
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await dbConnect();

    const menuItem = await MenuItem.findById(context.params.id);

    if (!menuItem) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(menuItem);
  } catch (error) {
    console.error('Error fetching menu item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu item' },
      { status: 500 }
    );
  }
}

// PATCH update a menu item (admin only)
export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
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

    const data = await req.json();

    const menuItem = await MenuItem.findById(context.params.id);

    if (!menuItem) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }

    // Update menu item
    if (data.name !== undefined) menuItem.name = data.name;
    if (data.description !== undefined) menuItem.description = data.description;
    if (data.price !== undefined) menuItem.price = data.price;
    if (data.category !== undefined) menuItem.category = data.category;
    if (data.imageUrl !== undefined) menuItem.imageUrl = data.imageUrl;
    if (data.isAvailable !== undefined) menuItem.isAvailable = data.isAvailable;
    if (data.isPopular !== undefined) menuItem.isPopular = data.isPopular;
    if (data.allergens !== undefined) menuItem.allergens = data.allergens;
    if (data.dietaryInfo !== undefined) menuItem.dietaryInfo = data.dietaryInfo;

    await menuItem.save();

    return NextResponse.json(menuItem);
  } catch (error) {
    console.error('Error updating menu item:', error);
    return NextResponse.json(
      { error: 'Failed to update menu item' },
      { status: 500 }
    );
  }
}

// DELETE a menu item (admin only)
export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
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

    const menuItem = await MenuItem.findByIdAndDelete(context.params.id);

    if (!menuItem) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json(
      { error: 'Failed to delete menu item' },
      { status: 500 }
    );
  }
}
