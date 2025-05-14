import { User } from '@/types';

// Fetch the current user's profile
export async function fetchUserProfile(): Promise<User> {
  const response = await fetch('/api/users/profile');
  
  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }
  
  return response.json();
}

// Update the current user's profile
export async function updateUserProfile(data: Partial<User>): Promise<User> {
  const response = await fetch('/api/users/profile', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update user profile');
  }
  
  return response.json();
}

// Fetch user's reservation history
export async function fetchUserReservations(): Promise<any[]> {
  const response = await fetch('/api/users/reservations');
  
  if (!response.ok) {
    throw new Error('Failed to fetch user reservations');
  }
  
  return response.json();
}

// Fetch user's loyalty points history
export async function fetchLoyaltyHistory(): Promise<any[]> {
  const response = await fetch('/api/users/loyalty/history');
  
  if (!response.ok) {
    throw new Error('Failed to fetch loyalty history');
  }
  
  return response.json();
}
