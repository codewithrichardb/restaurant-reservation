'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export default function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Check if user is admin - more robust check
  const isAdmin = session?.user?.role === 'admin' ||
                 (session?.user?.role && String(session?.user?.role).toLowerCase() === 'admin');

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link href="/" className="navbar-brand">
          Gourmet Haven
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link
                href="/"
                className={`nav-link ${pathname === '/' ? 'active' : ''}`}
              >
                Home
              </Link>
            </li>
            {/* Everyone can make reservations */}
            <li className="nav-item">
              <Link
                href="/reserve"
                className={`nav-link ${pathname.startsWith('/reserve') ? 'active' : ''}`}
              >
                Make Reservation
              </Link>
            </li>
            <li className="nav-item">
              <Link
                href="/waitlist/join"
                className={`nav-link ${pathname.startsWith('/waitlist') ? 'active' : ''}`}
              >
                Join Waitlist
              </Link>
            </li>
            <li className="nav-item">
              <Link
                href="/menu"
                className={`nav-link ${pathname.startsWith('/menu') ? 'active' : ''}`}
              >
                Our Menu
              </Link>
            </li>

            {status === 'loading' && (
              <li className="nav-item">
                <span className="nav-link">
                  <div className="spinner-border spinner-border-sm text-light" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </span>
              </li>
            )}

            {status === 'authenticated' && (
              <>
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="bi bi-person-circle me-1"></i>
                    {session.user.name}
                    {isAdmin && (
                      <span className="badge bg-danger ms-2">Admin</span>
                    )}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <h6 className="dropdown-header">
                        Signed in as <strong>{session.user.email}</strong>
                      </h6>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <Link
                        href="/profile"
                        className="dropdown-item"
                      >
                        <i className="bi bi-person me-2"></i>
                        My Profile
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/profile/loyalty"
                        className="dropdown-item"
                      >
                        <i className="bi bi-star me-2"></i>
                        Loyalty Program
                      </Link>
                    </li>
                    {!isAdmin && (
                      <li>
                        <Link
                          href="/my-reservations"
                          className="dropdown-item"
                        >
                          <i className="bi bi-calendar-check me-2"></i>
                          My Reservations
                        </Link>
                      </li>
                    )}
                    {isAdmin && (
                      <>
                        <li>
                          <Link
                            href="/admin"
                            className="dropdown-item"
                          >
                            <i className="bi bi-speedometer2 me-2"></i>
                            Admin Dashboard
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/admin/time-slots"
                            className="dropdown-item"
                          >
                            <i className="bi bi-clock me-2"></i>
                            Manage Time Slots
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/admin/users"
                            className="dropdown-item"
                          >
                            <i className="bi bi-people me-2"></i>
                            Manage Users
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/admin/reminders"
                            className="dropdown-item"
                          >
                            <i className="bi bi-bell me-2"></i>
                            Reservation Reminders
                          </Link>
                        </li>
                      </>
                    )}
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button
                        className="dropdown-item text-danger"
                        onClick={() => signOut({ callbackUrl: '/' })}
                      >
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            )}

            {status === 'unauthenticated' && (
              <>
                <li className="nav-item me-2">
                  <Link
                    href="/auth/login"
                    className="btn btn-outline-light"
                  >
                    <i className="bi bi-box-arrow-in-right me-1"></i>
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    href="/auth/register"
                    className="btn btn-primary"
                  >
                    <i className="bi bi-person-plus me-1"></i>
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
