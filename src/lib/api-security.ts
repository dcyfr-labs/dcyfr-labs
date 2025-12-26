import { NextRequest, NextResponse } from 'next/server';

/**
 * Security utility for Inngest webhooks - allow Inngest service only
 */
export function blockExternalAccessExceptInngest(request: NextRequest): NextResponse | null {
  // Block all external access in production except Inngest
  if (process.env.NODE_ENV === 'production') {
    const userAgent = request.headers.get('user-agent') || '';
    const inngestSignature = request.headers.get('x-inngest-signature');
    const inngestTimestamp = request.headers.get('x-inngest-timestamp');
    
    // Allow Inngest service (has signature headers and user agent)
    if (inngestSignature && inngestTimestamp && userAgent.includes('inngest')) {
      return null; // Allow request
    }
    
    // Block all other external access
    return new NextResponse('API access disabled', { 
      status: 404,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
  
  // In development, be more permissive
  return null;
}

/**
 * Security utility to block all external API access
 *
 * This function should be called at the start of every API route
 * to ensure APIs are only accessible to internal services.
 */
export function blockExternalAccess(request: NextRequest): NextResponse | null {
  // Block all external access in production
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('API access disabled', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain',
      }
    });
  }

  // In development, check for specific internal patterns
  const userAgent = request.headers.get('user-agent') || '';
  const referer = request.headers.get('referer') || '';

  // Allow localhost and internal services in development
  const isInternal =
    referer.includes('localhost') ||
    userAgent.includes('vercel-cron') ||
    userAgent.includes('inngest') ||
    request.headers.get('x-vercel-deployment-url') ||
    request.headers.get('x-internal-request');

  if (!isInternal) {
    return new NextResponse('API access disabled', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain',
      }
    });
  }

  // Allow request to continue
  return null;
}

/**
 * External API Security - SSRF Prevention
 * Prevents Server-Side Request Forgery attacks by whitelisting allowed external domains
 */

// Whitelist of allowed external API domains
const ALLOWED_EXTERNAL_DOMAINS = [
  'api.perplexity.ai',
  'www.googleapis.com',
  'indexing.googleapis.com',
  'api.github.com',
  'raw.githubusercontent.com',
];

// Block internal IP ranges (SSRF prevention)
const INTERNAL_IP_RANGES = [
  /^127\./,           // Loopback
  /^10\./,            // Private range (10.0.0.0/8)
  /^172\.(?:1[6-9]|2\d|3[01])\./,  // Private range (172.16.0.0/12)
  /^192\.168\./,      // Private range (192.168.0.0/16)
  /^::1$|^\[::1\]$/,            // IPv6 loopback (with or without brackets)
  /^fc00:|^\[fc00:/,           // IPv6 unique local (fc00::/7)
  /^fe80:|^\[fe80:/,           // IPv6 link-local (fe80::/10)
];

export type ExternalUrlValidationResult = {
  valid: boolean;
  reason?: string;
};

/**
 * Validate that a URL is safe to fetch
 * Prevents SSRF attacks by blocking internal IPs and non-whitelisted domains
 *
 * @param urlString - The URL to validate
 * @returns Validation result with success status and reason if invalid
 */
export function validateExternalUrl(urlString: string): ExternalUrlValidationResult {
  try {
    const url = new URL(urlString);

    // Block non-HTTPS in production
    if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') {
      return { valid: false, reason: 'Only HTTPS allowed in production' };
    }

    // Block internal IP ranges FIRST (highest priority security check)
    for (const ipPattern of INTERNAL_IP_RANGES) {
      if (ipPattern.test(url.hostname)) {
        return { valid: false, reason: `Internal IP range blocked: ${url.hostname}` };
      }
    }

    // Check if domain is whitelisted
    const isWhitelisted = ALLOWED_EXTERNAL_DOMAINS.some(domain =>
      url.hostname === domain || url.hostname.endsWith('.' + domain)
    );

    if (!isWhitelisted) {
      return { valid: false, reason: `Domain not whitelisted: ${url.hostname}` };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, reason: 'Invalid URL format' };
  }
}

/**
 * Safe fetch wrapper that validates URLs before making requests
 * Prevents SSRF attacks by enforcing URL validation
 *
 * @param url - The URL to fetch
 * @param options - Standard fetch options
 * @returns Promise<Response>
 * @throws Error if URL validation fails
 */
export async function safeFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const validation = validateExternalUrl(url);
  if (!validation.valid) {
    throw new Error(`SSRF protection: ${validation.reason}`);
  }

  return fetch(url, options);
}

/**
 * Add a domain to the whitelist (for testing or dynamic scenarios)
 * Use with caution - preferably only in development
 *
 * @param domain - Domain to whitelist (without protocol)
 */
export function whitelistExternalDomain(domain: string): void {
  if (process.env.NODE_ENV === 'production') {
    console.warn('⚠️  Attempted to whitelist domain in production:', domain);
    return;
  }

  if (!ALLOWED_EXTERNAL_DOMAINS.includes(domain)) {
    ALLOWED_EXTERNAL_DOMAINS.push(domain);
  }
}