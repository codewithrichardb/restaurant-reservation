import { TimeSlot, User } from '@/types';

// Time Slots Management
export async function fetchAllTimeSlots(): Promise<TimeSlot[]> {
  const response = await fetch('/api/admin/time-slots');

  if (!response.ok) {
    throw new Error('Failed to fetch time slots');
  }

  return response.json();
}

export async function createTimeSlot(data: { time: string; maxReservations: number }): Promise<TimeSlot> {
  const response = await fetch('/api/admin/time-slots', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create time slot');
  }

  return response.json();
}

export async function updateTimeSlot(id: string, data: { time?: string; maxReservations?: number }): Promise<TimeSlot> {
  const response = await fetch(`/api/admin/time-slots/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update time slot');
  }

  return response.json();
}

export async function deleteTimeSlot(id: string): Promise<void> {
  const response = await fetch(`/api/admin/time-slots/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete time slot');
  }
}

// User Management
export async function fetchAllUsers(): Promise<User[]> {
  const response = await fetch('/api/admin/users');

  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  return response.json();
}

export async function updateUserRole(id: string, role: 'user' | 'admin'): Promise<User> {
  const response = await fetch(`/api/admin/users/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ role }),
  });

  if (!response.ok) {
    throw new Error('Failed to update user role');
  }

  return response.json();
}

// Analytics
export async function fetchAnalytics(startDate?: string, endDate?: string): Promise<any> {
  let url = '/api/admin/analytics';
  const params = new URLSearchParams();

  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch analytics');
  }

  return response.json();
}

// Table Management
export async function fetchAllTables(): Promise<Table[]> {
  const response = await fetch('/api/admin/tables');

  if (!response.ok) {
    throw new Error('Failed to fetch tables');
  }

  return response.json();
}

export async function createTable(data: { tableNumber: number; capacity: number; location: string; isActive?: boolean }): Promise<Table> {
  const response = await fetch('/api/admin/tables', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create table');
  }

  return response.json();
}

export async function updateTable(id: string, data: { tableNumber?: number; capacity?: number; location?: string; isActive?: boolean }): Promise<Table> {
  const response = await fetch(`/api/admin/tables/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update table');
  }

  return response.json();
}

export async function deleteTable(id: string): Promise<void> {
  const response = await fetch(`/api/admin/tables/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete table');
  }
}

// Waitlist Management
export async function fetchWaitlist(): Promise<Waitlist[]> {
  const response = await fetch('/api/waitlist');

  if (!response.ok) {
    throw new Error('Failed to fetch waitlist');
  }

  return response.json();
}

export async function addToWaitlist(data: { name: string; email: string; phone: string; partySize: number; estimatedWaitTime?: number }): Promise<Waitlist> {
  const response = await fetch('/api/waitlist', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to add to waitlist');
  }

  return response.json();
}

export async function updateWaitlistStatus(id: string, status: 'waiting' | 'seated' | 'left' | 'cancelled', notified?: boolean): Promise<Waitlist> {
  const response = await fetch(`/api/waitlist/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status, notified }),
  });

  if (!response.ok) {
    throw new Error('Failed to update waitlist status');
  }

  return response.json();
}

// Menu Management
export async function fetchMenuItems(category?: string, available?: boolean): Promise<MenuItem[]> {
  let url = '/api/menu';
  const params = new URLSearchParams();

  if (category) params.append('category', category);
  if (available !== undefined) params.append('available', available.toString());

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch menu items');
  }

  return response.json();
}

export async function createMenuItem(data: {
  name: string;
  description: string;
  price: number;
  category: 'Appetizer' | 'Main Course' | 'Dessert' | 'Beverage';
  imageUrl?: string;
  isAvailable?: boolean;
  isPopular?: boolean;
  allergens?: string[];
  dietaryInfo?: string[];
}): Promise<MenuItem> {
  const response = await fetch('/api/menu', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create menu item');
  }

  return response.json();
}

export async function updateMenuItem(id: string, data: Partial<MenuItem>): Promise<MenuItem> {
  const response = await fetch(`/api/menu/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update menu item');
  }

  return response.json();
}

export async function deleteMenuItem(id: string): Promise<void> {
  const response = await fetch(`/api/menu/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete menu item');
  }
}

// Email Template Management
export async function fetchEmailTemplates(): Promise<any[]> {
  const response = await fetch('/api/admin/email-templates');

  if (!response.ok) {
    throw new Error('Failed to fetch email templates');
  }

  return response.json();
}

export async function fetchEmailTemplate(id: string): Promise<any> {
  const response = await fetch(`/api/admin/email-templates/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch email template');
  }

  return response.json();
}

export async function createEmailTemplate(data: {
  type: string;
  subject: string;
  body: string;
  isActive?: boolean;
}): Promise<any> {
  const response = await fetch('/api/admin/email-templates', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create email template');
  }

  return response.json();
}

export async function updateEmailTemplate(id: string, data: {
  subject?: string;
  body?: string;
  isActive?: boolean;
}): Promise<any> {
  const response = await fetch(`/api/admin/email-templates/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update email template');
  }

  return response.json();
}

export async function deleteEmailTemplate(id: string): Promise<void> {
  const response = await fetch(`/api/admin/email-templates/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete email template');
  }
}
