import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import * as Sentry from "@sentry/nextjs";

/**
 * CSP Violation Reporting Endpoint
 * 
 * Receives and logs Content Security Policy violations from browsers.
 * This endpoint helps monitor security issues and potential XSS attacks.
 * 
 * Security Features:
 * - Rate limiting: 30 reports per minute per IP
 * - PII anonymization: Only logs metadata, not user data
 * - Graceful error handling: Never blocks the user's browser
 * 
 * CSP Report Format (browser-generated):
 * {
 *   "csp-report": {
 *     "document-uri": "https://example.com/page",
 *     "referrer": "https://example.com/",
 *     "violated-directive": "script-src 'self'",
 *     "effective-directive": "script-src",
 *     "original-policy": "default-src 'self'; script-src 'self'",
 *     "blocked-uri": "https://evil.com/malicious.js",
 *     "status-code": 200,
 *     "source-file": "https://example.com/page",
 *     "line-number": 42,
 *     "column-number": 13
 *   }
 * }
 * 
 * Rate Limiting:
 * - Prevents abuse of the reporting endpoint
 * - Allows 30 reports/minute per IP (legitimate violations are rare)
 * - Uses shared Redis state in production for distributed rate limiting
 * - Falls back to in-memory rate limiting if Redis unavailable
 * 
 * Privacy:
 * - Logs only security-relevant metadata
 * - Excludes potentially sensitive URIs (query params, hashes)
 * - Never logs user-generated content
 * - Compliant with privacy regulations (GDPR, CCPA)
 * 
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP#violation_reporting
 * @see https://www.w3.org/TR/CSP3/#reporting
 */

export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting (30 reports per minute per IP)
    const clientIp = getClientIp(req);
    const rateLimitResult = await rateLimit(clientIp, {
      limit: 30,
      windowInSeconds: 60,
    });
    
    if (!rateLimitResult.success) {
      console.warn("CSP report rate limit exceeded", {
        ip: clientIp,
        remaining: rateLimitResult.remaining,
      });
      
      return NextResponse.json(
        { error: "Too many reports" },
        { status: 429 }
      );
    }

    // Parse CSP violation report
    const report = await req.json();
    
    // Extract relevant security information (anonymized)
    const cspReport = report["csp-report"] || {};
    
    // Log anonymized violation data
    const violationData = {
      timestamp: new Date().toISOString(),
      violatedDirective: cspReport["violated-directive"],
      effectiveDirective: cspReport["effective-directive"],
      blockedUri: anonymizeUri(cspReport["blocked-uri"]),
      documentUri: anonymizeUri(cspReport["document-uri"]),
      sourceFile: anonymizeUri(cspReport["source-file"]),
      lineNumber: cspReport["line-number"],
      columnNumber: cspReport["column-number"],
      statusCode: cspReport["status-code"],
      disposition: cspReport["disposition"], // "enforce" or "report"
    };

    // Check if this is a known false positive (browser extensions, dev tools)
    const isFalsePositive = isKnownFalsePositive(violationData, clientIp);

    // Always log to console for debugging (captured by Vercel logs)
    if (isFalsePositive) {
      console.warn("CSP Violation (Known False Positive):", JSON.stringify({
        ...violationData,
        reason: "Browser extension or development environment",
        filtered: true,
      }, null, 2));
    } else {
      console.warn("CSP Violation Report:", JSON.stringify(violationData, null, 2));
    }

    // Send to Sentry ONLY if it's not a known false positive
    if (!isFalsePositive) {
      try {
        Sentry.captureMessage("CSP Violation", {
          level: "warning",
          tags: {
            violatedDirective: violationData.violatedDirective,
            effectiveDirective: violationData.effectiveDirective,
            disposition: violationData.disposition,
          },
          extra: violationData,
          contexts: {
            csp: {
              violated_directive: violationData.violatedDirective,
              effective_directive: violationData.effectiveDirective,
              blocked_uri: violationData.blockedUri,
              document_uri: violationData.documentUri,
              source_file: violationData.sourceFile,
              line_number: violationData.lineNumber,
              column_number: violationData.columnNumber,
              disposition: violationData.disposition,
            },
          },
          // Custom fingerprint for better issue grouping
          fingerprint: [
            "csp-violation",
            violationData.effectiveDirective || "unknown",
            violationData.blockedUri || "unknown",
          ],
        });
      } catch (sentryError) {
        // Sentry errors should never break CSP reporting
        console.error("Failed to send CSP violation to Sentry:", sentryError);
      }
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    // Never fail the request - CSP reports shouldn't break the user's experience
    console.error("Error processing CSP report:", error);
    
    return NextResponse.json(
      { success: true }, // Return success even on error
      { status: 200 }
    );
  }
}

/**
 * Check if a CSP violation is a known false positive
 *
 * Filters out violations caused by:
 * - Browser extensions (cannot access nonces)
 * - Development tools (React DevTools, Redux DevTools, etc.)
 * - Localhost traffic (development environment)
 *
 * @param violationData - The CSP violation data
 * @param clientIp - The client IP address
 * @returns true if this is a known false positive, false otherwise
 */
function isKnownFalsePositive(
  violationData: {
    blockedUri: string;
    sourceFile: string;
    effectiveDirective?: string;
  },
  clientIp: string
): boolean {
  // Filter 1: Localhost traffic (development environment)
  // Real production violations won't come from 127.0.0.1
  if (clientIp === "127.0.0.1" || clientIp === "::1") {
    return true;
  }

  // Filter 2: Browser extension indicators
  // Extensions inject inline scripts without nonces
  const extensionIndicators = [
    "about", // Chrome extension internal pages (chrome://about, etc.)
    "chrome-extension://",
    "moz-extension://",
    "safari-extension://",
    "ms-browser-extension://",
  ];

  const sourceFile = violationData.sourceFile?.toLowerCase() || "";
  if (extensionIndicators.some(indicator => sourceFile.includes(indicator))) {
    return true;
  }

  // Filter 3: Inline script violations without legitimate source
  // Extensions typically inject inline scripts with no specific source file
  const isInlineScript = violationData.blockedUri === "inline";
  const hasVagueSource = sourceFile === "about" || sourceFile === "unknown" || !sourceFile;

  if (isInlineScript && hasVagueSource) {
    return true;
  }

  // Filter 4: Script-src-elem violations are often browser extensions
  // This is the most common directive violated by extensions
  if (
    violationData.effectiveDirective === "script-src-elem" &&
    isInlineScript &&
    hasVagueSource
  ) {
    return true;
  }

  // Not a known false positive - log to Sentry
  return false;
}

/**
 * Anonymize URIs by removing query parameters and hashes
 *
 * Removes potentially sensitive data like:
 * - Query parameters (may contain tokens, IDs, PII)
 * - Hash fragments (may contain state, tokens)
 * - User-specific paths (if configured)
 *
 * @param uri - The URI to anonymize
 * @returns Anonymized URI with only scheme, host, and path
 *
 * @example
 * anonymizeUri("https://example.com/page?token=secret#section")
 * // Returns: "https://example.com/page"
 *
 * anonymizeUri("inline")
 * // Returns: "inline" (special CSP value)
 */
function anonymizeUri(uri: string | undefined): string {
  if (!uri) return "unknown";

  // Special CSP values (inline, eval, etc.)
  if (!uri.startsWith("http")) return uri;

  try {
    const url = new URL(uri);
    // Return only scheme + host + pathname (no query, no hash)
    return `${url.protocol}//${url.host}${url.pathname}`;
  } catch {
    // If URL parsing fails, return the original (might be a special CSP keyword)
    return uri;
  }
}

/**
 * Allow only POST requests
 * CSP reports are sent via POST by browsers
 */
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. CSP reports must be sent via POST." },
    { status: 405 }
  );
}
