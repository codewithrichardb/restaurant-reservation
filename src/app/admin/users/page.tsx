'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAllUsers, updateUserRole } from '@/api/admin';
import { User } from '@/types';
import { format } from 'date-fns';

export default function UserManagementPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all');
  
  // Check if user is admin with more robust check
  const isAdmin = session?.user?.role === 'admin' || 
                 (session?.user?.role && String(session?.user?.role).toLowerCase() === 'admin');
  
  // Redirect if not admin
  if (status === 'authenticated' && !isAdmin) {
    router.push('/');
  }
  
  // Fetch users
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: fetchAllUsers,
    enabled: status === 'authenticated' && isAdmin,
  });
  
  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: (data: { id: string; role: 'user' | 'admin' }) => 
      updateUserRole(data.id, data.role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
  
  // Handle role change
  const handleRoleChange = (userId: string, newRole: 'user' | 'admin') => {
    if (userId === session?.user?.id) {
      alert('You cannot change your own role');
      return;
    }
    
    if (confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      updateRoleMutation.mutate({ id: userId, role: newRole });
    }
  };
  
  // Filter and search users
  const filteredUsers = users.filter(user => {
    // Apply role filter
    if (roleFilter !== 'all' && user.role !== roleFilter) {
      return false;
    }
    
    // Apply search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });
  
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
          Error loading users: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-5">
      <h1 className="font-serif mb-4">Manage Users</h1>
      
      {/* Filters and Search */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor="searchTerm" className="form-label">Search Users</label>
              <input
                type="text"
                className="form-control"
                id="searchTerm"
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="roleFilter" className="form-label">Filter by Role</label>
              <select
                className="form-select"
                id="roleFilter"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as 'all' | 'user' | 'admin')}
              >
                <option value="all">All Roles</option>
                <option value="user">Regular Users</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Users List */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Users ({filteredUsers.length})</h5>
        </div>
        <div className="card-body">
          {filteredUsers.length === 0 ? (
            <div className="alert alert-info">No users found matching your criteria.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>{user.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy') : 'N/A'}</td>
                      <td>
                        {user._id !== session?.user?.id ? (
                          <div className="dropdown">
                            <button
                              className="btn btn-sm btn-outline-secondary dropdown-toggle"
                              type="button"
                              data-bs-toggle="dropdown"
                              aria-expanded="false"
                            >
                              Change Role
                            </button>
                            <ul className="dropdown-menu">
                              <li>
                                <button
                                  className="dropdown-item"
                                  onClick={() => handleRoleChange(user._id, 'user')}
                                  disabled={user.role === 'user' || updateRoleMutation.isPending}
                                >
                                  Set as User
                                </button>
                              </li>
                              <li>
                                <button
                                  className="dropdown-item"
                                  onClick={() => handleRoleChange(user._id, 'admin')}
                                  disabled={user.role === 'admin' || updateRoleMutation.isPending}
                                >
                                  Set as Admin
                                </button>
                              </li>
                            </ul>
                          </div>
                        ) : (
                          <span className="text-muted">Current User</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
