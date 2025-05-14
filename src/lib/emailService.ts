import nodemailer from 'nodemailer';
import { Reservation } from '@/types';
import { format, parseISO } from 'date-fns';

// Create a transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.example.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || 'user@example.com',
    pass: process.env.EMAIL_PASSWORD || 'password',
  },
});

// Email templates
const emailTemplates = {
  reservationConfirmed: (reservation: Reservation) => {
    const formattedDate = format(parseISO(reservation.date), 'EEEE, MMMM d, yyyy');

    return {
      subject: 'Your Reservation is Confirmed!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #4a6741; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Gourmet Haven</h1>
          </div>

          <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
            <h2>Your Reservation is Confirmed!</h2>

            <p>Dear ${reservation.name},</p>

            <p>We're excited to confirm your reservation at Gourmet Haven. Here are the details:</p>

            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Date:</strong> ${formattedDate}</p>
              <p><strong>Time:</strong> ${reservation.timeSlot}</p>
              <p><strong>Party Size:</strong> ${reservation.partySize} people</p>
              <p><strong>Reservation ID:</strong> ${reservation._id}</p>
            </div>

            <p>If you need to make any changes to your reservation, please contact us at least 24 hours in advance.</p>

            <p>We look forward to serving you!</p>

            <p>Best regards,<br>The Gourmet Haven Team</p>
          </div>

          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
            <p>123 Culinary Street, Foodville, FC 12345<br>
            Phone: (555) 123-4567 | Email: info@gourmethaven.com</p>
          </div>
        </div>
      `,
    };
  },

  reservationCancelled: (reservation: Reservation) => {
    const formattedDate = format(parseISO(reservation.date), 'EEEE, MMMM d, yyyy');

    return {
      subject: 'Your Reservation has been Cancelled',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #4a6741; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Gourmet Haven</h1>
          </div>

          <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
            <h2>Reservation Cancelled</h2>

            <p>Dear ${reservation.name},</p>

            <p>Your reservation at Gourmet Haven has been cancelled as requested. Here are the details of the cancelled reservation:</p>

            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Date:</strong> ${formattedDate}</p>
              <p><strong>Time:</strong> ${reservation.timeSlot}</p>
              <p><strong>Party Size:</strong> ${reservation.partySize} people</p>
              <p><strong>Reservation ID:</strong> ${reservation._id}</p>
            </div>

            <p>We hope to see you at Gourmet Haven another time. If you'd like to make a new reservation, please visit our website.</p>

            <p>Best regards,<br>The Gourmet Haven Team</p>
          </div>

          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
            <p>123 Culinary Street, Foodville, FC 12345<br>
            Phone: (555) 123-4567 | Email: info@gourmethaven.com</p>
          </div>
        </div>
      `,
    };
  },

  reservationReminder: (reservation: Reservation) => {
    const formattedDate = format(parseISO(reservation.date), 'EEEE, MMMM d, yyyy');

    return {
      subject: 'Reminder: Your Reservation Tomorrow at Gourmet Haven',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #4a6741; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Gourmet Haven</h1>
          </div>

          <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
            <h2>Reservation Reminder</h2>

            <p>Dear ${reservation.name},</p>

            <p>This is a friendly reminder about your reservation at Gourmet Haven tomorrow. We're looking forward to serving you!</p>

            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Date:</strong> ${formattedDate}</p>
              <p><strong>Time:</strong> ${reservation.timeSlot}</p>
              <p><strong>Party Size:</strong> ${reservation.partySize} people</p>
              <p><strong>Reservation ID:</strong> ${reservation._id}</p>
            </div>

            <p>If you need to make any changes to your reservation, please contact us as soon as possible.</p>

            <p>We look forward to welcoming you to Gourmet Haven!</p>

            <p>Best regards,<br>The Gourmet Haven Team</p>
          </div>

          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
            <p>123 Culinary Street, Foodville, FC 12345<br>
            Phone: (555) 123-4567 | Email: info@gourmethaven.com</p>
          </div>
        </div>
      `,
    };
  },
};

// Send email function
export async function sendEmail(to: string, template: keyof typeof emailTemplates, data: any) {
  try {
    const { subject, html } = emailTemplates[template](data);

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Gourmet Haven <noreply@gourmethaven.com>',
      to,
      subject,
      html,
    };

    // Check if we're in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('Email would be sent in production:');
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('Body:', html);
      return true;
    }

    // Send email in production
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}
