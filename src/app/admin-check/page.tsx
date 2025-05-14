'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function AdminCheckPage() {
  const { data: session, status } = useSession();
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    // Fetch the current user from the server to verify role
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        setUserInfo(data);
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    if (status === 'authenticated') {
      fetchUserInfo();
    }
  }, [status]);

  return (
    <div className="container py-5">
      <h1 className="mb-4">Admin Role Check</h1>

      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Session Status</h5>
        </div>
        <div className="card-body">
          <p><strong>Status:</strong> {status}</p>

          <div className="mt-3">
            <button
              className="btn btn-danger me-2"
              onClick={() => signOut({ callbackUrl: '/admin-check' })}
            >
              Sign Out and Return
            </button>

            <a
              href="/api/seed"
              className="btn btn-warning"
              target="_blank"
              rel="noopener noreferrer"
            >
              Run Seed API
            </a>
          </div>
        </div>
      </div>

      {session && (
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">Session Data (Client-side)</h5>
          </div>
          <div className="card-body">
            <p><strong>User ID:</strong> {session.user?.id || 'Not available'}</p>
            <p><strong>Name:</strong> {session.user?.name || 'Not available'}</p>
            <p><strong>Email:</strong> {session.user?.email || 'Not available'}</p>
            <p><strong>Role:</strong> {session.user?.role || 'Not available'}</p>
            <p><strong>Role Type:</strong> {typeof session.user?.role}</p>
            <p><strong>Role Value:</strong> "{session.user?.role}"</p>
            <p><strong>Is Admin:</strong> {session.user?.role === 'admin' ? 'Yes' : 'No'}</p>
            <p><strong>Role Comparison:</strong> "{session.user?.role}" === "admin" is {String(session.user?.role === 'admin')}</p>
          </div>
        </div>
      )}

      {userInfo && (
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Session Data (Server-side)</h5>
          </div>
          <div className="card-body">
            <pre className="mb-0">{JSON.stringify(userInfo, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
