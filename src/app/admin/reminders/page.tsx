'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { format, addDays } from 'date-fns';

export default function RemindersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  // State for API response
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check if user is admin with more robust check
  const isAdmin = session?.user?.role === 'admin' || 
                 (session?.user?.role && String(session?.user?.role).toLowerCase() === 'admin');
  
  // Redirect if not admin
  if (status === 'authenticated' && !isAdmin) {
    router.push('/');
  }
  
  // Get tomorrow's date for display
  const tomorrow = addDays(new Date(), 1);
  const tomorrowFormatted = format(tomorrow, 'EEEE, MMMM d, yyyy');
  
  // Handle sending reminders manually
  const handleSendReminders = async () => {
    if (!confirm(`Send reminder emails for all confirmed reservations on ${tomorrowFormatted}?`)) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get the API key from environment
      const apiKey = process.env.NEXT_PUBLIC_CRON_API_KEY || 'your-secret-api-key';
      
      // Call the API endpoint
      const response = await fetch(`/api/cron/send-reminders?apiKey=${apiKey}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reminders');
      }
      
      setApiResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (status === 'loading') {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-5">
      <h1 className="font-serif mb-4">Reservation Reminders</h1>
      
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Send Reminder Emails</h5>
        </div>
        <div className="card-body">
          <p>
            Reminder emails are automatically sent to customers with confirmed reservations one day before their reservation date.
          </p>
          <p>
            <strong>Next scheduled reminders:</strong> For reservations on {tomorrowFormatted}
          </p>
          
          <button
            className="btn btn-primary mt-3"
            onClick={handleSendReminders}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Sending Reminders...
              </>
            ) : (
              'Send Reminders Manually'
            )}
          </button>
          
          {error && (
            <div className="alert alert-danger mt-3">
              {error}
            </div>
          )}
          
          {apiResponse && (
            <div className="alert alert-success mt-3">
              <h6 className="alert-heading">Reminders Sent!</h6>
              <p>Date: {apiResponse.date}</p>
              <p>Total Reservations: {apiResponse.totalReservations}</p>
              <p>Successfully Sent: {apiResponse.successful}</p>
              <p>Failed: {apiResponse.failed}</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">About Automated Reminders</h5>
        </div>
        <div className="card-body">
          <h6>How It Works</h6>
          <p>
            Our system automatically sends reminder emails to customers with confirmed reservations one day before their scheduled date.
            This helps reduce no-shows and allows customers to make any last-minute changes if needed.
          </p>
          
          <h6>Reminder Schedule</h6>
          <p>
            Reminders are sent automatically once per day for the next day's reservations.
            If you need to send reminders manually, you can use the button above.
          </p>
          
          <h6>Setting Up Automated Reminders</h6>
          <p>
            For production environments, you should set up a cron job or scheduled task to call the reminder API endpoint daily:
          </p>
          <pre className="bg-light p-3 rounded">
            <code>
              # Call the reminder API endpoint daily at 10:00 AM<br/>
              0 10 * * * curl -X GET "https://yourdomain.com/api/cron/send-reminders?apiKey=your-secret-api-key"
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}
