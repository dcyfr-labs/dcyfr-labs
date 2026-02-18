import { NextResponse } from "next/server";
import { SITE_DOMAIN } from "@/lib/site-config";
import type { NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";

/**
 * Suspicious paths that indicate reconnaissance or attack attempts.
 * Access attempts to these paths are logged to Sentry for security monitoring.
 */
const SUSPICIOUS_PATHS = [
  // Common admin/management paths
  "/admin",
  "/administrator",
  "/wp-admin",
  "/wp-login",
  "/wp-content",
  "/wordpress",
  "/cms",
  "/cpanel",
  "/phpmyadmin",
  "/mysql",
  "/adminer",
  // Common config/env paths
  "/.env",
  "/.git",
  "/.svn",
  "/config",
  "/backup",
  "/db",
  "/database",
  "/sql",
  "/dump",
  // Common API exploit paths
  "/api/v1",
  "/api/v2",
  "/graphql",
  "/rest",
  // Common scanner paths
  "/debug",
  "/trace",
  "/server-status",
  "/server-info",
  "/phpinfo",
  "/info.php",
  "/test.php",
  "/shell",
  "/cmd",
  "/exec",
  "/eval",
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
    userAgent: request.headers.get("user-agent") || "unknown",
    ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
    referer: request.headers.get("referer") || "none",
  };
}

/** Build Sentry context for honeypot attempts */
function honeypotAttemptContext(request: NextRequest, pathname: string) {
  return {
    path: pathname,
    user_agent: request.headers.get("user-agent") || "unknown",
    referer: request.headers.get("referer") || "direct",
    ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
    timestamp: new Date().toISOString(),
  };
}

/**
 * Check suspicious path access — logs to Sentry and returns 404 response if suspicious.
 * Returns null if the path is not suspicious.
 */
function checkSuspiciousPath(request: NextRequest, pathnameLC: string, pathname: string): NextResponse | null {
  const isSuspicious = SUSPICIOUS_PATHS.some(
    (p) => pathnameLC === p || pathnameLC.startsWith(p + "/") || pathnameLC.startsWith(p + ".")
  );
  if (!isSuspicious) return null;

  Sentry.addBreadcrumb({
    category: "security",
    message: `Suspicious path access attempt: ${pathname}`,
    level: "warning",
    data: securityBreadcrumbData(request, pathname, "reconnaissance"),
  });

  return NextResponse.rewrite(new URL("/_not-found", request.url));
}

/**
 * Check honeypot paths — logs to Sentry and returns 404 response if triggered.
 * Returns null if the path is not a honeypot.
 */
function checkHoneypotPath(request: NextRequest, pathname: string, paths: string[]): NextResponse | null {
  const triggered = paths.some((p) => pathname === p || pathname.startsWith(p + "/"));
  if (!triggered) return null;

  Sentry.addBreadcrumb({
    category: "security",
    message: `Honeypot triggered: ${pathname}`,
    level: "warning",
    data: securityBreadcrumbData(request, pathname, "honeypot"),
  });

  Sentry.setContext("honeypot_attempt", honeypotAttemptContext(request, pathname));

  return NextResponse.rewrite(new URL("/_not-found", request.url));
}

/**
 * Check dev API access in production — logs to Sentry and returns 404 if blocked.
 * Returns null if the path is allowed.
 */
function checkDevApiAccess(request: NextRequest, pathname: string): NextResponse | null {
  if (!pathname.startsWith("/api/dev/")) return null;

  Sentry.addBreadcrumb({
    category: "security",
    message: `Dev API access attempt: ${pathname}`,
    level: "warning",
    data: securityBreadcrumbData(request, pathname, "dev-api-blocked"),
  });

  return NextResponse.rewrite(new URL("/_not-found", request.url));
}

/**
 * Check internal API access from external origins — returns 404 if unauthorized.
 * Returns null if the request is permitted.
 */
function checkInternalApiAccess(request: NextRequest, pathname: string): NextResponse | null {
  const internalApiPaths = ["/api/maintenance"];
  const isInternalApiPath = internalApiPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  if (!isInternalApiPath) return null;

  const referer = request.headers.get("referer");
  const host = request.headers.get("host");
  const isInternal = referer && host && referer.includes(host);
  if (isInternal) return null;

  Sentry.addBreadcrumb({
    category: "security",
    message: `Unauthorized API access attempt: ${pathname}`,
    level: "warning",
    data: {
      ...securityBreadcrumbData(request, pathname, "unauthorized-api"),
      host: host || "unknown",
    },
  });

  return NextResponse.rewrite(new URL("/_not-found", request.url));
}

export default function proxy(request: NextRequest) {
  // Generate unique nonce for this request
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  // Detect development environment
  const isDevelopment = process.env.NODE_ENV === "development";

  const pathname = request.nextUrl.pathname;
  const pathnameLC = pathname.toLowerCase();

  // ===================================================================
  // IndexNow API Key File Handler
  // ===================================================================
  // Serve IndexNow API key at /<key>.txt for search engine verification
  // See: https://www.bing.com/indexnow/getstarted#keyfiledocs
  const txtFileMatch = pathname.match(/^\/([^/]+)\.txt$/);
  if (txtFileMatch) {
    const requestedKey = txtFileMatch[1];
    const apiKey = process.env.INDEXNOW_API_KEY;

    // Validate UUID v4 format (lowercase with hyphens)
    const uuidV4Regex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (apiKey && uuidV4Regex.test(requestedKey)) {
      if (requestedKey.toLowerCase() === apiKey.toLowerCase()) {
        // Matched! Serve the key file
        return new NextResponse(apiKey, {
          status: 200,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=86400", // 24 hours
          },
        });
      }
    }
    // No match or invalid format - let Next.js handle 404 for *.txt files
    // (fall through to normal routing for ai.txt, security.txt, etc.)
  }
  // ===================================================================

  // Security monitoring: detect and report suspicious path access attempts
  if (!isDevelopment) {
    const suspiciousResponse = checkSuspiciousPath(request, pathnameLC, pathname);
    if (suspiciousResponse) return suspiciousResponse;
  }

  // Honeypot routes - always active
  const honeypotResponse = checkHoneypotPath(request, pathname, ["/private"]);
  if (honeypotResponse) return honeypotResponse;

  // Dev-only honeypot paths + dev API blocking
  if (!isDevelopment) {
    const devHoneypotResponse = checkHoneypotPath(request, pathname, ["/dev"]);
    if (devHoneypotResponse) return devHoneypotResponse;

    const devApiResponse = checkDevApiAccess(request, pathname);
    if (devApiResponse) return devApiResponse;

    const internalApiResponse = checkInternalApiAccess(request, pathname);
    if (internalApiResponse) return internalApiResponse;
  }

  // Build CSP directives with nonce
  const cspDirectives = [
    // Default: only allow same-origin resources
    "default-src 'self'",

    // Scripts: self with nonce, external analytics, BotID, and Vercel Live
    // Using nonce instead of unsafe-inline for improved security
    // In development, add 'unsafe-eval' for Turbopack HMR
    `script-src 'self' 'nonce-${nonce}'${isDevelopment ? " 'unsafe-eval'" : ""} https://va.vercel-scripts.com https://*.vercel-insights.com https://sitesapi.io https://vercel.live`,

    // Styles: self with unsafe-inline (no nonce)
    // Note: Cannot use nonce for styles because third-party scripts (Vercel, Next.js fonts, React)
    // inject styles dynamically without nonces, and browsers ignore 'unsafe-inline' when nonce is present.
    // This is acceptable because inline style injection poses much lower XSS risk than inline scripts.
    // We maintain strict nonce-based CSP for scripts where it matters most for security.
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://vercel.live",

    // Images: self, data URIs, production domain, Vercel domains, GitHub (for Giscus avatars), Credly (for certification badges), and Vercel Live
  `img-src 'self' data: https://${SITE_DOMAIN} https://*.vercel.com https://vercel.com https://avatars.githubusercontent.com https://github.githubassets.com https://images.credly.com https://vercel.live`,

    // Fonts: self, Google Fonts CDN, and Vercel Live
    "font-src 'self' https://fonts.gstatic.com https://vercel.live",

    // Connect: self, Vercel analytics endpoints, Sentry error reporting, BotID API, and Vercel Live (for feedback/comments)
    // In development, allow webpack/turbopack HMR websockets
    `connect-src 'self'${isDevelopment ? " ws://localhost:* wss://localhost:*" : ""} https://va.vercel-scripts.com https://*.vercel-insights.com https://vercel-insights.com https://*.sentry.io https://sitesapi.io https://vercel.live https://*.pusher.com wss://*.pusher.com`,

    // Frame: allow self (own domain), Vercel Live for preview feedback, Giscus for blog comments, Credly embeds, and Vercel Analytics for fingerprinting
    "frame-src 'self' https://vercel.live https://giscus.app https://*.credly.com https://*.vercel-insights.com",

    // Worker: allow blob URIs for Sentry session replay
    "worker-src 'self' blob:",

    // Objects: no plugins
    "object-src 'none'",

    // Base URI: restrict to self
    "base-uri 'self'",

    // Form actions: only to self
    "form-action 'self'",

    // Upgrade insecure requests
    "upgrade-insecure-requests",

    // Block all mixed content
    "block-all-mixed-content",

    // CSP violation reporting
    "report-uri /api/csp-report",
  ];

  const cspHeader = cspDirectives.join("; ");

  // Clone response headers
  const requestHeaders = new Headers(request.headers);

  // Pass nonce to components via custom header (in request headers for server components)
  requestHeaders.set("x-nonce", nonce);

  // Pass pathname to layouts for conditional rendering (embed detection)
  requestHeaders.set("x-pathname", pathname);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Set CSP header with nonce
  response.headers.set("Content-Security-Policy", cspHeader);

  // Set nonce as a cookie for additional reliability
  // This ensures it's available through multiple mechanisms
  response.cookies.set("x-nonce", nonce, {
    httpOnly: true, // Prevent client-side access for security
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
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
      source: "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf)).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
