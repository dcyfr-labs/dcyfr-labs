import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware to block all /api/* routes for security
 * 
 * This middleware runs at the edge and blocks ALL API routes
 * before they can be processed by Next.js, effectively disabling
 * the entire API surface area for security.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Block all API routes
  if (pathname.startsWith('/api/')) {
    // Return 404 for any API route access
    return new NextResponse('Not Found', { status: 404 });
  }
  
  // Allow all other requests to continue
  return NextResponse.next();
}

/**
 * Configure which paths this middleware should run on
 * 
 * We specifically target /api/* to block all API routes
 * while allowing other paths to function normally.
 */
export const config = {
  matcher: [
    '/api/:path*'
  ]
};