import { NextRequest, NextResponse } from 'next/server';
import { addDays, format, parseISO } from 'date-fns';
import dbConnect from '@/lib/mongodb';
import Reservation from '@/models/Reservation';
import { sendEmail } from '@/lib/emailService';

// This endpoint should be called by a cron job once a day
export async function GET(req: NextRequest) {
  try {
    // Check for API key for security (in a real app, you'd use a more secure method)
    const apiKey = req.nextUrl.searchParams.get('apiKey');
    const expectedApiKey = process.env.CRON_API_KEY || 'your-secret-api-key';
    
    if (apiKey !== expectedApiKey) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    // Get tomorrow's date in YYYY-MM-DD format
    const tomorrow = addDays(new Date(), 1);
    const tomorrowFormatted = format(tomorrow, 'yyyy-MM-dd');
    
    // Find all confirmed reservations for tomorrow
    const reservations = await Reservation.find({
      date: tomorrowFormatted,
      status: 'confirmed'
    });
    
    console.log(`Found ${reservations.length} reservations for tomorrow (${tomorrowFormatted})`);
    
    // Send reminder emails
    const results = await Promise.allSettled(
      reservations.map(async (reservation) => {
        try {
          await sendEmail(
            reservation.email,
            'reservationReminder',
            reservation
          );
          return { id: reservation._id, success: true };
        } catch (error) {
          console.error(`Failed to send reminder for reservation ${reservation._id}:`, error);
          return { id: reservation._id, success: false, error };
        }
      })
    );
    
    // Count successes and failures
    const successful = results.filter(r => r.status === 'fulfilled' && (r.value as any).success).length;
    const failed = results.length - successful;
    
    return NextResponse.json({
      message: `Sent ${successful} reminder emails, ${failed} failed`,
      date: tomorrowFormatted,
      totalReservations: reservations.length,
      successful,
      failed
    });
  } catch (error) {
    console.error('Error sending reminder emails:', error);
    return NextResponse.json(
      { error: 'Failed to send reminder emails' },
      { status: 500 }
    );
  }
}
