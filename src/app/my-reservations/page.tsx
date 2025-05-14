'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchReservations, updateReservationStatus } from '@/api/reservations';
import { Reservation } from '@/types';

export default function MyReservationsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/my-reservations');
    }
  }, [status, router]);

  // Fetch reservations with React Query
  const { data: reservations = [], isLoading, error } = useQuery({
    queryKey: ['myReservations'],
    queryFn: () => fetchReservations(),
    enabled: status === 'authenticated',
  });

  // Cancel reservation mutation
  const cancelMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: 'cancelled' }) =>
      updateReservationStatus(id, status),
    onSuccess: () => {
      // Invalidate and refetch reservations
      queryClient.invalidateQueries({ queryKey: ['myReservations'] });
    }
  });

  // Filter reservations based on active tab
  const filteredReservations = reservations.filter(reservation => {
    const reservationDate = parseISO(reservation.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (activeTab === 'upcoming') {
      return reservationDate >= today && reservation.status !== 'cancelled';
    } else if (activeTab === 'past') {
      return reservationDate < today && reservation.status !== 'cancelled';
    } else {
      return reservation.status === 'cancelled';
    }
  });

  // Sort reservations by date (newest first for past, oldest first for upcoming)
  const sortedReservations = [...filteredReservations].sort((a, b) => {
    const dateA = parseISO(a.date);
    const dateB = parseISO(b.date);

    if (activeTab === 'past' || activeTab === 'cancelled') {
      return dateB.getTime() - dateA.getTime(); // Newest first
    } else {
      return dateA.getTime() - dateB.getTime(); // Oldest first
    }
  });

  // Handle reservation cancellation
  const handleCancel = (id: string) => {
    if (confirm('Are you sure you want to cancel this reservation? A confirmation email will be sent to you.')) {
      cancelMutation.mutate({ id, status: 'cancelled' });
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          Error loading reservations: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h1 className="font-serif mb-4">My Reservations</h1>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            Past
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'cancelled' ? 'active' : ''}`}
            onClick={() => setActiveTab('cancelled')}
          >
            Cancelled
          </button>
        </li>
      </ul>

      {sortedReservations.length === 0 ? (
        <div className="text-center py-5">
          <p className="mb-4">You don't have any {activeTab} reservations.</p>
          <Link href="/reserve" className="btn btn-primary">
            Make a Reservation
          </Link>
        </div>
      ) : (
        <div className="row">
          {sortedReservations.map((reservation) => (
            <div key={reservation._id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="card-title font-serif mb-0">
                      {format(parseISO(reservation.date), 'MMMM d, yyyy')}
                    </h5>
                    <span className={`badge ${
                      reservation.status === 'confirmed' ? 'bg-success' :
                      reservation.status === 'pending' ? 'bg-warning' : 'bg-danger'
                    }`}>
                      {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                    </span>
                  </div>

                  <ul className="list-group list-group-flush">
                    <li className="list-group-item px-0">
                      <i className="bi bi-clock me-2"></i>
                      {reservation.timeSlot}
                    </li>
                    <li className="list-group-item px-0">
                      <i className="bi bi-people me-2"></i>
                      {reservation.partySize} {reservation.partySize === 1 ? 'person' : 'people'}
                    </li>
                    {reservation.specialRequests && (
                      <li className="list-group-item px-0">
                        <i className="bi bi-chat-left-text me-2"></i>
                        {reservation.specialRequests}
                      </li>
                    )}
                  </ul>

                  {activeTab === 'upcoming' && (
                    <div className="mt-3">
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => handleCancel(reservation._id)}
                      >
                        Cancel Reservation
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
