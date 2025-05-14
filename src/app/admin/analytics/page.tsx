'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { fetchAnalytics } from '@/api/admin';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

type DateRange = '7days' | '30days' | 'thisMonth' | 'lastMonth' | 'custom';

export default function AnalyticsDashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  // State for date range
  const [dateRange, setDateRange] = useState<DateRange>('30days');
  const [startDate, setStartDate] = useState<string>(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  
  // Check if user is admin with more robust check
  const isAdmin = session?.user?.role === 'admin' || 
                 (session?.user?.role && String(session?.user?.role).toLowerCase() === 'admin');
  
  // Redirect if not admin
  if (status === 'authenticated' && !isAdmin) {
    router.push('/');
  }
  
  // Update date range based on selection
  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
    
    const today = new Date();
    let start = new Date();
    let end = today;
    
    switch (range) {
      case '7days':
        start = subDays(today, 7);
        break;
      case '30days':
        start = subDays(today, 30);
        break;
      case 'thisMonth':
        start = startOfMonth(today);
        end = endOfMonth(today);
        break;
      case 'lastMonth':
        const lastMonth = subDays(startOfMonth(today), 1);
        start = startOfMonth(lastMonth);
        end = endOfMonth(lastMonth);
        break;
      case 'custom':
        // Keep current custom dates
        return;
    }
    
    setStartDate(format(start, 'yyyy-MM-dd'));
    setEndDate(format(end, 'yyyy-MM-dd'));
  };
  
  // Fetch analytics data
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['analytics', startDate, endDate],
    queryFn: () => fetchAnalytics(startDate, endDate),
    enabled: status === 'authenticated' && isAdmin,
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
          Error loading analytics: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="font-serif">Analytics Dashboard</h1>
        <Link href="/admin" className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-2"></i>
          Back to Dashboard
        </Link>
      </div>
      
      {/* Date Range Selector */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Date Range</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="btn-group w-100">
                <button
                  type="button"
                  className={`btn ${dateRange === '7days' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handleDateRangeChange('7days')}
                >
                  Last 7 Days
                </button>
                <button
                  type="button"
                  className={`btn ${dateRange === '30days' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handleDateRangeChange('30days')}
                >
                  Last 30 Days
                </button>
                <button
                  type="button"
                  className={`btn ${dateRange === 'thisMonth' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handleDateRangeChange('thisMonth')}
                >
                  This Month
                </button>
                <button
                  type="button"
                  className={`btn ${dateRange === 'lastMonth' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handleDateRangeChange('lastMonth')}
                >
                  Last Month
                </button>
                <button
                  type="button"
                  className={`btn ${dateRange === 'custom' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handleDateRangeChange('custom')}
                >
                  Custom
                </button>
              </div>
            </div>
            
            <div className="col-md-6">
              <div className="row g-2">
                <div className="col">
                  <label htmlFor="startDate" className="form-label">Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setDateRange('custom');
                    }}
                  />
                </div>
                <div className="col">
                  <label htmlFor="endDate" className="form-label">End Date</label>
                  <input
                    type="date"
                    className="form-control"
                    id="endDate"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setDateRange('custom');
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {analytics && (
        <>
          {/* Overview Cards */}
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card h-100 border-primary">
                <div className="card-body text-center">
                  <h5 className="card-title">Total Reservations</h5>
                  <h2 className="display-4">{analytics.totalReservations}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card h-100 border-success">
                <div className="card-body text-center">
                  <h5 className="card-title">Average Party Size</h5>
                  <h2 className="display-4">{analytics.avgPartySize?.toFixed(1) || 0}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card h-100 border-info">
                <div className="card-body text-center">
                  <h5 className="card-title">Average Rating</h5>
                  <h2 className="display-4">{analytics.avgRating?.toFixed(1) || 'N/A'}</h2>
                  <div className="text-warning">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i 
                        key={star} 
                        className={`bi ${star <= Math.round(analytics.avgRating || 0) ? 'bi-star-fill' : 'bi-star'}`}
                      ></i>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card h-100 border-warning">
                <div className="card-body text-center">
                  <h5 className="card-title">Current Waitlist</h5>
                  <h2 className="display-4">{analytics.currentWaitlist || 0}</h2>
                </div>
              </div>
            </div>
          </div>
          
          {/* Reservation Status */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-header">
                  <h5 className="mb-0">Reservation Status</h5>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Status</th>
                          <th>Count</th>
                          <th>Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <span className="badge bg-success">Confirmed</span>
                          </td>
                          <td>{analytics.statusCounts?.confirmed || 0}</td>
                          <td>
                            {analytics.totalReservations ? 
                              ((analytics.statusCounts?.confirmed || 0) / analytics.totalReservations * 100).toFixed(1) + '%' : 
                              '0%'
                            }
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <span className="badge bg-warning">Pending</span>
                          </td>
                          <td>{analytics.statusCounts?.pending || 0}</td>
                          <td>
                            {analytics.totalReservations ? 
                              ((analytics.statusCounts?.pending || 0) / analytics.totalReservations * 100).toFixed(1) + '%' : 
                              '0%'
                            }
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <span className="badge bg-danger">Cancelled</span>
                          </td>
                          <td>{analytics.statusCounts?.cancelled || 0}</td>
                          <td>
                            {analytics.totalReservations ? 
                              ((analytics.statusCounts?.cancelled || 0) / analytics.totalReservations * 100).toFixed(1) + '%' : 
                              '0%'
                            }
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-header">
                  <h5 className="mb-0">Peak Times</h5>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <h6>Busiest Day</h6>
                    <p className="lead">
                      {analytics.busiestDay ? 
                        format(new Date(analytics.busiestDay), 'EEEE, MMMM d, yyyy') : 
                        'No data available'
                      }
                    </p>
                  </div>
                  <div>
                    <h6>Busiest Time Slot</h6>
                    <p className="lead">{analytics.busiestTime || 'No data available'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* User Stats */}
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">User Statistics</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="card border-0 bg-light">
                    <div className="card-body text-center">
                      <h5 className="card-title">Total Registered Users</h5>
                      <h2 className="display-4">{analytics.totalUsers || 0}</h2>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card border-0 bg-light">
                    <div className="card-body">
                      <h5 className="card-title">Reservation Conversion</h5>
                      <p>Percentage of users who have made at least one reservation</p>
                      <div className="progress" style={{ height: '25px' }}>
                        <div 
                          className="progress-bar bg-success" 
                          role="progressbar" 
                          style={{ 
                            width: `${analytics.totalUsers ? 
                              (analytics.totalReservations / analytics.totalUsers * 100).toFixed(1) : 0}%` 
                          }}
                        >
                          {analytics.totalUsers ? 
                            (analytics.totalReservations / analytics.totalUsers * 100).toFixed(1) : 0}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
