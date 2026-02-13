/**
 * Next.js Middleware
 *
 * Route protection for production environments:
 * - Blocks development routes (/dev/*, /api/dev/*)
 * - Requires authentication for admin routes (/api/admin/*)
 * - Applies rate limiting to expensive endpoints
 *
 * Security Classification: TLP:AMBER (Production Security Controls)
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware configuration
 * Runs on every request matching the matcher patterns
 */
export const config = {
  matcher: [
    // Development routes
    '/dev/:path*',
    '/api/dev/:path*',
    // Admin routes
    '/api/admin/:path*',
    // Expensive API routes (for rate limiting - future implementation)
    '/api/analytics/:path*',
    '/api/redis/:path*',
  ],
};

/**
 * Check if the current environment is production
 * VERCEL_ENV takes priority over NODE_ENV for accurate environment detection
 */
function isProductionEnvironment(): boolean {
  // If VERCEL_ENV is set, use it as the authoritative source
  if (process.env.VERCEL_ENV) {
    return process.env.VERCEL_ENV === 'production';
  }

  // Fallback to NODE_ENV only if VERCEL_ENV is not set (local development)
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if the request is from an authenticated admin
 * TODO: Implement proper authentication check
 */
function isAuthenticated(request: NextRequest): boolean {
  // TODO: Implement authentication logic
  // For now, allow all non-production requests
  // In production, you should check:
  // - Session token
  // - JWT token
  // - API key in headers
  // - OAuth token

  const authHeader = request.headers.get('authorization');

  // Simple bearer token check (replace with your actual auth logic)
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    // TODO: Verify token against your auth system
    // For now, we'll just check if it exists
    return !!token;
  }

  return false;
}

/**
 * Main middleware function
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProduction = isProductionEnvironment();

  // ============================================================================
  // SECURITY: Block development routes in production
  // ============================================================================

  if (isProduction) {
    // Block /dev/* routes
    if (pathname.startsWith('/dev/')) {
      console.warn('[Middleware] 🚫 Blocked development route in production:', pathname);
      return new NextResponse(
        JSON.stringify({
          error: 'Not Found',
          message: 'This route is only available in development environments',
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Block /api/dev/* routes
    if (pathname.startsWith('/api/dev/')) {
      console.warn('[Middleware] 🚫 Blocked development API route in production:', pathname);
      return new NextResponse(
        JSON.stringify({
          error: 'Not Found',
          message: 'This API route is only available in development environments',
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
  }

  // ============================================================================
  // SECURITY: Require authentication for admin routes (all environments)
  // ============================================================================

  if (pathname.startsWith('/api/admin/')) {
    if (!isAuthenticated(request)) {
      console.warn('[Middleware] 🚫 Unauthorized admin route access:', pathname);
      return new NextResponse(
        JSON.stringify({
          error: 'Unauthorized',
          message: 'Authentication required for admin routes',
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'WWW-Authenticate': 'Bearer',
          },
        }
      );
    }
  }

  // ============================================================================
  // FUTURE: Rate limiting for expensive endpoints
  // ============================================================================

  // TODO: Implement rate limiting using @upstash/ratelimit
  // Example endpoints that should be rate-limited:
  // - /api/analytics/* (expensive Redis operations)
  // - /api/redis/* (direct Redis access)
  //
  // See audit document for implementation example

  // Allow the request to continue
  return NextResponse.next();
}
