'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchReservationById, updateReservationStatus } from '@/api/reservations';

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const reservationId = searchParams.get('id');

  // Fetch reservation data
  const { data: reservation, isLoading, error } = useQuery({
    queryKey: ['reservation', reservationId],
    queryFn: () => reservationId ? fetchReservationById(reservationId) : Promise.reject('No reservation ID'),
    enabled: !!reservationId,
    retry: false,
    onError: () => {
      router.push('/reserve');
    }
  });

  // Cancel reservation mutation
  const cancelMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: 'cancelled' }) =>
      updateReservationStatus(id, status),
    onSuccess: () => {
      // Invalidate and refetch reservation
      queryClient.invalidateQueries({ queryKey: ['reservation', reservationId] });
    }
  });

  // Handle cancellation
  const handleCancel = () => {
    if (reservation) {
      if (confirm('Are you sure you want to cancel this reservation? A confirmation email will be sent to you.')) {
        cancelMutation.mutate({ id: reservation._id, status: 'cancelled' });
      }
    }
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
          Reservation not found. Please try making a new reservation.
        </div>
        <Link href="/reserve" className="btn btn-primary">
          Make a Reservation
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              {reservation.status === 'cancelled' ? (
                <div className="text-center mb-4">
                  <div className="display-1 text-danger mb-3">
                    <i className="bi bi-x-circle"></i>
                  </div>
                  <h2 className="font-serif mb-3">Reservation Cancelled</h2>
                  <p className="text-muted">
                    Your reservation has been cancelled successfully.
                  </p>
                </div>
              ) : (
                <div className="text-center mb-4">
                  <div className="display-1 text-success mb-3">
                    <i className="bi bi-check-circle"></i>
                  </div>
                  <h2 className="font-serif mb-3">Reservation Confirmed!</h2>
                  <p className="text-muted">
                    Thank you for choosing Gourmet Haven. We look forward to serving you.
                  </p>
                </div>
              )}

              <div className="card bg-light mb-4">
                <div className="card-body">
                  <h3 className="card-title font-serif mb-3">Reservation Details</h3>
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item bg-transparent d-flex justify-content-between">
                      <span className="fw-bold">Reservation ID:</span>
                      <span>{reservation._id.substring(0, 8)}</span>
                    </li>
                    <li className="list-group-item bg-transparent d-flex justify-content-between">
                      <span className="fw-bold">Status:</span>
                      <span>
                        {reservation.status === 'pending' && (
                          <span className="badge bg-warning">Pending</span>
                        )}
                        {reservation.status === 'confirmed' && (
                          <span className="badge bg-success">Confirmed</span>
                        )}
                        {reservation.status === 'cancelled' && (
                          <span className="badge bg-danger">Cancelled</span>
                        )}
                      </span>
                    </li>
                    <li className="list-group-item bg-transparent d-flex justify-content-between">
                      <span className="fw-bold">Date:</span>
                      <span>{format(parseISO(reservation.date), 'MMMM d, yyyy')}</span>
                    </li>
                    <li className="list-group-item bg-transparent d-flex justify-content-between">
                      <span className="fw-bold">Time:</span>
                      <span>{reservation.timeSlot}</span>
                    </li>
                    <li className="list-group-item bg-transparent d-flex justify-content-between">
                      <span className="fw-bold">Party Size:</span>
                      <span>{reservation.partySize} {reservation.partySize === 1 ? 'person' : 'people'}</span>
                    </li>
                    <li className="list-group-item bg-transparent d-flex justify-content-between">
                      <span className="fw-bold">Name:</span>
                      <span>{reservation.name}</span>
                    </li>
                    <li className="list-group-item bg-transparent d-flex justify-content-between">
                      <span className="fw-bold">Email:</span>
                      <span>{reservation.email}</span>
                    </li>
                    <li className="list-group-item bg-transparent d-flex justify-content-between">
                      <span className="fw-bold">Phone:</span>
                      <span>{reservation.phone}</span>
                    </li>
                    {reservation.specialRequests && (
                      <li className="list-group-item bg-transparent">
                        <span className="fw-bold">Special Requests:</span>
                        <p className="mb-0 mt-1">{reservation.specialRequests}</p>
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="d-flex gap-3 justify-content-center">
                <Link href="/" className="btn btn-outline-secondary">
                  Return to Home
                </Link>

                {reservation.status !== 'cancelled' && (
                  <button
                    className="btn btn-danger"
                    onClick={handleCancel}
                  >
                    Cancel Reservation
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
