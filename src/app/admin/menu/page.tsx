'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from '@/api/admin';
import { MenuItem } from '@/types';

export default function MenuManagementPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  
  // State for form inputs
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Main Course',
    imageUrl: '',
    isAvailable: true,
    isPopular: false,
    allergens: '',
    dietaryInfo: '',
  });
  
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  // Check if user is admin with more robust check
  const isAdmin = session?.user?.role === 'admin' || 
                 (session?.user?.role && String(session?.user?.role).toLowerCase() === 'admin');
  
  // Redirect if not admin
  if (status === 'authenticated' && !isAdmin) {
    router.push('/');
  }
  
  // Fetch menu items
  const { data: menuItems = [], isLoading, error } = useQuery({
    queryKey: ['menuItems', activeCategory],
    queryFn: () => fetchMenuItems(activeCategory !== 'all' ? activeCategory : undefined, undefined),
    enabled: status === 'authenticated' && isAdmin,
  });
  
  // Create menu item mutation
  const createMutation = useMutation({
    mutationFn: createMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      setNewItem({
        name: '',
        description: '',
        price: '',
        category: 'Main Course',
        imageUrl: '',
        isAvailable: true,
        isPopular: false,
        allergens: '',
        dietaryInfo: '',
      });
    },
  });
  
  // Update menu item mutation
  const updateMutation = useMutation({
    mutationFn: (data: { id: string; item: Partial<MenuItem> }) => 
      updateMenuItem(data.id, data.item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      setEditingItem(null);
    },
  });
  
  // Delete menu item mutation
  const deleteMutation = useMutation({
    mutationFn: deleteMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
    },
  });
  
  // Handle form submission for creating a new menu item
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newItem.name || !newItem.description || !newItem.price || !newItem.category) {
      alert('Please fill in all required fields');
      return;
    }
    
    createMutation.mutate({
      name: newItem.name,
      description: newItem.description,
      price: parseFloat(newItem.price),
      category: newItem.category as any,
      imageUrl: newItem.imageUrl || undefined,
      isAvailable: newItem.isAvailable,
      isPopular: newItem.isPopular,
      allergens: newItem.allergens ? newItem.allergens.split(',').map(a => a.trim()) : [],
      dietaryInfo: newItem.dietaryInfo ? newItem.dietaryInfo.split(',').map(d => d.trim()) : [],
    });
  };
  
  // Handle form submission for updating a menu item
  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingItem) return;
    
    updateMutation.mutate({
      id: editingItem._id,
      item: {
        name: editingItem.name,
        description: editingItem.description,
        price: typeof editingItem.price === 'string' ? parseFloat(editingItem.price) : editingItem.price,
        category: editingItem.category,
        imageUrl: editingItem.imageUrl,
        isAvailable: editingItem.isAvailable,
        isPopular: editingItem.isPopular,
        allergens: typeof editingItem.allergens === 'string' 
          ? editingItem.allergens.split(',').map(a => a.trim()) 
          : editingItem.allergens,
        dietaryInfo: typeof editingItem.dietaryInfo === 'string'
          ? editingItem.dietaryInfo.split(',').map(d => d.trim())
          : editingItem.dietaryInfo,
      },
    });
  };
  
  // Handle menu item deletion
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this menu item? This cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };
  
  // Toggle menu item availability
  const toggleAvailability = (item: MenuItem) => {
    updateMutation.mutate({
      id: item._id,
      item: { isAvailable: !item.isAvailable },
    });
  };
  
  // Toggle menu item popularity
  const togglePopularity = (item: MenuItem) => {
    updateMutation.mutate({
      id: item._id,
      item: { isPopular: !item.isPopular },
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
          Error loading menu items: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="font-serif">Menu Management</h1>
        <Link href="/admin" className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-2"></i>
          Back to Dashboard
        </Link>
      </div>
      
      {/* Create New Menu Item Form */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Add New Menu Item</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleCreateSubmit} className="row g-3">
            <div className="col-md-6">
              <label htmlFor="name" className="form-label">Item Name*</label>
              <input
                type="text"
                className="form-control"
                id="name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                required
              />
            </div>
            
            <div className="col-md-3">
              <label htmlFor="price" className="form-label">Price*</label>
              <div className="input-group">
                <span className="input-group-text">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-control"
                  id="price"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <div className="col-md-3">
              <label htmlFor="category" className="form-label">Category*</label>
              <select
                className="form-select"
                id="category"
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                required
              >
                <option value="Appetizer">Appetizer</option>
                <option value="Main Course">Main Course</option>
                <option value="Dessert">Dessert</option>
                <option value="Beverage">Beverage</option>
              </select>
            </div>
            
            <div className="col-12">
              <label htmlFor="description" className="form-label">Description*</label>
              <textarea
                className="form-control"
                id="description"
                rows={2}
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                required
              ></textarea>
            </div>
            
            <div className="col-md-6">
              <label htmlFor="imageUrl" className="form-label">Image URL</label>
              <input
                type="url"
                className="form-control"
                id="imageUrl"
                value={newItem.imageUrl}
                onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            <div className="col-md-3">
              <label htmlFor="allergens" className="form-label">Allergens</label>
              <input
                type="text"
                className="form-control"
                id="allergens"
                value={newItem.allergens}
                onChange={(e) => setNewItem({ ...newItem, allergens: e.target.value })}
                placeholder="Nuts, Dairy, Gluten (comma separated)"
              />
            </div>
            
            <div className="col-md-3">
              <label htmlFor="dietaryInfo" className="form-label">Dietary Info</label>
              <input
                type="text"
                className="form-control"
                id="dietaryInfo"
                value={newItem.dietaryInfo}
                onChange={(e) => setNewItem({ ...newItem, dietaryInfo: e.target.value })}
                placeholder="Vegetarian, Vegan, GF (comma separated)"
              />
            </div>
            
            <div className="col-md-6">
              <div className="form-check form-switch mt-4">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="isAvailable"
                  checked={newItem.isAvailable}
                  onChange={(e) => setNewItem({ ...newItem, isAvailable: e.target.checked })}
                />
                <label className="form-check-label" htmlFor="isAvailable">
                  Available
                </label>
              </div>
            </div>
            
            <div className="col-md-6">
              <div className="form-check form-switch mt-4">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="isPopular"
                  checked={newItem.isPopular}
                  onChange={(e) => setNewItem({ ...newItem, isPopular: e.target.checked })}
                />
                <label className="form-check-label" htmlFor="isPopular">
                  Mark as Popular
                </label>
              </div>
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
                  'Add Menu Item'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Menu Items List */}
      <div className="card">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeCategory === 'all' ? 'active' : ''}`}
                onClick={() => setActiveCategory('all')}
              >
                All Items
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeCategory === 'Appetizer' ? 'active' : ''}`}
                onClick={() => setActiveCategory('Appetizer')}
              >
                Appetizers
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeCategory === 'Main Course' ? 'active' : ''}`}
                onClick={() => setActiveCategory('Main Course')}
              >
                Main Courses
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeCategory === 'Dessert' ? 'active' : ''}`}
                onClick={() => setActiveCategory('Dessert')}
              >
                Desserts
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeCategory === 'Beverage' ? 'active' : ''}`}
                onClick={() => setActiveCategory('Beverage')}
              >
                Beverages
              </button>
            </li>
          </ul>
        </div>
        <div className="card-body">
          {menuItems.length === 0 ? (
            <div className="alert alert-info">No menu items found in this category.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Popular</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {menuItems.map((item) => (
                    <tr key={item._id} className={!item.isAvailable ? 'table-secondary' : ''}>
                      <td>
                        <div className="d-flex align-items-center">
                          {item.imageUrl && (
                            <img 
                              src={item.imageUrl} 
                              alt={item.name} 
                              className="me-2" 
                              style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                            />
                          )}
                          <div>
                            <strong>{item.name}</strong>
                            <div className="small text-muted">{item.description.substring(0, 50)}...</div>
                          </div>
                        </div>
                      </td>
                      <td>{item.category}</td>
                      <td>${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}</td>
                      <td>
                        <span className={`badge ${item.isAvailable ? 'bg-success' : 'bg-danger'}`}>
                          {item.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td>
                        {item.isPopular && (
                          <span className="badge bg-warning">
                            <i className="bi bi-star-fill me-1"></i> Popular
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="btn-group">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => setEditingItem(item)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => toggleAvailability(item)}
                          >
                            {item.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                          </button>
                          <button
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => togglePopularity(item)}
                          >
                            {item.isPopular ? 'Remove Popular' : 'Mark Popular'}
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(item._id)}
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
      {editingItem && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Menu Item</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setEditingItem(null)}
                ></button>
              </div>
              <form onSubmit={handleUpdateSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label htmlFor="editName" className="form-label">Item Name*</label>
                      <input
                        type="text"
                        className="form-control"
                        id="editName"
                        value={editingItem.name}
                        onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="col-md-3">
                      <label htmlFor="editPrice" className="form-label">Price*</label>
                      <div className="input-group">
                        <span className="input-group-text">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="form-control"
                          id="editPrice"
                          value={typeof editingItem.price === 'number' ? editingItem.price : editingItem.price}
                          onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="col-md-3">
                      <label htmlFor="editCategory" className="form-label">Category*</label>
                      <select
                        className="form-select"
                        id="editCategory"
                        value={editingItem.category}
                        onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as any })}
                        required
                      >
                        <option value="Appetizer">Appetizer</option>
                        <option value="Main Course">Main Course</option>
                        <option value="Dessert">Dessert</option>
                        <option value="Beverage">Beverage</option>
                      </select>
                    </div>
                    
                    <div className="col-12">
                      <label htmlFor="editDescription" className="form-label">Description*</label>
                      <textarea
                        className="form-control"
                        id="editDescription"
                        rows={3}
                        value={editingItem.description}
                        onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                        required
                      ></textarea>
                    </div>
                    
                    <div className="col-md-6">
                      <label htmlFor="editImageUrl" className="form-label">Image URL</label>
                      <input
                        type="url"
                        className="form-control"
                        id="editImageUrl"
                        value={editingItem.imageUrl || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                      />
                      {editingItem.imageUrl && (
                        <div className="mt-2">
                          <img 
                            src={editingItem.imageUrl} 
                            alt={editingItem.name} 
                            style={{ maxWidth: '100%', maxHeight: '100px' }}
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="col-md-3">
                      <label htmlFor="editAllergens" className="form-label">Allergens</label>
                      <input
                        type="text"
                        className="form-control"
                        id="editAllergens"
                        value={Array.isArray(editingItem.allergens) ? editingItem.allergens.join(', ') : editingItem.allergens || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, allergens: e.target.value })}
                        placeholder="Nuts, Dairy, Gluten (comma separated)"
                      />
                    </div>
                    
                    <div className="col-md-3">
                      <label htmlFor="editDietaryInfo" className="form-label">Dietary Info</label>
                      <input
                        type="text"
                        className="form-control"
                        id="editDietaryInfo"
                        value={Array.isArray(editingItem.dietaryInfo) ? editingItem.dietaryInfo.join(', ') : editingItem.dietaryInfo || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, dietaryInfo: e.target.value })}
                        placeholder="Vegetarian, Vegan, GF (comma separated)"
                      />
                    </div>
                    
                    <div className="col-md-6">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="editIsAvailable"
                          checked={editingItem.isAvailable}
                          onChange={(e) => setEditingItem({ ...editingItem, isAvailable: e.target.checked })}
                        />
                        <label className="form-check-label" htmlFor="editIsAvailable">
                          Available
                        </label>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="editIsPopular"
                          checked={editingItem.isPopular}
                          onChange={(e) => setEditingItem({ ...editingItem, isPopular: e.target.checked })}
                        />
                        <label className="form-check-label" htmlFor="editIsPopular">
                          Mark as Popular
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setEditingItem(null)}
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
