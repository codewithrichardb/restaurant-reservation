import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Continue to the requested page
  return NextResponse.next();
}

// Configure which paths this middleware is applied to
export const config = {
  // Skip static files and API health check
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/health).*)'],
};
