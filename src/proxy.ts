import { NextResponse } from "next/server";
import { SITE_DOMAIN } from "@/lib/site-config";
import type { NextRequest } from "next/server";

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

export default function proxy(request: NextRequest) {
  // Generate unique nonce for this request
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  
  // Detect development environment
  const isDevelopment = process.env.NODE_ENV === "development";

  // Protect developer-only pages at request time. Even if a page was
  // prerendered during build as development content, middleware runs at
  // request time so we can reliably serve a 404 in non-development envs.
  const devOnlyPaths = ["/dev"];
  const pathname = request.nextUrl.pathname;
  if (!isDevelopment) {
    for (const p of devOnlyPaths) {
      if (pathname === p || pathname.startsWith(p + "/")) {
        // Rewrite to Next's not-found page
        return NextResponse.rewrite(new URL("/_not-found", request.url));
      }
    }
  }
  
  // Build CSP directives with nonce
  const cspDirectives = [
    // Default: only allow same-origin resources
    "default-src 'self'",
    
    // Scripts: self with nonce, external analytics, and Vercel Live
    // Using nonce instead of unsafe-inline for improved security
    // In development, add 'unsafe-eval' for Turbopack HMR
    `script-src 'self' 'nonce-${nonce}'${isDevelopment ? " 'unsafe-eval'" : ""} https://va.vercel-scripts.com https://*.vercel-insights.com https://vercel.live`,
    
    // Styles: self with unsafe-inline (no nonce)
    // Note: Cannot use nonce for styles because third-party scripts (Vercel, Next.js fonts, React)
    // inject styles dynamically without nonces, and browsers ignore 'unsafe-inline' when nonce is present.
    // This is acceptable because inline style injection poses much lower XSS risk than inline scripts.
    // We maintain strict nonce-based CSP for scripts where it matters most for security.
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://vercel.live",
    
    // Images: self, data URIs, production domain, Vercel domains, GitHub (for Giscus avatars), and Vercel Live
  `img-src 'self' data: https://${SITE_DOMAIN} https://*.vercel.com https://vercel.com https://avatars.githubusercontent.com https://github.githubassets.com https://vercel.live`,
    
    // Fonts: self, Google Fonts CDN, and Vercel Live
    "font-src 'self' https://fonts.gstatic.com https://vercel.live",
    
    // Connect: self, Vercel analytics endpoints, Sentry error reporting, and Vercel Live (for feedback/comments)
    // In development, allow webpack/turbopack HMR websockets
    `connect-src 'self'${isDevelopment ? " ws://localhost:* wss://localhost:*" : ""} https://va.vercel-scripts.com https://*.vercel-insights.com https://vercel-insights.com https://*.sentry.io https://vercel.live https://*.pusher.com wss://*.pusher.com`,
    
    // Frame: allow Vercel Live for preview feedback and Giscus for blog comments
    "frame-src https://vercel.live https://giscus.app",
    
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
  
  // Pass nonce to components via custom header
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Set CSP header with nonce
  response.headers.set("Content-Security-Policy", cspHeader);

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
