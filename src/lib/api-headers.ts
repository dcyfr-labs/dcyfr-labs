/**
 * API Security Headers Utility
 *
 * Centralized security headers for all API endpoints.
 * Implements OWASP security best practices.
 */

/**
 * Security headers for all API responses
 *
 * Protects against:
 * - MIME type sniffing attacks
 * - Clickjacking
 * - XSS attacks
 * - Information leakage
 */
export const SECURITY_HEADERS = {
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // Prevent framing (clickjacking protection)
  'X-Frame-Options': 'DENY',

  // Remove server fingerprinting
  'X-Powered-By': '',

  // Enable XSS protection in older browsers
  'X-XSS-Protection': '1; mode=block',

  // Referrer policy for privacy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
} as const;

/**
 * CORS headers for public APIs
 * Use sparingly - only for intentionally public endpoints
 */
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400', // 24 hours
} as const;

/**
 * Restrictive CORS for same-origin only
 */
export function createSameOriginCorsHeaders(origin: string | null): Record<string, string> {
  if (!origin) {
    return {};
  }

  // Only allow same origin
  const allowedOrigins = [
    'https://www.dcyfr.ai',
    'https://www.dcyfr.ai',
    ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000'] : []),
  ];

  if (!allowedOrigins.includes(origin)) {
    return {};
  }

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

/**
 * Combine security headers with custom headers
 */
export function createSecureHeaders(
  customHeaders: Record<string, string> = {}
): Record<string, string> {
  return {
    ...SECURITY_HEADERS,
    ...customHeaders,
  };
}

/**
 * Create headers for public API with CORS
 */
export function createPublicApiHeaders(
  customHeaders: Record<string, string> = {}
): Record<string, string> {
  return {
    ...SECURITY_HEADERS,
    ...CORS_HEADERS,
    ...customHeaders,
  };
}

/**
 * Create headers for JSON API responses
 */
export function createJsonHeaders(
  customHeaders: Record<string, string> = {}
): Record<string, string> {
  return {
    ...SECURITY_HEADERS,
    'Content-Type': 'application/json; charset=utf-8',
    ...customHeaders,
  };
}

/**
 * Create cache headers for API responses
 */
export function createCacheHeaders(
  options: {
    maxAge?: number;
    sMaxAge?: number;
    staleWhileRevalidate?: number;
    public?: boolean;
  } = {}
): Record<string, string> {
  const { maxAge = 0, sMaxAge, staleWhileRevalidate, public: isPublic = false } = options;

  const directives: string[] = [];

  if (isPublic) {
    directives.push('public');
  } else {
    directives.push('private');
  }

  if (maxAge > 0) {
    directives.push(`max-age=${maxAge}`);
  } else {
    directives.push('no-cache', 'no-store', 'must-revalidate');
  }

  if (sMaxAge !== undefined) {
    directives.push(`s-maxage=${sMaxAge}`);
  }

  if (staleWhileRevalidate !== undefined) {
    directives.push(`stale-while-revalidate=${staleWhileRevalidate}`);
  }

  return {
    'Cache-Control': directives.join(', '),
  };
}

/**
 * Create no-cache headers (always fetch fresh)
 */
export function createNoCacheHeaders(): Record<string, string> {
  return {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  };
}
