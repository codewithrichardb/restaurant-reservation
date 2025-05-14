'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUserProfile, updateUserProfile, fetchUserReservations } from '@/api/users';
import { format, parseISO } from 'date-fns';

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  
  // Redirect if not logged in
  if (status === 'unauthenticated') {
    router.push('/login');
  }
  
  // Fetch user profile
  const { 
    data: userProfile, 
    isLoading: isLoadingProfile, 
    error: profileError 
  } = useQuery({
    queryKey: ['userProfile'],
    queryFn: fetchUserProfile,
    enabled: status === 'authenticated',
    onSuccess: (data) => {
      setName(data.name || '');
    }
  });
  
  // Fetch user reservations
  const { 
    data: userReservations = [], 
    isLoading: isLoadingReservations, 
    error: reservationsError 
  } = useQuery({
    queryKey: ['userReservations'],
    queryFn: fetchUserReservations,
    enabled: status === 'authenticated',
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      setIsEditing(false);
    },
  });
  
  // Handle profile update
  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({ name });
  };
  
  // Filter upcoming reservations
  const upcomingReservations = userReservations.filter(
    (reservation) => new Date(reservation.date) >= new Date() && reservation.status !== 'cancelled'
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Filter past reservations
  const pastReservations = userReservations.filter(
    (reservation) => new Date(reservation.date) < new Date() || reservation.status === 'cancelled'
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  if (status === 'loading' || isLoadingProfile) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  if (profileError) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          Error loading profile: {profileError instanceof Error ? profileError.message : 'Unknown error'}
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-5">
      <h1 className="font-serif mb-4">Your Profile</h1>
      
      <div className="row">
        <div className="col-lg-4 mb-4">
          {/* Profile Card */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              {isEditing ? (
                <form onSubmit={handleProfileUpdate}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="d-flex justify-content-between">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        setIsEditing(false);
                        setName(userProfile?.name || '');
                      }}
                      disabled={updateProfileMutation.isPending}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="card-title mb-0">Profile Information</h5>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit
                    </button>
                  </div>
                  <p className="mb-1">
                    <strong>Name:</strong> {userProfile?.name}
                  </p>
                  <p className="mb-1">
                    <strong>Email:</strong> {userProfile?.email}
                  </p>
                  <p className="mb-0">
                    <strong>Member Since:</strong> {userProfile?.createdAt ? 
                      format(new Date(userProfile.createdAt), 'MMMM d, yyyy') : 
                      'N/A'
                    }
                  </p>
                </>
              )}
            </div>
          </div>
          
          {/* Loyalty Card */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title mb-0">Loyalty Program</h5>
                <Link href="/profile/loyalty" className="btn btn-sm btn-outline-primary">
                  View Details
                </Link>
              </div>
              <div className="text-center py-3">
                <div className="display-4 text-primary mb-2">{userProfile?.loyaltyPoints || 0}</div>
                <p className="mb-0">Loyalty Points</p>
              </div>
              <div className="d-flex justify-content-between mt-3">
                <div className="text-center">
                  <div className="h5 mb-1">{userProfile?.visitCount || 0}</div>
                  <small className="text-muted">Visits</small>
                </div>
                <div className="text-center">
                  <div className="h5 mb-1">
                    {userReservations?.filter(r => r.status === 'confirmed').length || 0}
                  </div>
                  <small className="text-muted">Reservations</small>
                </div>
                <div className="text-center">
                  <div className="h5 mb-1">
                    {userReservations?.filter(r => r.feedback?.rating).length || 0}
                  </div>
                  <small className="text-muted">Reviews</small>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">Quick Links</h5>
              <div className="d-grid gap-2">
                <Link href="/reserve" className="btn btn-outline-primary">
                  <i className="bi bi-calendar-plus me-2"></i>
                  Make a Reservation
                </Link>
                <Link href="/profile/preferences" className="btn btn-outline-secondary">
                  <i className="bi bi-gear me-2"></i>
                  Dining Preferences
                </Link>
                <Link href="/profile/password" className="btn btn-outline-secondary">
                  <i className="bi bi-lock me-2"></i>
                  Change Password
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-lg-8">
          {/* Upcoming Reservations */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">Upcoming Reservations</h5>
            </div>
            <div className="card-body">
              {isLoadingReservations ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : upcomingReservations.length === 0 ? (
                <div className="alert alert-info">
                  You don't have any upcoming reservations.
                  <div className="mt-3">
                    <Link href="/reserve" className="btn btn-primary">
                      Make a Reservation
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="list-group">
                  {upcomingReservations.map((reservation) => (
                    <div key={reservation._id} className="list-group-item list-group-item-action">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">
                            {format(parseISO(reservation.date), 'EEEE, MMMM d, yyyy')} at {reservation.timeSlot}
                          </h6>
                          <p className="mb-1 text-muted">
                            Party of {reservation.partySize} {reservation.partySize === 1 ? 'person' : 'people'}
                          </p>
                          {reservation.specialOccasion && (
                            <p className="mb-0 small">
                              <span className="badge bg-info">
                                {reservation.specialOccasion}
                              </span>
                            </p>
                          )}
                        </div>
                        <div>
                          <span className={`badge ${
                            reservation.status === 'confirmed' ? 'bg-success' : 'bg-warning'
                          } mb-2 d-block`}>
                            {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                          </span>
                          <Link 
                            href={`/reserve/details/${reservation._id}`}
                            className="btn btn-sm btn-outline-primary"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Past Reservations */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-light">
              <h5 className="mb-0">Past Reservations</h5>
            </div>
            <div className="card-body">
              {isLoadingReservations ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : pastReservations.length === 0 ? (
                <div className="alert alert-info">
                  You don't have any past reservations.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Party Size</th>
                        <th>Status</th>
                        <th>Feedback</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {pastReservations.slice(0, 5).map((reservation) => (
                        <tr key={reservation._id}>
                          <td>{format(parseISO(reservation.date), 'MMM d, yyyy')}</td>
                          <td>{reservation.timeSlot}</td>
                          <td>{reservation.partySize}</td>
                          <td>
                            <span className={`badge ${
                              reservation.status === 'confirmed' ? 'bg-success' :
                              reservation.status === 'cancelled' ? 'bg-danger' : 'bg-warning'
                            }`}>
                              {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                            </span>
                          </td>
                          <td>
                            {reservation.feedback?.rating ? (
                              <div className="text-warning">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <i 
                                    key={i} 
                                    className={`bi ${i < reservation.feedback.rating ? 'bi-star-fill' : 'bi-star'}`}
                                  ></i>
                                ))}
                              </div>
                            ) : reservation.status === 'confirmed' ? (
                              <Link 
                                href={`/feedback/${reservation._id}`}
                                className="btn btn-sm btn-outline-primary"
                              >
                                Leave Feedback
                              </Link>
                            ) : (
                              <span className="text-muted">N/A</span>
                            )}
                          </td>
                          <td>
                            <Link 
                              href={`/reserve/details/${reservation._id}`}
                              className="btn btn-sm btn-outline-secondary"
                            >
                              Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {pastReservations.length > 5 && (
                    <div className="text-center mt-3">
                      <Link href="/profile/history" className="btn btn-outline-primary">
                        View All History
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
