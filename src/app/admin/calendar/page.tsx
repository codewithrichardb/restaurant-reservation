'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { fetchReservations } from '@/api/reservations';
import { format, addDays, startOfWeek, endOfWeek, addWeeks, subWeeks, parseISO, isSameDay } from 'date-fns';
import { Reservation } from '@/types';

export default function CalendarViewPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  // State for current week
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekStart, setWeekStart] = useState(startOfWeek(currentDate, { weekStartsOn: 1 })); // Monday
  const [weekEnd, setWeekEnd] = useState(endOfWeek(currentDate, { weekStartsOn: 1 })); // Sunday
  
  // Generate array of dates for the week
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  // Check if user is admin with more robust check
  const isAdmin = session?.user?.role === 'admin' || 
                 (session?.user?.role && String(session?.user?.role).toLowerCase() === 'admin');
  
  // Redirect if not admin
  if (status === 'authenticated' && !isAdmin) {
    router.push('/');
  }
  
  // Update week dates when current date changes
  useEffect(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    setWeekStart(start);
    setWeekEnd(end);
  }, [currentDate]);
  
  // Format date range for query
  const startDateStr = format(weekStart, 'yyyy-MM-dd');
  const endDateStr = format(weekEnd, 'yyyy-MM-dd');
  
  // Fetch reservations for the week
  const { data: reservations = [], isLoading, error } = useQuery({
    queryKey: ['reservations', startDateStr, endDateStr],
    queryFn: () => fetchReservations(startDateStr, endDateStr),
    enabled: status === 'authenticated' && isAdmin,
  });
  
  // Navigate to previous week
  const goToPreviousWeek = () => {
    setCurrentDate(subWeeks(currentDate, 1));
  };
  
  // Navigate to next week
  const goToNextWeek = () => {
    setCurrentDate(addWeeks(currentDate, 1));
  };
  
  // Navigate to current week
  const goToCurrentWeek = () => {
    setCurrentDate(new Date());
  };
  
  // Group reservations by date and time
  const groupedReservations: Record<string, Record<string, Reservation[]>> = {};
  
  // Define time slots
  const timeSlots = [
    '11:00 AM', '11:30 AM', 
    '12:00 PM', '12:30 PM', 
    '1:00 PM', '1:30 PM', 
    '2:00 PM', '2:30 PM', 
    '5:00 PM', '5:30 PM', 
    '6:00 PM', '6:30 PM', 
    '7:00 PM', '7:30 PM', 
    '8:00 PM', '8:30 PM', 
    '9:00 PM', '9:30 PM'
  ];
  
  // Initialize groupedReservations
  weekDates.forEach(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    groupedReservations[dateStr] = {};
    
    timeSlots.forEach(timeSlot => {
      groupedReservations[dateStr][timeSlot] = [];
    });
  });
  
  // Group reservations
  reservations.forEach(reservation => {
    if (groupedReservations[reservation.date] && 
        groupedReservations[reservation.date][reservation.timeSlot]) {
      groupedReservations[reservation.date][reservation.timeSlot].push(reservation);
    }
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
          Error loading reservations: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    );
  }
  
  return (
    <div className="container-fluid py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="font-serif">Reservation Calendar</h1>
        <Link href="/admin" className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-2"></i>
          Back to Dashboard
        </Link>
      </div>
      
      {/* Calendar Navigation */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0">
                {format(weekStart, 'MMMM d')} - {format(weekEnd, 'MMMM d, yyyy')}
              </h5>
            </div>
            <div className="btn-group">
              <button
                className="btn btn-outline-primary"
                onClick={goToPreviousWeek}
              >
                <i className="bi bi-chevron-left"></i>
              </button>
              <button
                className="btn btn-outline-primary"
                onClick={goToCurrentWeek}
              >
                Today
              </button>
              <button
                className="btn btn-outline-primary"
                onClick={goToNextWeek}
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Calendar View */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-bordered calendar-table mb-0">
              <thead>
                <tr className="bg-light">
                  <th style={{ width: '8%' }} className="text-center">Time</th>
                  {weekDates.map((date) => (
                    <th key={date.toString()} className="text-center" style={{ width: '13%' }}>
                      <div className="fw-bold">{format(date, 'EEEE')}</div>
                      <div className={isSameDay(date, new Date()) ? 'text-primary' : ''}>
                        {format(date, 'MMM d')}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((timeSlot) => (
                  <tr key={timeSlot}>
                    <td className="text-center align-middle bg-light fw-bold">
                      {timeSlot}
                    </td>
                    {weekDates.map((date) => {
                      const dateStr = format(date, 'yyyy-MM-dd');
                      const reservationsForSlot = groupedReservations[dateStr]?.[timeSlot] || [];
                      
                      return (
                        <td key={`${dateStr}-${timeSlot}`} className="position-relative p-1">
                          {reservationsForSlot.length > 0 ? (
                            <div className="calendar-cell">
                              {reservationsForSlot.map((reservation) => (
                                <Link
                                  href={`/admin/reservations/${reservation._id}`}
                                  key={reservation._id}
                                  className={`calendar-event d-block mb-1 text-decoration-none rounded p-1 ${
                                    reservation.status === 'confirmed' ? 'bg-success' :
                                    reservation.status === 'pending' ? 'bg-warning' :
                                    'bg-danger'
                                  }`}
                                >
                                  <div className="text-white small">
                                    <strong>{reservation.name}</strong> ({reservation.partySize})
                                    {reservation.table && <i className="bi bi-table ms-1"></i>}
                                  </div>
                                </Link>
                              ))}
                            </div>
                          ) : (
                            <div className="calendar-cell-empty"></div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-3">
        <div className="d-flex gap-3 justify-content-end">
          <div className="d-flex align-items-center">
            <span className="badge bg-success me-1">&nbsp;</span>
            <small>Confirmed</small>
          </div>
          <div className="d-flex align-items-center">
            <span className="badge bg-warning me-1">&nbsp;</span>
            <small>Pending</small>
          </div>
          <div className="d-flex align-items-center">
            <span className="badge bg-danger me-1">&nbsp;</span>
            <small>Cancelled</small>
          </div>
          <div className="d-flex align-items-center">
            <i className="bi bi-table me-1 small"></i>
            <small>Table Assigned</small>
          </div>
        </div>
      </div>
    </div>
  );
}
