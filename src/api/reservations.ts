import { Reservation, ReservationFormData, ReservationStatus, TimeSlot } from '@/types';

// Fetch all reservations with optional filters
export async function fetchReservations(date?: string, status?: string): Promise<Reservation[]> {
  let url = '/api/reservations';
  const params = new URLSearchParams();

  if (date) params.append('date', date);
  if (status) params.append('status', status);

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch reservations');
  }

  return response.json();
}

// Fetch a single reservation by ID
export async function fetchReservationById(id: string): Promise<Reservation> {
  const response = await fetch(`/api/reservations/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch reservation');
  }

  return response.json();
}

// Create a new reservation
export async function createReservation(data: ReservationFormData): Promise<Reservation> {
  const response = await fetch('/api/reservations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create reservation');
  }

  return response.json();
}

// Update a reservation's status
export async function updateReservationStatus(id: string, status: ReservationStatus): Promise<Reservation> {
  const response = await fetch(`/api/reservations/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error('Failed to update reservation');
  }

  return response.json();
}

// Fetch available time slots for a specific date
export async function fetchTimeSlots(date: string): Promise<TimeSlot[]> {
  const response = await fetch(`/api/timeslots?date=${date}`);

  if (!response.ok) {
    throw new Error('Failed to fetch time slots');
  }

  return response.json();
}

// Submit feedback for a reservation
export async function submitFeedback(id: string, data: { rating: number; comment?: string }): Promise<Reservation> {
  const response = await fetch(`/api/reservations/${id}/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to submit feedback');
  }

  return response.json();
}

// Assign a table to a reservation
export async function assignTable(id: string, tableId: string): Promise<Reservation> {
  const response = await fetch(`/api/reservations/${id}/assign-table`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tableId }),
  });

  if (!response.ok) {
    throw new Error('Failed to assign table');
  }

  return response.json();
}
