'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="container text-center py-5">
      <h1 className="display-4 mb-4">Something went wrong!</h1>
      <p className="lead mb-4">
        We apologize for the inconvenience. Please try again later.
      </p>
      <div className="d-flex justify-content-center gap-3">
        <button
          onClick={reset}
          className="btn btn-primary"
        >
          Try again
        </button>
        <Link href="/" className="btn btn-outline-secondary">
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}
