/**
 * Next.js Middleware - Global Security & Request Processing
 *
 * Runs on all requests before reaching route handlers.
 * Implements centralized security controls:
 * - Content Security Policy (CSP) headers
 * - Security headers (X-Frame-Options, etc.)
 * - Admin route authentication
 * - Internal access validation
 * - CSRF protection preparation
 *
 * Addresses Security Finding H-001: Missing middleware.ts
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Content Security Policy configuration
 *
 * Restricts resource loading to trusted sources to prevent XSS attacks.
 * Configured for production security while allowing necessary third-party resources.
 */
function getContentSecurityPolicy(): string {
  const policies = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-eval'", // Required for Next.js dev mode and some runtime features
      "'unsafe-inline'", // Required for some third-party widgets (consider nonce-based CSP in future)
      'https://vercel.live',
      'https://static.cloudflareinsights.com', // Cloudflare analytics
      'https://giscus.app', // Comment system
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Required for styled-components and dynamic styles
      'https://fonts.googleapis.com',
      'https://giscus.app',
    ],
    'font-src': ["'self'", 'https://fonts.gstatic.com'],
    'img-src': [
      "'self'",
      'data:', // Data URLs for inline images
      'https:', // Allow HTTPS images (GitHub, Credly, etc.)
      'blob:', // For generated images
    ],
    'connect-src': [
      "'self'",
      'https://api.github.com',
      'https://images.credly.com',
      'https://vercel.live',
      'https://cloudflareinsights.com',
      'https://giscus.app',
      process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
        ? 'https://www.dcyfr.ai'
        : 'http://localhost:*', // localhost dev — https not available; intentional // NOSONAR
    ],
    'frame-src': [
      "'self'",
      'https://giscus.app', // Comment system iframe
      'https://www.youtube.com', // Embedded videos
      'https://player.vimeo.com',
    ],
    'frame-ancestors': ["'self'"], // Prevent clickjacking except for /activity/embed (handled in next.config.ts)
    'object-src': ["'none'"], // Disable Flash and other plugins
    'base-uri': ["'self'"], // Restrict <base> tag URLs
    'form-action': ["'self'"], // Only allow form submissions to same origin
    'upgrade-insecure-requests': [], // Upgrade HTTP to HTTPS
  };

  return Object.entries(policies)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
}

/**
 * Check if request is from Vercel internal network
 *
 * Used to allow cron jobs, deploy hooks, and other internal Vercel services.
 */
function isVercelInternal(request: NextRequest): boolean {
  return !!(
    request.headers.get('x-vercel-deployment-url') ||
    request.headers.get('x-vercel-id') ||
    request.headers.get('user-agent')?.includes('vercel-cron')
  );
}

/**
 * Check if request is in development mode
 */
function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'development';
}

/**
 * Validate Authorization header against ADMIN_API_KEY for admin dashboard routes.
 * Supports:
 * - Bearer <ADMIN_API_KEY>
 * - Basic <base64(username:ADMIN_API_KEY)>
 */
function hasValidAdminDashboardAuth(request: NextRequest): boolean {
  const adminApiKey = process.env.ADMIN_API_KEY;
  if (!adminApiKey) {
    return false;
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return false;
  }

  if (authHeader.startsWith('Bearer ')) {
    const bearerToken = authHeader.slice('Bearer '.length).trim();
    return bearerToken === adminApiKey;
  }

  if (authHeader.startsWith('Basic ')) {
    try {
      const encoded = authHeader.slice('Basic '.length).trim();
      const decoded = atob(encoded);
      const separatorIndex = decoded.indexOf(':');

      if (separatorIndex === -1) {
        return false;
      }

      const password = decoded.slice(separatorIndex + 1);
      return password === adminApiKey;
    } catch {
      return false;
    }
  }

  return false;
}

function unauthorizedResponse(realm: string): NextResponse {
  return new NextResponse('Unauthorized', {
    status: 401,
    headers: {
      'Content-Type': 'text/plain',
      'WWW-Authenticate': realm,
    },
  });
}

function notFoundResponse(): NextResponse {
  return new NextResponse('Not Found', {
    status: 404,
    headers: { 'Content-Type': 'text/plain' },
  });
}

function getAdminDashboardAuthResponse(
  request: NextRequest,
  pathname: string
): NextResponse | null {
  const isAdminPage = pathname === '/admin' || pathname.startsWith('/admin/');
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isAdminPage || !isProduction || hasValidAdminDashboardAuth(request)) {
    return null;
  }

  return unauthorizedResponse('Basic realm="Admin Dashboard"');
}

function getAdminApiAuthResponse(request: NextRequest, pathname: string): NextResponse | null {
  const isAdminApi = pathname.startsWith('/api/admin/');
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isAdminApi || !isProduction) {
    return null;
  }

  const isInternal = isVercelInternal(request);
  const hasAuthHeader = request.headers.get('authorization');
  const hasCronSecret = request.headers.get('x-cron-secret');

  if (isInternal || hasAuthHeader || hasCronSecret) {
    return null;
  }

  return unauthorizedResponse('Bearer realm="Admin API"');
}

function getInternalRouteResponse(request: NextRequest, pathname: string): NextResponse | null {
  const internalRoutes = ['/api/health/', '/api/debug/', '/api/maintenance/'];
  const isProduction = process.env.NODE_ENV === 'production';
  const isInternalPath = internalRoutes.some((route) => pathname.startsWith(route));

  if (!isProduction || !isInternalPath || isVercelInternal(request)) {
    return null;
  }

  return notFoundResponse();
}

function getDevOnlyRouteResponse(pathname: string): NextResponse | null {
  if (!pathname.startsWith('/api/dev/') || isDevelopment()) {
    return null;
  }

  return notFoundResponse();
}

/**
 * Main proxy function (Next.js 16 migration from middleware)
 *
 * Runs on every request to apply security headers and authentication checks.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // ==========================================================================
  // 1. SECURITY HEADERS (All routes)
  // ==========================================================================

  // Content Security Policy
  response.headers.set('Content-Security-Policy', getContentSecurityPolicy());

  // XSS Protection
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy (restrict browser features)
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  // Strict Transport Security (HTTPS only)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // Note: X-Frame-Options handled per-route in next.config.ts for /activity/embed

  // ==========================================================================
  // 2. ADMIN ROUTE AUTHENTICATION
  // ==========================================================================

  const adminDashboardResponse = getAdminDashboardAuthResponse(request, pathname);
  if (adminDashboardResponse) {
    return adminDashboardResponse;
  }

  // Block unauthenticated access to /api/admin/* routes.
  // Individual admin routes should implement additional auth (API keys, sessions, etc.)
  const adminApiResponse = getAdminApiAuthResponse(request, pathname);
  if (adminApiResponse) {
    return adminApiResponse;
  }

  // ==========================================================================
  // 3. INTERNAL-ONLY ROUTES
  // ==========================================================================

  const internalRouteResponse = getInternalRouteResponse(request, pathname);
  if (internalRouteResponse) {
    return internalRouteResponse;
  }

  // ==========================================================================
  // 4. DEV-ONLY ROUTES
  // ==========================================================================

  const devOnlyRouteResponse = getDevOnlyRouteResponse(pathname);
  if (devOnlyRouteResponse) {
    return devOnlyRouteResponse;
  }

  return response;
}

/**
 * Matcher configuration
 *
 * Defines which routes this middleware runs on.
 * Excludes static files and Next.js internal routes for performance.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt (static files)
     * - *.png, *.jpg, *.jpeg, *.gif, *.svg, *.webp, *.ico (images)
     * - *.woff, *.woff2 (fonts)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*[.](?:png|jpg|jpeg|gif|svg|webp|ico|woff|woff2)).*)',
  ],
};
