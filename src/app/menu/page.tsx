'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { fetchMenuItems } from '@/api/admin';

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  // Fetch menu items
  const { data: menuItems = [], isLoading, error } = useQuery({
    queryKey: ['publicMenu', activeCategory],
    queryFn: () => fetchMenuItems(
      activeCategory !== 'all' ? activeCategory : undefined, 
      true // Only fetch available items
    ),
  });
  
  // Group menu items by category
  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof menuItems>);
  
  // Get popular items
  const popularItems = menuItems.filter(item => item.isPopular);
  
  if (isLoading) {
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
          Error loading menu: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="display-4 font-serif mb-3">Our Menu</h1>
        <p className="lead">
          Discover our delicious offerings, crafted with the finest ingredients
        </p>
      </div>
      
      {/* Category Navigation */}
      <ul className="nav nav-pills justify-content-center mb-5">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            All
          </button>
        </li>
        {Object.keys(groupedItems).map((category) => (
          <li className="nav-item" key={category}>
            <button 
              className={`nav-link ${activeCategory === category ? 'active' : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          </li>
        ))}
      </ul>
      
      {/* Popular Items Section */}
      {activeCategory === 'all' && popularItems.length > 0 && (
        <div className="mb-5">
          <h2 className="font-serif text-center mb-4">
            <i className="bi bi-star-fill text-warning me-2"></i>
            Chef's Recommendations
          </h2>
          
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {popularItems.map((item) => (
              <div className="col" key={item._id}>
                <div className="card h-100 border-0 shadow-sm">
                  {item.imageUrl && (
                    <img 
                      src={item.imageUrl} 
                      className="card-img-top" 
                      alt={item.name}
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                  )}
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="card-title mb-0">{item.name}</h5>
                      <span className="badge bg-primary">${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}</span>
                    </div>
                    <p className="card-text">{item.description}</p>
                    
                    {(item.allergens && item.allergens.length > 0) && (
                      <div className="mt-2">
                        <small className="text-muted">
                          <strong>Allergens:</strong> {Array.isArray(item.allergens) ? item.allergens.join(', ') : item.allergens}
                        </small>
                      </div>
                    )}
                    
                    {(item.dietaryInfo && item.dietaryInfo.length > 0) && (
                      <div className="mt-1">
                        <small className="text-muted">
                          <strong>Dietary:</strong> {Array.isArray(item.dietaryInfo) ? item.dietaryInfo.join(', ') : item.dietaryInfo}
                        </small>
                      </div>
                    )}
                  </div>
                  <div className="card-footer bg-transparent border-0 text-center">
                    <Link href="/reserve" className="btn btn-outline-primary btn-sm">
                      Reserve to Try
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Menu Categories */}
      {(activeCategory === 'all' ? Object.keys(groupedItems) : [activeCategory]).map((category) => {
        if (!groupedItems[category]) return null;
        
        return (
          <div className="mb-5" key={category} id={category}>
            <h2 className="font-serif text-center mb-4">{category}</h2>
            
            <div className="row">
              {groupedItems[category].map((item) => (
                <div className="col-md-6 mb-4" key={item._id}>
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="row g-0">
                      {item.imageUrl && (
                        <div className="col-4">
                          <img 
                            src={item.imageUrl} 
                            className="img-fluid rounded-start h-100" 
                            alt={item.name}
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                      )}
                      <div className={item.imageUrl ? 'col-8' : 'col-12'}>
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h5 className="card-title mb-0">
                              {item.name}
                              {item.isPopular && (
                                <i className="bi bi-star-fill text-warning ms-2"></i>
                              )}
                            </h5>
                            <span className="badge bg-primary">${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}</span>
                          </div>
                          <p className="card-text">{item.description}</p>
                          
                          {(item.allergens && item.allergens.length > 0) && (
                            <div className="mt-2">
                              <small className="text-muted">
                                <strong>Allergens:</strong> {Array.isArray(item.allergens) ? item.allergens.join(', ') : item.allergens}
                              </small>
                            </div>
                          )}
                          
                          {(item.dietaryInfo && item.dietaryInfo.length > 0) && (
                            <div className="mt-1">
                              <small className="text-muted">
                                <strong>Dietary:</strong> {Array.isArray(item.dietaryInfo) ? item.dietaryInfo.join(', ') : item.dietaryInfo}
                              </small>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      
      <div className="text-center mt-5">
        <p className="mb-4">Ready to experience our delicious menu?</p>
        <Link href="/reserve" className="btn btn-primary btn-lg">
          Make a Reservation
        </Link>
        <span className="mx-2">or</span>
        <Link href="/waitlist/join" className="btn btn-outline-primary btn-lg">
          Join Waitlist
        </Link>
      </div>
    </div>
  );
}
