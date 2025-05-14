import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import EmailTemplate from '@/models/EmailTemplate';

// Helper function to check if user is admin
async function isAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) return false;

  const userRole = session.user?.role;
  return userRole === 'admin' || (userRole && String(userRole).toLowerCase() === 'admin');
}

// GET a specific email template by ID (admin only)
export async function GET(
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

    const { id } = context.params;

    // Find template by ID
    const template = await EmailTemplate.findById(id);

    if (!template) {
      return NextResponse.json(
        { error: 'Email template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error fetching email template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email template' },
      { status: 500 }
    );
  }
}

// PATCH update a specific email template (admin only)
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

    const { id } = context.params;
    const data = await req.json();

    // Find template by ID
    const template = await EmailTemplate.findById(id);

    if (!template) {
      return NextResponse.json(
        { error: 'Email template not found' },
        { status: 404 }
      );
    }

    // Update allowed fields
    const allowedFields = ['subject', 'body', 'isActive'];

    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        template[field] = data[field];
      }
    });

    // Update lastUpdated timestamp
    template.lastUpdated = new Date();

    await template.save();

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error updating email template:', error);
    return NextResponse.json(
      { error: 'Failed to update email template' },
      { status: 500 }
    );
  }
}

// DELETE a specific email template (admin only)
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

    const { id } = context.params;

    // Find and delete template
    const template = await EmailTemplate.findByIdAndDelete(id);

    if (!template) {
      return NextResponse.json(
        { error: 'Email template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Email template deleted successfully' });
  } catch (error) {
    console.error('Error deleting email template:', error);
    return NextResponse.json(
      { error: 'Failed to delete email template' },
      { status: 500 }
    );
  }
}
