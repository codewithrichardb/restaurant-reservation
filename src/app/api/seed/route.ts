import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import TimeSlot from '@/models/TimeSlot';
import Reservation from '@/models/Reservation';
import { defaultTimeSlots } from '@/utils/defaultTimeSlots';

// POST /api/seed - Seed the database with initial data
export async function POST(req: NextRequest) {
  try {
    // Only allow in development environment
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Seeding is not allowed in production' },
        { status: 403 }
      );
    }

    await dbConnect();

    // Create admin user if it doesn't exist
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const adminUser = await User.create({
        name: 'Admin User',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
      });
      console.log('Admin user created:', adminUser);
    } else {
      // Ensure existing admin has the correct role
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('Updated existing user to admin role');
      }
    }

    // Seed time slots
    await TimeSlot.deleteMany({});

    for (const slot of defaultTimeSlots) {
      await TimeSlot.create(slot);
    }
    console.log('Time slots seeded');

    return NextResponse.json({
      message: 'Database seeded successfully',
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    );
  }
}
