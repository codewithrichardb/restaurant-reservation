'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchReservationById, submitFeedback } from '@/api/reservations';
import { format, parseISO } from 'date-fns';

export default function FeedbackPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [success, setSuccess] = useState(false);
  
  // Fetch reservation details
  const { data: reservation, isLoading, error } = useQuery({
    queryKey: ['reservation', params.id],
    queryFn: () => fetchReservationById(params.id),
    retry: false,
    onError: () => {
      router.push('/');
    }
  });
  
  // Submit feedback mutation
  const feedbackMutation = useMutation({
    mutationFn: () => submitFeedback(params.id, { rating, comment }),
    onSuccess: () => {
      setSuccess(true);
      // Redirect after 3 seconds
      setTimeout(() => {
        router.push('/');
      }, 3000);
    },
  });
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    
    feedbackMutation.mutate();
  };
  
  if (isLoading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  if (error || !reservation) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          Reservation not found or you don't have permission to access it.
        </div>
        <Link href="/" className="btn btn-primary">
          Return to Home
        </Link>
      </div>
    );
  }
  
  // Check if feedback already submitted
  if (reservation.feedback?.rating) {
    return (
      <div className="container py-5">
        <div className="alert alert-info">
          You've already submitted feedback for this reservation. Thank you!
        </div>
        <Link href="/" className="btn btn-primary">
          Return to Home
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h1 className="card-title font-serif text-center mb-4">Share Your Experience</h1>
              
              {success ? (
                <div className="text-center py-4">
                  <div className="mb-4">
                    <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
                  </div>
                  <h3 className="mb-3">Thank you for your feedback!</h3>
                  <p className="mb-4">We appreciate you taking the time to share your experience.</p>
                  <p className="mb-4">You've earned 5 loyalty points!</p>
                  <Link href="/" className="btn btn-primary">
                    Return to Home
                  </Link>
                </div>
              ) : (
                <>
                  <div className="alert alert-light mb-4">
                    <h5>Reservation Details</h5>
                    <p className="mb-1">
                      <strong>Date:</strong> {format(parseISO(reservation.date), 'EEEE, MMMM d, yyyy')}
                    </p>
                    <p className="mb-1">
                      <strong>Time:</strong> {reservation.timeSlot}
                    </p>
                    <p className="mb-0">
                      <strong>Party Size:</strong> {reservation.partySize} {reservation.partySize === 1 ? 'person' : 'people'}
                    </p>
                  </div>
                  
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label className="form-label">How would you rate your experience?</label>
                      <div className="d-flex justify-content-center mb-3">
                        <div className="star-rating">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`star fs-1 ${star <= (hoverRating || rating) ? 'text-warning' : 'text-muted'}`}
                              onClick={() => setRating(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              style={{ cursor: 'pointer' }}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      {rating > 0 && (
                        <div className="text-center mb-3">
                          <span className="badge bg-primary">
                            {rating === 1 ? 'Poor' : 
                             rating === 2 ? 'Fair' : 
                             rating === 3 ? 'Good' : 
                             rating === 4 ? 'Very Good' : 
                             'Excellent'}
                          </span>
                        </div>
                      )}
                      {rating === 0 && (
                        <div className="text-danger text-center">Please select a rating</div>
                      )}
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="comment" className="form-label">Comments (Optional)</label>
                      <textarea
                        className="form-control"
                        id="comment"
                        rows={4}
                        placeholder="Tell us about your experience..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      ></textarea>
                    </div>
                    
                    <div className="d-grid gap-2">
                      <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        disabled={rating === 0 || feedbackMutation.isPending}
                      >
                        {feedbackMutation.isPending ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Submitting...
                          </>
                        ) : (
                          'Submit Feedback'
                        )}
                      </button>
                      <Link href="/" className="btn btn-outline-secondary">
                        Cancel
                      </Link>
                    </div>
                    
                    {feedbackMutation.isError && (
                      <div className="alert alert-danger mt-3">
                        Error submitting feedback. Please try again.
                      </div>
                    )}
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
