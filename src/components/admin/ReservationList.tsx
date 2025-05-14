'use client';

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchReservations, updateReservationStatus as updateStatus, assignTable } from '@/api/reservations';
import { Reservation, ReservationStatus } from '@/types';
import TableAssignmentModal from './TableAssignmentModal';

export default function ReservationList() {
  const queryClient = useQueryClient();
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  // Fetch reservations with React Query
  const { data: reservations = [], isLoading, error } = useQuery({
    queryKey: ['reservations', filterDate, filterStatus],
    queryFn: () => fetchReservations(
      filterDate,
      filterStatus !== 'all' ? filterStatus : undefined
    ),
  });

  // Update reservation status mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: ReservationStatus }) =>
      updateStatus(id, status),
    onSuccess: () => {
      // Invalidate and refetch reservations query
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  });

  // Assign table mutation
  const assignTableMutation = useMutation({
    mutationFn: ({ reservationId, tableId }: { reservationId: string, tableId: string }) =>
      assignTable(reservationId, tableId),
    onSuccess: () => {
      // Invalidate and refetch reservations query
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  });

  // Handle table assignment
  const handleAssignTable = async (reservationId: string, tableId: string) => {
    await assignTableMutation.mutateAsync({ reservationId, tableId });
  };
  // Sort reservations by date and time
  const sortedReservations = [...reservations].sort((a, b) => {
    // First sort by date
    const dateComparison = a.date.localeCompare(b.date);
    if (dateComparison !== 0) return dateComparison;

    // Then sort by time
    return a.timeSlot.localeCompare(b.timeSlot);
  });

  // Handle status update
  const handleStatusUpdate = (id: string, status: ReservationStatus) => {
    updateMutation.mutate({ id, status });
  };

  // Calculate analytics
  const totalReservations = reservations.length;
  const confirmedReservations = reservations.filter(r => r.status === 'confirmed').length;
  const pendingReservations = reservations.filter(r => r.status === 'pending').length;
  const cancelledReservations = reservations.filter(r => r.status === 'cancelled').length;

  // Calculate average party size
  const averagePartySize = reservations.length > 0
    ? Math.round(reservations.reduce((sum, r) => sum + r.partySize, 0) / reservations.length * 10) / 10
    : 0;

  // Find busiest date
  const dateCount: Record<string, number> = {};
  reservations.forEach(r => {
    if (r.status !== 'cancelled') {
      dateCount[r.date] = (dateCount[r.date] || 0) + 1;
    }
  });

  const busiestDate = Object.entries(dateCount).reduce(
    (busiest, [date, count]) =>
      count > busiest.count ? { date, count } : busiest,
    { date: '', count: 0 }
  );

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        Error loading reservations: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }

  return (
    <div>
      {/* Analytics Section */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3 mb-md-0">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">Total Reservations</h5>
              <p className="display-4">{totalReservations}</p>
              <div className="small text-muted">
                <span className="text-success">{confirmedReservations} confirmed</span> •
                <span className="text-warning ms-1">{pendingReservations} pending</span> •
                <span className="text-danger ms-1">{cancelledReservations} cancelled</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3 mb-md-0">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">Average Party Size</h5>
              <p className="display-4">{averagePartySize}</p>
              <div className="small text-muted">people per reservation</div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">Busiest Date</h5>
              {busiestDate.date ? (
                <>
                  <p className="display-4">
                    {format(parseISO(busiestDate.date), 'MMM d')}
                  </p>
                  <div className="small text-muted">
                    with {busiestDate.count} reservations
                  </div>
                </>
              ) : (
                <p className="text-muted">No data available</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">Filter Reservations</h5>
          <div className="row">
            <div className="col-md-6 mb-3 mb-md-0">
              <label htmlFor="dateFilter" className="form-label">Date</label>
              <input
                type="date"
                className="form-control"
                id="dateFilter"
                value={filterDate}
                onChange={(e) => {
                  const newDate = e.target.value;
                  if (newDate !== filterDate) {
                    setFilterDate(newDate);
                  }
                }}
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="statusFilter" className="form-label">Status</label>
              <select
                className="form-select"
                id="statusFilter"
                value={filterStatus}
                onChange={(e) => {
                  const newStatus = e.target.value;
                  if (newStatus !== filterStatus) {
                    setFilterStatus(newStatus);
                  }
                }}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Reservations Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <h5 className="card-title mb-3">Reservations</h5>

          {sortedReservations.length === 0 ? (
            <div className="alert alert-info">
              No reservations found matching the selected filters.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Name</th>
                    <th>Party</th>
                    <th>Contact</th>
                    <th>Table</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedReservations.map((reservation) => (
                    <tr key={reservation._id}>
                      <td>{format(parseISO(reservation.date), 'MMM d, yyyy')}</td>
                      <td>{reservation.timeSlot}</td>
                      <td>{reservation.name}</td>
                      <td>{reservation.partySize}</td>
                      <td>
                        <small>
                          {reservation.email}
                          <br />
                          {reservation.phone}
                        </small>
                      </td>
                      <td>
                        {reservation.table ? (
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => setSelectedReservation(reservation)}
                          >
                            <i className="bi bi-table me-1"></i>
                            {/* We'll show the table number if available in the future */}
                            Assigned
                          </button>
                        ) : (
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => setSelectedReservation(reservation)}
                            disabled={reservation.status !== 'confirmed'}
                          >
                            <i className="bi bi-plus-circle me-1"></i>
                            Assign
                          </button>
                        )}
                      </td>
                      <td>
                        {reservation.status === 'pending' && (
                          <span className="badge bg-warning">Pending</span>
                        )}
                        {reservation.status === 'confirmed' && (
                          <span className="badge bg-success">Confirmed</span>
                        )}
                        {reservation.status === 'cancelled' && (
                          <span className="badge bg-danger">Cancelled</span>
                        )}
                      </td>
                      <td>
                        <div className="dropdown">
                          <button
                            className="btn btn-sm btn-outline-secondary dropdown-toggle"
                            type="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                          >
                            Actions
                          </button>
                          <ul className="dropdown-menu">
                            {reservation.status !== 'confirmed' && (
                              <li>
                                <button
                                  className="dropdown-item"
                                  onClick={() => {
                                    if (confirm('Confirm this reservation? An email notification will be sent to the customer.')) {
                                      handleStatusUpdate(reservation._id, 'confirmed');
                                    }
                                  }}
                                >
                                  Confirm
                                </button>
                              </li>
                            )}
                            {reservation.status !== 'cancelled' && (
                              <li>
                                <button
                                  className="dropdown-item text-danger"
                                  onClick={() => {
                                    if (confirm('Cancel this reservation? An email notification will be sent to the customer.')) {
                                      handleStatusUpdate(reservation._id, 'cancelled');
                                    }
                                  }}
                                >
                                  Cancel
                                </button>
                              </li>
                            )}
                            {reservation.status === 'cancelled' && (
                              <li>
                                <button
                                  className="dropdown-item"
                                  onClick={() => {
                                    if (confirm('Reactivate this reservation? It will be set to pending status.')) {
                                      handleStatusUpdate(reservation._id, 'pending');
                                    }
                                  }}
                                >
                                  Reactivate
                                </button>
                              </li>
                            )}

                            {/* Table Assignment Option */}
                            {reservation.status === 'confirmed' && (
                              <>
                                <li><hr className="dropdown-divider" /></li>
                                <li>
                                  <button
                                    className="dropdown-item"
                                    onClick={() => setSelectedReservation(reservation)}
                                  >
                                    {reservation.table ? 'Change Table' : 'Assign Table'}
                                  </button>
                                </li>
                              </>
                            )}
                          </ul>
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

      {/* Table Assignment Modal */}
      {selectedReservation && (
        <TableAssignmentModal
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
          onAssign={handleAssignTable}
        />
      )}
    </div>
  );
}
