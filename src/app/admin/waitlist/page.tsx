'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWaitlist, updateWaitlistStatus } from '@/api/admin';
import { Waitlist, WaitlistStatus } from '@/types';
import { format, formatDistanceToNow } from 'date-fns';

export default function WaitlistManagementPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  
  // Check if user is admin with more robust check
  const isAdmin = session?.user?.role === 'admin' || 
                 (session?.user?.role && String(session?.user?.role).toLowerCase() === 'admin');
  
  // Redirect if not admin
  if (status === 'authenticated' && !isAdmin) {
    router.push('/');
  }
  
  // Fetch waitlist
  const { data: waitlistEntries = [], isLoading, error } = useQuery({
    queryKey: ['waitlist'],
    queryFn: fetchWaitlist,
    enabled: status === 'authenticated' && isAdmin,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
  
  // Update waitlist status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (data: { id: string; status: WaitlistStatus; notified?: boolean }) => 
      updateWaitlistStatus(data.id, data.status, data.notified),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waitlist'] });
    },
  });
  
  // Handle status update
  const handleStatusUpdate = (id: string, newStatus: WaitlistStatus) => {
    const statusMessages = {
      seated: 'Are you sure you want to mark this party as seated?',
      left: 'Are you sure you want to mark this party as left?',
      cancelled: 'Are you sure you want to cancel this waitlist entry?',
    };
    
    if (confirm(statusMessages[newStatus] || 'Are you sure you want to update the status?')) {
      updateStatusMutation.mutate({ 
        id, 
        status: newStatus,
        notified: newStatus === 'seated' ? true : undefined,
      });
    }
  };
  
  // Filter active waitlist entries
  const activeWaitlist = waitlistEntries.filter(entry => entry.status === 'waiting');
  const historyEntries = waitlistEntries.filter(entry => entry.status !== 'waiting');
  
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
          Error loading waitlist: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="font-serif">Waitlist Management</h1>
        <div>
          <Link href="/waitlist/join" className="btn btn-primary me-2">
            <i className="bi bi-plus-circle me-2"></i>
            Add to Waitlist
          </Link>
          <Link href="/admin" className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left me-2"></i>
            Back to Dashboard
          </Link>
        </div>
      </div>
      
      {/* Active Waitlist */}
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">
            Current Waitlist ({activeWaitlist.length})
            {updateStatusMutation.isPending && (
              <span className="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></span>
            )}
          </h5>
        </div>
        <div className="card-body">
          {activeWaitlist.length === 0 ? (
            <div className="alert alert-info">No parties currently waiting.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Party Size</th>
                    <th>Wait Time</th>
                    <th>Phone</th>
                    <th>Notified</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeWaitlist.map((entry) => (
                    <tr key={entry._id}>
                      <td>{entry.name}</td>
                      <td>{entry.partySize} {entry.partySize === 1 ? 'person' : 'people'}</td>
                      <td>
                        {entry.createdAt ? (
                          formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })
                        ) : (
                          'Unknown'
                        )}
                        {entry.estimatedWaitTime && (
                          <div>
                            <small className="text-muted">
                              Est: {entry.estimatedWaitTime} min
                            </small>
                          </div>
                        )}
                      </td>
                      <td>{entry.phone}</td>
                      <td>
                        <span className={`badge ${entry.notified ? 'bg-success' : 'bg-warning'}`}>
                          {entry.notified ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group">
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleStatusUpdate(entry._id, 'seated')}
                            disabled={updateStatusMutation.isPending}
                          >
                            Seat
                          </button>
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => {
                              updateStatusMutation.mutate({ 
                                id: entry._id, 
                                status: 'waiting',
                                notified: true 
                              });
                            }}
                            disabled={entry.notified || updateStatusMutation.isPending}
                          >
                            Notify
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleStatusUpdate(entry._id, 'left')}
                            disabled={updateStatusMutation.isPending}
                          >
                            Left
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleStatusUpdate(entry._id, 'cancelled')}
                            disabled={updateStatusMutation.isPending}
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Waitlist History */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Waitlist History</h5>
        </div>
        <div className="card-body">
          {historyEntries.length === 0 ? (
            <div className="alert alert-info">No waitlist history available.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Party Size</th>
                    <th>Status</th>
                    <th>Time on List</th>
                    <th>Added At</th>
                  </tr>
                </thead>
                <tbody>
                  {historyEntries.slice(0, 10).map((entry) => (
                    <tr key={entry._id}>
                      <td>{entry.name}</td>
                      <td>{entry.partySize}</td>
                      <td>
                        <span className={`badge ${
                          entry.status === 'seated' ? 'bg-success' : 
                          entry.status === 'left' ? 'bg-warning' : 
                          'bg-danger'
                        }`}>
                          {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        {entry.createdAt && entry.updatedAt ? (
                          formatDistanceToNow(new Date(entry.createdAt), { 
                            addSuffix: false 
                          })
                        ) : (
                          'Unknown'
                        )}
                      </td>
                      <td>
                        {entry.createdAt ? (
                          format(new Date(entry.createdAt), 'MMM d, h:mm a')
                        ) : (
                          'Unknown'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {historyEntries.length > 10 && (
                <div className="text-center mt-3">
                  <p className="text-muted">Showing 10 of {historyEntries.length} entries</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
