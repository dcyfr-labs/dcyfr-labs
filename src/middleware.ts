/**
 * Next.js Edge Middleware
 *
 * Security controls applied globally before any route handler runs:
 *
 * 1. Development Route Blocking — `/dev/*` and `/api/dev/*` paths are blocked
 *    in production (VERCEL_ENV === 'production') with a 404 response.
 *    Individual route handlers retain their own guards as defense-in-depth.
 *
 * 2. Debug Route Blocking — `/api/debug/*` paths are blocked outside of
 *    local development (NODE_ENV !== 'development') with a 404 response.
 *
 * Note: `/api/admin/*` routes each implement their own specialized auth
 * (ADMIN_API_KEY Bearer token, CRON_SECRET, withAdminAuth HOC). Middleware
 * does not duplicate those checks to avoid maintenance coupling.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // ── Block dev routes in production ──────────────────────────────────────
  // Vercel sets VERCEL_ENV=production only for the live production deployment.
  // Preview deployments use VERCEL_ENV=preview, allowing dev tools there.
  const isProduction = process.env.VERCEL_ENV === 'production';

  if (isProduction && (pathname.startsWith('/dev') || pathname.startsWith('/api/dev'))) {
    return new NextResponse(null, { status: 404 });
  }

  // ── Block debug routes outside local development ─────────────────────────
  // /api/debug/* routes expose Redis config and similar — restrict to local dev.
  const isLocalDevelopment = process.env.NODE_ENV === 'development';

  if (!isLocalDevelopment && pathname.startsWith('/api/debug')) {
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all dev and debug routes
    '/dev/:path*',
    '/api/dev/:path*',
    '/api/debug/:path*',
  ],
};
