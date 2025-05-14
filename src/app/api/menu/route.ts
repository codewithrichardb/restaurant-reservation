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

// GET all menu items
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // Get query parameters
    const category = req.nextUrl.searchParams.get('category');
    const available = req.nextUrl.searchParams.get('available');
    const popular = req.nextUrl.searchParams.get('popular');
    
    // Build query
    const query: any = {};
    
    if (category) {
      query.category = category;
    }
    
    if (available === 'true') {
      query.isAvailable = true;
    }
    
    if (popular === 'true') {
      query.isPopular = true;
    }
    
    // Get menu items
    const menuItems = await MenuItem.find(query).sort({ category: 1, name: 1 });
    
    return NextResponse.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu items' },
      { status: 500 }
    );
  }
}

// POST create a new menu item (admin only)
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
    if (!data.name || !data.description || data.price === undefined || !data.category) {
      return NextResponse.json(
        { error: 'Name, description, price, and category are required' },
        { status: 400 }
      );
    }
    
    // Check if menu item with same name already exists
    const existingItem = await MenuItem.findOne({ name: data.name });
    if (existingItem) {
      return NextResponse.json(
        { error: 'Menu item with this name already exists' },
        { status: 400 }
      );
    }
    
    // Create new menu item
    const menuItem = await MenuItem.create({
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      imageUrl: data.imageUrl,
      isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
      isPopular: data.isPopular || false,
      allergens: data.allergens || [],
      dietaryInfo: data.dietaryInfo || [],
    });
    
    return NextResponse.json(menuItem, { status: 201 });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json(
      { error: 'Failed to create menu item' },
      { status: 500 }
    );
  }
}
