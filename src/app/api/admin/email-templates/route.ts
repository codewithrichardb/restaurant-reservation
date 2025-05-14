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

// GET all email templates (admin only)
export async function GET() {
  try {
    // Check if user is admin
    if (!await isAdmin()) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    
    // Get all templates
    const templates = await EmailTemplate.find().sort({ type: 1 });
    
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching email templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email templates' },
      { status: 500 }
    );
  }
}

// POST create a new email template (admin only)
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
    if (!data.type || !data.subject || !data.body) {
      return NextResponse.json(
        { error: 'Type, subject, and body are required' },
        { status: 400 }
      );
    }
    
    // Check if template with this type already exists
    const existingTemplate = await EmailTemplate.findOne({ type: data.type });
    
    if (existingTemplate) {
      return NextResponse.json(
        { error: `Template with type '${data.type}' already exists` },
        { status: 400 }
      );
    }
    
    // Create new template
    const template = new EmailTemplate({
      type: data.type,
      subject: data.subject,
      body: data.body,
      isActive: data.isActive !== undefined ? data.isActive : true,
    });
    
    await template.save();
    
    return NextResponse.json(template);
  } catch (error) {
    console.error('Error creating email template:', error);
    return NextResponse.json(
      { error: 'Failed to create email template' },
      { status: 500 }
    );
  }
}
