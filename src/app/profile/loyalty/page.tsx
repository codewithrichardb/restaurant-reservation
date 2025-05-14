'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { fetchUserProfile } from '@/api/users';
import { format, parseISO } from 'date-fns';

export default function LoyaltyProgramPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  // Redirect if not logged in
  if (status === 'unauthenticated') {
    router.push('/login');
  }
  
  // Fetch user profile
  const { data: userProfile, isLoading, error } = useQuery({
    queryKey: ['userProfile'],
    queryFn: fetchUserProfile,
    enabled: status === 'authenticated',
  });
  
  // Define loyalty tiers
  const loyaltyTiers = [
    { name: 'Bronze', minPoints: 0, benefits: ['Basic reservation service'] },
    { name: 'Silver', minPoints: 50, benefits: ['Priority seating', '5% discount on food items'] },
    { name: 'Gold', minPoints: 150, benefits: ['Priority seating', '10% discount on all items', 'Complimentary dessert on birthdays'] },
    { name: 'Platinum', minPoints: 300, benefits: ['VIP seating', '15% discount on all items', 'Complimentary dessert on birthdays', 'Chef\'s special tasting menu access'] },
  ];
  
  // Calculate current tier
  const getCurrentTier = (points: number) => {
    for (let i = loyaltyTiers.length - 1; i >= 0; i--) {
      if (points >= loyaltyTiers[i].minPoints) {
        return loyaltyTiers[i];
      }
    }
    return loyaltyTiers[0];
  };
  
  // Calculate next tier
  const getNextTier = (points: number) => {
    for (let i = 0; i < loyaltyTiers.length; i++) {
      if (points < loyaltyTiers[i].minPoints) {
        return {
          tier: loyaltyTiers[i],
          pointsNeeded: loyaltyTiers[i].minPoints - points
        };
      }
    }
    return null; // Already at highest tier
  };
  
  // Calculate progress percentage to next tier
  const getProgressPercentage = (currentPoints: number, nextTierPoints: number, currentTierPoints: number) => {
    const totalPointsNeeded = nextTierPoints - currentTierPoints;
    const pointsEarned = currentPoints - currentTierPoints;
    return Math.round((pointsEarned / totalPointsNeeded) * 100);
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
          Error loading profile: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    );
  }
  
  if (!userProfile) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning" role="alert">
          Unable to load your profile. Please try again later.
        </div>
      </div>
    );
  }
  
  const currentTier = getCurrentTier(userProfile.loyaltyPoints);
  const nextTier = getNextTier(userProfile.loyaltyPoints);
  
  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="font-serif">Loyalty Program</h1>
            <Link href="/profile" className="btn btn-outline-secondary">
              <i className="bi bi-arrow-left me-2"></i>
              Back to Profile
            </Link>
          </div>
          
          {/* Loyalty Points Card */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body text-center p-4">
              <h2 className="font-serif mb-3">Your Loyalty Status</h2>
              <div className="display-1 text-primary mb-3">{userProfile.loyaltyPoints}</div>
              <h3 className="mb-3">
                <span className="badge bg-primary">{currentTier.name} Member</span>
              </h3>
              
              {nextTier ? (
                <div className="mb-3">
                  <p className="mb-2">
                    Earn {nextTier.pointsNeeded} more points to reach {nextTier.tier.name} status
                  </p>
                  <div className="progress" style={{ height: '25px' }}>
                    <div 
                      className="progress-bar bg-success" 
                      role="progressbar" 
                      style={{ 
                        width: `${getProgressPercentage(
                          userProfile.loyaltyPoints, 
                          nextTier.tier.minPoints, 
                          currentTier.minPoints
                        )}%` 
                      }}
                      aria-valuenow={userProfile.loyaltyPoints} 
                      aria-valuemin={currentTier.minPoints} 
                      aria-valuemax={nextTier.tier.minPoints}
                    >
                      {getProgressPercentage(
                        userProfile.loyaltyPoints, 
                        nextTier.tier.minPoints, 
                        currentTier.minPoints
                      )}%
                    </div>
                  </div>
                </div>
              ) : (
                <div className="alert alert-success">
                  Congratulations! You've reached our highest loyalty tier!
                </div>
              )}
              
              <div className="mt-4">
                <h5>Your Current Benefits</h5>
                <ul className="list-group list-group-flush">
                  {currentTier.benefits.map((benefit, index) => (
                    <li key={index} className="list-group-item bg-transparent">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          {/* How to Earn Points */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">How to Earn Points</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <div className="d-flex align-items-center">
                    <div className="me-3">
                      <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                        <i className="bi bi-calendar-check fs-4"></i>
                      </div>
                    </div>
                    <div>
                      <h6 className="mb-1">Make a Reservation</h6>
                      <p className="mb-0 text-muted">10 points per visit</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="d-flex align-items-center">
                    <div className="me-3">
                      <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                        <i className="bi bi-star fs-4"></i>
                      </div>
                    </div>
                    <div>
                      <h6 className="mb-1">Leave Feedback</h6>
                      <p className="mb-0 text-muted">5 points per review</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="d-flex align-items-center">
                    <div className="me-3">
                      <div className="bg-info text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                        <i className="bi bi-people fs-4"></i>
                      </div>
                    </div>
                    <div>
                      <h6 className="mb-1">Refer a Friend</h6>
                      <p className="mb-0 text-muted">20 points per referral</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="d-flex align-items-center">
                    <div className="me-3">
                      <div className="bg-warning text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                        <i className="bi bi-currency-dollar fs-4"></i>
                      </div>
                    </div>
                    <div>
                      <h6 className="mb-1">Spend at Restaurant</h6>
                      <p className="mb-0 text-muted">1 point per $10 spent</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Loyalty Tiers */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-light">
              <h5 className="mb-0">Loyalty Tiers</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Tier</th>
                      <th>Points Required</th>
                      <th>Benefits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loyaltyTiers.map((tier, index) => (
                      <tr key={index} className={tier.name === currentTier.name ? 'table-primary' : ''}>
                        <td>
                          <span className={`badge ${
                            tier.name === 'Bronze' ? 'bg-secondary' :
                            tier.name === 'Silver' ? 'bg-light text-dark' :
                            tier.name === 'Gold' ? 'bg-warning' :
                            'bg-info'
                          }`}>
                            {tier.name}
                          </span>
                        </td>
                        <td>{tier.minPoints}+</td>
                        <td>
                          <ul className="list-unstyled mb-0">
                            {tier.benefits.map((benefit, i) => (
                              <li key={i}>
                                <small>
                                  <i className="bi bi-check text-success me-1"></i>
                                  {benefit}
                                </small>
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
