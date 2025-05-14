'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAllTables, createTable, updateTable, deleteTable } from '@/api/admin';
import { Table } from '@/types';

export default function TableManagementPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  
  // State for form inputs
  const [newTableNumber, setNewTableNumber] = useState<number | ''>('');
  const [newCapacity, setNewCapacity] = useState<number | ''>('');
  const [newLocation, setNewLocation] = useState<string>('Main');
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  
  // Check if user is admin with more robust check
  const isAdmin = session?.user?.role === 'admin' || 
                 (session?.user?.role && String(session?.user?.role).toLowerCase() === 'admin');
  
  // Redirect if not admin
  if (status === 'authenticated' && !isAdmin) {
    router.push('/');
  }
  
  // Fetch tables
  const { data: tables = [], isLoading, error } = useQuery({
    queryKey: ['tables'],
    queryFn: fetchAllTables,
    enabled: status === 'authenticated' && isAdmin,
  });
  
  // Create table mutation
  const createMutation = useMutation({
    mutationFn: createTable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      setNewTableNumber('');
      setNewCapacity('');
      setNewLocation('Main');
    },
  });
  
  // Update table mutation
  const updateMutation = useMutation({
    mutationFn: (data: { id: string; tableNumber?: number; capacity?: number; location?: string; isActive?: boolean }) => 
      updateTable(data.id, { 
        tableNumber: data.tableNumber, 
        capacity: data.capacity, 
        location: data.location, 
        isActive: data.isActive 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      setEditingTable(null);
    },
  });
  
  // Delete table mutation
  const deleteMutation = useMutation({
    mutationFn: deleteTable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });
  
  // Handle form submission for creating a new table
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTableNumber === '' || newCapacity === '' || !newLocation) return;
    
    createMutation.mutate({
      tableNumber: Number(newTableNumber),
      capacity: Number(newCapacity),
      location: newLocation,
    });
  };
  
  // Handle form submission for updating a table
  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTable) return;
    
    updateMutation.mutate({
      id: editingTable._id,
      tableNumber: editingTable.tableNumber,
      capacity: editingTable.capacity,
      location: editingTable.location,
      isActive: editingTable.isActive,
    });
  };
  
  // Handle table deletion
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this table? This cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };
  
  // Toggle table active status
  const toggleTableStatus = (table: Table) => {
    updateMutation.mutate({
      id: table._id,
      isActive: !table.isActive,
    });
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
          Error loading tables: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="font-serif">Table Management</h1>
        <Link href="/admin" className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-2"></i>
          Back to Dashboard
        </Link>
      </div>
      
      {/* Create New Table Form */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Add New Table</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleCreateSubmit} className="row g-3">
            <div className="col-md-4">
              <label htmlFor="newTableNumber" className="form-label">Table Number</label>
              <input
                type="number"
                className="form-control"
                id="newTableNumber"
                value={newTableNumber}
                onChange={(e) => setNewTableNumber(e.target.value === '' ? '' : Number(e.target.value))}
                min="1"
                required
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="newCapacity" className="form-label">Capacity</label>
              <input
                type="number"
                className="form-control"
                id="newCapacity"
                value={newCapacity}
                onChange={(e) => setNewCapacity(e.target.value === '' ? '' : Number(e.target.value))}
                min="1"
                required
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="newLocation" className="form-label">Location</label>
              <select
                className="form-select"
                id="newLocation"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                required
              >
                <option value="Window">Window</option>
                <option value="Bar">Bar</option>
                <option value="Main">Main</option>
                <option value="Outdoor">Outdoor</option>
                <option value="Private">Private</option>
              </select>
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
                  'Add Table'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Tables List */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Tables ({tables.length})</h5>
        </div>
        <div className="card-body">
          {tables.length === 0 ? (
            <div className="alert alert-info">No tables found. Add your first table above.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Table #</th>
                    <th>Capacity</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tables.map((table) => (
                    <tr key={table._id} className={!table.isActive ? 'table-secondary' : ''}>
                      <td>{table.tableNumber}</td>
                      <td>{table.capacity} {table.capacity === 1 ? 'person' : 'people'}</td>
                      <td>{table.location}</td>
                      <td>
                        <span className={`badge ${table.isActive ? 'bg-success' : 'bg-danger'}`}>
                          {table.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => setEditingTable(table)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => toggleTableStatus(table)}
                          >
                            {table.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(table._id)}
                          >
                            Delete
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
      
      {/* Edit Modal */}
      {editingTable && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Table #{editingTable.tableNumber}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setEditingTable(null)}
                ></button>
              </div>
              <form onSubmit={handleUpdateSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="editTableNumber" className="form-label">Table Number</label>
                    <input
                      type="number"
                      className="form-control"
                      id="editTableNumber"
                      value={editingTable.tableNumber}
                      onChange={(e) => setEditingTable({ ...editingTable, tableNumber: Number(e.target.value) })}
                      min="1"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="editCapacity" className="form-label">Capacity</label>
                    <input
                      type="number"
                      className="form-control"
                      id="editCapacity"
                      value={editingTable.capacity}
                      onChange={(e) => setEditingTable({ ...editingTable, capacity: Number(e.target.value) })}
                      min="1"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="editLocation" className="form-label">Location</label>
                    <select
                      className="form-select"
                      id="editLocation"
                      value={editingTable.location}
                      onChange={(e) => setEditingTable({ ...editingTable, location: e.target.value as any })}
                      required
                    >
                      <option value="Window">Window</option>
                      <option value="Bar">Bar</option>
                      <option value="Main">Main</option>
                      <option value="Outdoor">Outdoor</option>
                      <option value="Private">Private</option>
                    </select>
                  </div>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="editIsActive"
                      checked={editingTable.isActive}
                      onChange={(e) => setEditingTable({ ...editingTable, isActive: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="editIsActive">
                      Active
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setEditingTable(null)}
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
