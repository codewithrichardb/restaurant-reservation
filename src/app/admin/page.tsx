'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ReservationList from '@/components/admin/ReservationList';

export default function AdminPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Check if user is admin with more robust check
  const isAdmin = session?.user?.role === 'admin' ||
                 (session?.user?.role && String(session?.user?.role).toLowerCase() === 'admin');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/admin');
    } else if (status === 'authenticated' && !isAdmin) {
      router.push('/');
    }
  }, [status, isAdmin, router]);

  if (status === 'loading') {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // If not admin, don't render anything (will be redirected)
  if (status === 'authenticated' && !isAdmin) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          You do not have permission to access this page.
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {status === 'authenticated' && isAdmin && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="font-serif">Admin Dashboard</h1>
          </div>

          {/* Admin Quick Links */}
          <div className="row mb-4">
            <div className="col-md-3 mb-3">
              <div className="card h-100">
                <div className="card-body text-center">
                  <i className="bi bi-calendar-check fs-1 text-primary mb-3"></i>
                  <h5 className="card-title">Reservations</h5>
                  <p className="card-text">Manage all customer reservations</p>
                </div>
                <div className="card-footer bg-transparent border-0 text-center d-flex justify-content-between">
                  <Link href="#reservations" className="btn btn-outline-primary">
                    List View
                  </Link>
                  <Link href="/admin/calendar" className="btn btn-outline-primary">
                    Calendar View
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-md-3 mb-3">
              <div className="card h-100">
                <div className="card-body text-center">
                  <i className="bi bi-table fs-1 text-success mb-3"></i>
                  <h5 className="card-title">Tables</h5>
                  <p className="card-text">Manage restaurant tables and seating</p>
                </div>
                <div className="card-footer bg-transparent border-0 text-center">
                  <Link href="/admin/tables" className="btn btn-outline-success">
                    Manage Tables
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-md-3 mb-3">
              <div className="card h-100">
                <div className="card-body text-center">
                  <i className="bi bi-people-fill fs-1 text-info mb-3"></i>
                  <h5 className="card-title">Waitlist</h5>
                  <p className="card-text">Manage walk-in customers and waitlist</p>
                </div>
                <div className="card-footer bg-transparent border-0 text-center">
                  <Link href="/admin/waitlist" className="btn btn-outline-info">
                    Manage Waitlist
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-md-3 mb-3">
              <div className="card h-100">
                <div className="card-body text-center">
                  <i className="bi bi-graph-up fs-1 text-warning mb-3"></i>
                  <h5 className="card-title">Analytics</h5>
                  <p className="card-text">View restaurant performance metrics</p>
                </div>
                <div className="card-footer bg-transparent border-0 text-center">
                  <Link href="/admin/analytics" className="btn btn-outline-warning">
                    View Analytics
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-md-3 mb-3">
              <div className="card h-100">
                <div className="card-body text-center">
                  <i className="bi bi-clock fs-1 text-secondary mb-3"></i>
                  <h5 className="card-title">Time Slots</h5>
                  <p className="card-text">Manage available reservation times</p>
                </div>
                <div className="card-footer bg-transparent border-0 text-center">
                  <Link href="/admin/time-slots" className="btn btn-outline-secondary">
                    Manage Time Slots
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-md-3 mb-3">
              <div className="card h-100">
                <div className="card-body text-center">
                  <i className="bi bi-people fs-1 text-danger mb-3"></i>
                  <h5 className="card-title">Users</h5>
                  <p className="card-text">Manage user accounts and permissions</p>
                </div>
                <div className="card-footer bg-transparent border-0 text-center">
                  <Link href="/admin/users" className="btn btn-outline-danger">
                    Manage Users
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-md-3 mb-3">
              <div className="card h-100">
                <div className="card-body text-center">
                  <i className="bi bi-bell fs-1 text-primary mb-3"></i>
                  <h5 className="card-title">Reminders</h5>
                  <p className="card-text">Manage reservation reminders</p>
                </div>
                <div className="card-footer bg-transparent border-0 text-center">
                  <Link href="/admin/reminders" className="btn btn-outline-primary">
                    Manage Reminders
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-md-3 mb-3">
              <div className="card h-100">
                <div className="card-body text-center">
                  <i className="bi bi-envelope-paper fs-1 text-info mb-3"></i>
                  <h5 className="card-title">Email Templates</h5>
                  <p className="card-text">Customize email notifications</p>
                </div>
                <div className="card-footer bg-transparent border-0 text-center">
                  <Link href="/admin/email-templates" className="btn btn-outline-info">
                    Edit Templates
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-md-3 mb-3">
              <div className="card h-100">
                <div className="card-body text-center">
                  <i className="bi bi-card-checklist fs-1 text-success mb-3"></i>
                  <h5 className="card-title">Menu</h5>
                  <p className="card-text">Manage restaurant menu items</p>
                </div>
                <div className="card-footer bg-transparent border-0 text-center">
                  <Link href="/admin/menu" className="btn btn-outline-success">
                    Manage Menu
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <h2 className="font-serif mb-3" id="reservations">Reservations</h2>
          <ReservationList />
        </>
      )}
    </div>
  );
}
