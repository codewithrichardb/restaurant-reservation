'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAllTables } from '@/api/admin';
import { Reservation, Table } from '@/types';

interface TableAssignmentModalProps {
  reservation: Reservation;
  onClose: () => void;
  onAssign: (reservationId: string, tableId: string) => Promise<void>;
}

export default function TableAssignmentModal({ 
  reservation, 
  onClose,
  onAssign
}: TableAssignmentModalProps) {
  const queryClient = useQueryClient();
  const [selectedTableId, setSelectedTableId] = useState<string>(reservation.table || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch all tables
  const { data: tables = [], isLoading } = useQuery({
    queryKey: ['tables'],
    queryFn: fetchAllTables,
  });
  
  // Filter tables based on party size and active status
  const suitableTables = tables.filter(table => 
    table.isActive && table.capacity >= reservation.partySize
  );
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTableId) {
      alert('Please select a table');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onAssign(reservation._id, selectedTableId);
      onClose();
    } catch (error) {
      console.error('Error assigning table:', error);
      alert('Failed to assign table. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Assign Table to Reservation</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={isSubmitting}
            ></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <h6>Reservation Details</h6>
                <p className="mb-1">
                  <strong>Name:</strong> {reservation.name}
                </p>
                <p className="mb-1">
                  <strong>Date:</strong> {reservation.date}
                </p>
                <p className="mb-1">
                  <strong>Time:</strong> {reservation.timeSlot}
                </p>
                <p className="mb-0">
                  <strong>Party Size:</strong> {reservation.partySize} {reservation.partySize === 1 ? 'person' : 'people'}
                </p>
              </div>
              
              <hr />
              
              <div className="mb-3">
                <label htmlFor="tableSelect" className="form-label">Select Table</label>
                
                {isLoading ? (
                  <div className="text-center py-3">
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                      <span className="visually-hidden">Loading tables...</span>
                    </div>
                  </div>
                ) : suitableTables.length === 0 ? (
                  <div className="alert alert-warning">
                    No suitable tables available for this party size.
                  </div>
                ) : (
                  <select
                    className="form-select"
                    id="tableSelect"
                    value={selectedTableId}
                    onChange={(e) => setSelectedTableId(e.target.value)}
                    required
                  >
                    <option value="">Select a table...</option>
                    {suitableTables.map((table) => (
                      <option key={table._id} value={table._id}>
                        Table #{table.tableNumber} - {table.location} ({table.capacity} {table.capacity === 1 ? 'person' : 'people'})
                      </option>
                    ))}
                  </select>
                )}
                
                <div className="form-text">
                  Only tables that can accommodate {reservation.partySize} {reservation.partySize === 1 ? 'person' : 'people'} are shown.
                </div>
              </div>
              
              {reservation.table && (
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  This reservation is currently assigned to {
                    tables.find(t => t._id === reservation.table)
                      ? `Table #${tables.find(t => t._id === reservation.table)?.tableNumber}`
                      : 'a table'
                  }.
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || !selectedTableId}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Assigning...
                  </>
                ) : (
                  'Assign Table'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
