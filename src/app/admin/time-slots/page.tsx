'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAllTimeSlots, createTimeSlot, updateTimeSlot, deleteTimeSlot } from '@/api/admin';
import { TimeSlot } from '@/types';

export default function TimeSlotManagementPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  
  // State for form inputs
  const [newTime, setNewTime] = useState('');
  const [newMaxReservations, setNewMaxReservations] = useState(4);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  
  // Check if user is admin with more robust check
  const isAdmin = session?.user?.role === 'admin' || 
                 (session?.user?.role && String(session?.user?.role).toLowerCase() === 'admin');
  
  // Redirect if not admin
  if (status === 'authenticated' && !isAdmin) {
    router.push('/');
  }
  
  // Fetch time slots
  const { data: timeSlots = [], isLoading, error } = useQuery({
    queryKey: ['timeSlots'],
    queryFn: fetchAllTimeSlots,
    enabled: status === 'authenticated' && isAdmin,
  });
  
  // Create time slot mutation
  const createMutation = useMutation({
    mutationFn: createTimeSlot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeSlots'] });
      setNewTime('');
      setNewMaxReservations(4);
    },
  });
  
  // Update time slot mutation
  const updateMutation = useMutation({
    mutationFn: (data: { id: string; time?: string; maxReservations?: number }) => 
      updateTimeSlot(data.id, { time: data.time, maxReservations: data.maxReservations }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeSlots'] });
      setEditingSlot(null);
    },
  });
  
  // Delete time slot mutation
  const deleteMutation = useMutation({
    mutationFn: deleteTimeSlot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeSlots'] });
    },
  });
  
  // Handle form submission for creating a new time slot
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTime) return;
    
    createMutation.mutate({
      time: newTime,
      maxReservations: newMaxReservations,
    });
  };
  
  // Handle form submission for updating a time slot
  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;
    
    updateMutation.mutate({
      id: editingSlot._id,
      time: editingSlot.time,
      maxReservations: editingSlot.maxReservations,
    });
  };
  
  // Handle time slot deletion
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this time slot?')) {
      deleteMutation.mutate(id);
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
          Error loading time slots: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-5">
      <h1 className="font-serif mb-4">Manage Time Slots</h1>
      
      {/* Create New Time Slot Form */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Add New Time Slot</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleCreateSubmit} className="row g-3">
            <div className="col-md-6">
              <label htmlFor="newTime" className="form-label">Time (e.g., "6:00 PM")</label>
              <input
                type="text"
                className="form-control"
                id="newTime"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                required
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="newMaxReservations" className="form-label">Maximum Reservations</label>
              <input
                type="number"
                className="form-control"
                id="newMaxReservations"
                min="1"
                value={newMaxReservations}
                onChange={(e) => setNewMaxReservations(parseInt(e.target.value))}
                required
              />
            </div>
            <div className="col-12">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Creating...
                  </>
                ) : (
                  'Add Time Slot'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Time Slots List */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Existing Time Slots</h5>
        </div>
        <div className="card-body">
          {timeSlots.length === 0 ? (
            <div className="alert alert-info">No time slots found.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Max Reservations</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((slot) => (
                    <tr key={slot._id}>
                      <td>{slot.time}</td>
                      <td>{slot.maxReservations}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => setEditingSlot(slot)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(slot._id)}
                          disabled={deleteMutation.isPending}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Edit Modal */}
      {editingSlot && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Time Slot</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setEditingSlot(null)}
                ></button>
              </div>
              <form onSubmit={handleUpdateSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="editTime" className="form-label">Time</label>
                    <input
                      type="text"
                      className="form-control"
                      id="editTime"
                      value={editingSlot.time}
                      onChange={(e) => setEditingSlot({ ...editingSlot, time: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="editMaxReservations" className="form-label">Maximum Reservations</label>
                    <input
                      type="number"
                      className="form-control"
                      id="editMaxReservations"
                      min="1"
                      value={editingSlot.maxReservations}
                      onChange={(e) => setEditingSlot({ ...editingSlot, maxReservations: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setEditingSlot(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
