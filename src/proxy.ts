import { NextResponse } from 'next/server';
import { SITE_DOMAIN } from '@/lib/site-config';
import type { NextRequest } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { transformMiddlewareRequest } from '@axiomhq/nextjs';
import { Logger, SimpleFetchTransport, ConsoleTransport } from '@axiomhq/logging';
import type { Transport } from '@axiomhq/logging';

// ─── Axiom request logging (edge-compatible, graceful no-op when token absent) ─
function buildEdgeLogger(): Logger {
  const dataset = process.env.AXIOM_DATASET_LABS ?? 'dcyfr-labs';
  const transports: [Transport, ...Transport[]] = [new ConsoleTransport({ prettyPrint: false })];
  if (process.env.AXIOM_TOKEN) {
    transports.push(
      new SimpleFetchTransport({
        input: `https://api.axiom.co/v1/datasets/${dataset}/ingest`,
        init: {
          headers: {
            Authorization: `Bearer ${process.env.AXIOM_TOKEN}`,
            'Content-Type': 'application/json',
          },
        },
      })
    );
  }
  return new Logger({ transports });
}

const axiomLogger = buildEdgeLogger();

/**
 * Suspicious paths that indicate reconnaissance or attack attempts.
 * Access attempts to these paths are logged to Sentry for security monitoring.
 */
const SUSPICIOUS_PATHS = [
  // Common admin/management paths
  '/admin',
  '/administrator',
  '/wp-admin',
  '/wp-login',
  '/wp-content',
  '/wordpress',
  '/cms',
  '/cpanel',
  '/phpmyadmin',
  '/mysql',
  '/adminer',
  // Common config/env paths
  '/.env',
  '/.git',
  '/.svn',
  '/config',
  '/backup',
  '/db',
  '/database',
  '/sql',
  '/dump',
  // Common API exploit paths
  '/api/v1',
  '/api/v2',
  '/graphql',
  '/rest',
  // Common scanner paths
  '/debug',
  '/trace',
  '/server-status',
  '/server-info',
  '/phpinfo',
  '/info.php',
  '/test.php',
  '/shell',
  '/cmd',
  '/exec',
  '/eval',
];

/**
 * Content Security Policy (CSP) Proxy (Next.js 16+)
 *
 * Adds CSP headers with nonce-based protection against XSS attacks.
 *
 * Note: This file was renamed from `middleware.ts` to `proxy.ts` for Next.js 16 compatibility.
 * Next.js 16 deprecated the "middleware" naming convention in favor of "proxy".
 * See: https://nextjs.org/docs/messages/middleware-to-proxy
 *
 * Nonce-based CSP implementation:
 * - Generates unique cryptographic nonce per request
 * - Injects nonce into CSP header for script-src and style-src
 * - Passes nonce via x-nonce header for use in components
 * - Compatible with Vercel Analytics, next-themes, and JSON-LD scripts
 *
 * Nonce support verified for:
 * - next-themes ThemeProvider (via nonce prop)
 * - JSON-LD structured data scripts (via nonce attribute)
 * - Vercel Analytics (inherits from script context)
 */

/** Build Sentry breadcrumb data for security events */
function securityBreadcrumbData(request: NextRequest, pathname: string, category: string) {
  return {
    security: category,
    path: pathname,
    url: request.url,
    method: request.method,
    userAgent: request.headers.get('user-agent') || 'unknown',
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    referer: request.headers.get('referer') || 'none',
  };
}

/** Build Sentry context for honeypot attempts */
function honeypotAttemptContext(request: NextRequest, pathname: string) {
  return {
    path: pathname,
    user_agent: request.headers.get('user-agent') || 'unknown',
    referer: request.headers.get('referer') || 'direct',
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Check suspicious path access — logs to Sentry and returns 404 response if suspicious.
 * Returns null if the path is not suspicious.
 */
function checkSuspiciousPath(
  request: NextRequest,
  pathnameLC: string,
  pathname: string
): NextResponse | null {
  const isSuspicious = SUSPICIOUS_PATHS.some(
    (p) => pathnameLC === p || pathnameLC.startsWith(p + '/') || pathnameLC.startsWith(p + '.')
  );
  if (!isSuspicious) return null;

  Sentry.addBreadcrumb({
    category: 'security',
    message: `Suspicious path access attempt: ${pathname}`,
    level: 'warning',
    data: securityBreadcrumbData(request, pathname, 'reconnaissance'),
  });

  return NextResponse.rewrite(new URL('/_not-found', request.url));
}

/**
 * Check honeypot paths — logs to Sentry and returns 404 response if triggered.
 * Returns null if the path is not a honeypot.
 */
function checkHoneypotPath(
  request: NextRequest,
  pathname: string,
  paths: string[]
): NextResponse | null {
  const triggered = paths.some((p) => pathname === p || pathname.startsWith(p + '/'));
  if (!triggered) return null;

  Sentry.addBreadcrumb({
    category: 'security',
    message: `Honeypot triggered: ${pathname}`,
    level: 'warning',
    data: securityBreadcrumbData(request, pathname, 'honeypot'),
  });

  Sentry.setContext('honeypot_attempt', honeypotAttemptContext(request, pathname));

  return NextResponse.rewrite(new URL('/_not-found', request.url));
}

/**
 * Check dev API access in production — logs to Sentry and returns 404 if blocked.
 * Returns null if the path is allowed.
 */
function checkDevApiAccess(request: NextRequest, pathname: string): NextResponse | null {
  if (!pathname.startsWith('/api/dev/')) return null;

  Sentry.addBreadcrumb({
    category: 'security',
    message: `Dev API access attempt: ${pathname}`,
    level: 'warning',
    data: securityBreadcrumbData(request, pathname, 'dev-api-blocked'),
  });

  return NextResponse.rewrite(new URL('/_not-found', request.url));
}

/**
 * Check internal API access from external origins — returns 404 if unauthorized.
 * Returns null if the request is permitted.
 */
function checkInternalApiAccess(request: NextRequest, pathname: string): NextResponse | null {
  const internalApiPaths = ['/api/maintenance'];
  const isInternalApiPath = internalApiPaths.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  );
  if (!isInternalApiPath) return null;

  const referer = request.headers.get('referer');
  const host = request.headers.get('host');
  const isInternal = referer && host && referer.includes(host);
  if (isInternal) return null;

  Sentry.addBreadcrumb({
    category: 'security',
    message: `Unauthorized API access attempt: ${pathname}`,
    level: 'warning',
    data: {
      ...securityBreadcrumbData(request, pathname, 'unauthorized-api'),
      host: host || 'unknown',
    },
  });

  return NextResponse.rewrite(new URL('/_not-found', request.url));
}

/** Build CSP directives array with nonce and environment-specific rules */
function buildCspDirectives(nonce: string, isDevelopment: boolean): string[] {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'${isDevelopment ? " 'unsafe-eval'" : ''} https://va.vercel-scripts.com https://*.vercel-insights.com https://sitesapi.io https://vercel.live`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://vercel.live",
    `img-src 'self' data: https://${SITE_DOMAIN} https://*.vercel.com https://vercel.com https://avatars.githubusercontent.com https://github.githubassets.com https://images.credly.com https://vercel.live`,
    "font-src 'self' https://fonts.gstatic.com https://vercel.live",
    `connect-src 'self'${isDevelopment ? ' ws://localhost:* wss://localhost:*' : ''} https://va.vercel-scripts.com https://*.vercel-insights.com https://vercel-insights.com https://*.sentry.io https://sitesapi.io https://vercel.live https://*.pusher.com wss://*.pusher.com`,
    "frame-src 'self' https://vercel.live https://giscus.app https://*.credly.com https://*.vercel-insights.com",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    'upgrade-insecure-requests',
    'block-all-mixed-content',
    'report-uri /api/csp-report',
  ];
}

/** Handle IndexNow API key file requests */
function handleIndexNowKeyFile(pathname: string): NextResponse | null {
  const txtFileMatch = pathname.match(/^\/([^/]+)\.txt$/);
  if (!txtFileMatch) return null;

  const requestedKey = txtFileMatch[1];
  const apiKey = process.env.INDEXNOW_API_KEY;

  // Validate UUID v4 format (lowercase with hyphens)
  const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (apiKey && uuidV4Regex.test(requestedKey)) {
    if (requestedKey.toLowerCase() === apiKey.toLowerCase()) {
      return new NextResponse(apiKey, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }
  }
  return null;
}

/**
 * Check /api/debug access — blocks outside local development.
 * /api/debug/* routes expose Redis config and similar internals.
 * Returns null if allowed.
 */
function checkDebugApiAccess(request: NextRequest, pathname: string): NextResponse | null {
  if (!pathname.startsWith('/api/debug')) return null;

  Sentry.addBreadcrumb({
    category: 'security',
    message: `Debug API access attempt blocked: ${pathname}`,
    level: 'warning',
    data: securityBreadcrumbData(request, pathname, 'debug-api-blocked'),
  });

  return NextResponse.rewrite(new URL('/_not-found', request.url));
}

/**
 * Enforce admin API key for /api/admin routes (H-001).
 * Requires Authorization: Bearer <ADMIN_API_KEY>.
 * Returns null if authorized.
 */
function checkAdminApiAuth(request: NextRequest, pathname: string): NextResponse | null {
  if (!pathname.startsWith('/api/admin')) return null;

  const auth = request.headers.get('Authorization');
  const adminKey = process.env.ADMIN_API_KEY;

  if (!adminKey || auth !== `Bearer ${adminKey}`) {
    Sentry.addBreadcrumb({
      category: 'security',
      message: `Unauthorized admin API access: ${pathname}`,
      level: 'error',
      data: securityBreadcrumbData(request, pathname, 'admin-unauthorized'),
    });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null;
}

/** Run security checks and return response if blocked */
function performSecurityChecks(
  request: NextRequest,
  pathname: string,
  pathnameLC: string,
  isDevelopment: boolean,
  isProduction: boolean
): NextResponse | null {
  if (!isDevelopment) {
    const suspiciousResponse = checkSuspiciousPath(request, pathnameLC, pathname);
    if (suspiciousResponse) return suspiciousResponse;
  }

  const honeypotResponse = checkHoneypotPath(request, pathname, ['/private']);
  if (honeypotResponse) return honeypotResponse;

  // /dev and /api/dev: block only in production so preview deployments retain access.
  // Vercel sets VERCEL_ENV=production exclusively for the live deployment.
  if (isProduction) {
    const devHoneypotResponse = checkHoneypotPath(request, pathname, ['/dev']);
    if (devHoneypotResponse) return devHoneypotResponse;

    const devApiResponse = checkDevApiAccess(request, pathname);
    if (devApiResponse) return devApiResponse;
  }

  // Internal API and debug routes: block in all non-local environments (preview + production).
  if (!isDevelopment) {
    const internalApiResponse = checkInternalApiAccess(request, pathname);
    if (internalApiResponse) return internalApiResponse;

    const debugApiResponse = checkDebugApiAccess(request, pathname);
    if (debugApiResponse) return debugApiResponse;
  }

  // Admin API auth: enforce in all environments including local dev.
  const adminAuthResponse = checkAdminApiAuth(request, pathname);
  if (adminAuthResponse) return adminAuthResponse;

  return null;
}

export default function proxy(request: NextRequest) {
  // Generate unique nonce for this request
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

  // Detect environment — isDevelopment is true only for local dev (NODE_ENV=development).
  // isProduction is true only for the live Vercel production deployment (VERCEL_ENV=production).
  // Preview deployments are neither: dev routes remain accessible there.
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.VERCEL_ENV === 'production';

  const pathname = request.nextUrl.pathname;
  const pathnameLC = pathname.toLowerCase();

  // Handle IndexNow API key file requests
  const keyFileResponse = handleIndexNowKeyFile(pathname);
  if (keyFileResponse) return keyFileResponse;

  // Run security checks
  const securityResponse = performSecurityChecks(
    request,
    pathname,
    pathnameLC,
    isDevelopment,
    isProduction
  );
  if (securityResponse) return securityResponse;

  // Build CSP directives with nonce
  const cspDirectives = buildCspDirectives(nonce, isDevelopment);
  const cspHeader = cspDirectives.join('; ');

  // Clone response headers
  const requestHeaders = new Headers(request.headers);

  // Pass nonce to components via custom header (in request headers for server components)
  requestHeaders.set('x-nonce', nonce);

  // Pass pathname to layouts for conditional rendering (embed detection)
  requestHeaders.set('x-pathname', pathname);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Set CSP header with nonce
  response.headers.set('Content-Security-Policy', cspHeader);

  // Log request to Axiom (fire-and-forget; no-ops when AXIOM_TOKEN is absent)
  const [axiomMessage, axiomReport] = transformMiddlewareRequest(request);
  void axiomLogger.info(axiomMessage, axiomReport);

  // Set nonce as a cookie for additional reliability
  // This ensures it's available through multiple mechanisms
  response.cookies.set('x-nonce', nonce, {
    httpOnly: true, // Prevent client-side access for security
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600, // 1 hour
  });

  return response;
}

// Apply middleware to all routes except static assets
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Public files with extensions (images, fonts, etc.)
     */
    {
      source:
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf)).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
