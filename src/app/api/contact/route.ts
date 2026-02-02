import { NextRequest, NextResponse } from "next/server";
// import { checkBotId } from "botid/server"; // TEMPORARILY DISABLED - causing 403 errors
// blockExternalAccess NOT imported - contact form is public user-facing endpoint
import { rateLimit, getClientIp, createRateLimitHeaders } from "@/lib/rate-limit";
import { RATE_LIMITS } from "@/lib/api-guardrails";
import { inngest } from "@/inngest/client";
import { trackContactFormSubmission } from "@/lib/analytics";
import { handleApiError } from "@/lib/error-handler";
import { getPromptScanner } from "@/lib/security/prompt-scanner";

// Rate limit: 3 requests per minute per IP (from centralized guardrails config)
// Fail closed on Redis errors to protect against abuse during outages
const RATE_LIMIT_CONFIG = {
  limit: RATE_LIMITS.contact.requestsPerMinute,
  windowInSeconds: 60,
  failClosed: true,
};

type ContactFormData = {
  name: string;
  email: string;
  message: string;
  role?: string; // Optional role field
  website?: string; // Honeypot field
};

function validateEmail(email: string): boolean {
  // RFC 5322 compliant email validation (simplified but more robust)
  // Validates:
  // - Local part: alphanumeric + allowed special chars
  // - @ symbol
  // - Domain: valid format with proper TLD (min 2 chars)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(email)) {
    return false;
  }

  // Additional validation: check for valid TLD length (min 2 chars)
  const parts = email.split('@');
  if (parts.length !== 2) return false;

  const domain = parts[1];
  const tld = domain.split('.').pop();

  // TLD must be at least 2 characters (e.g., .io, .com, but not .c)
  if (!tld || tld.length < 2) {
    return false;
  }

  // Email length validation (max 254 per RFC 5321)
  if (email.length > 254) {
    return false;
  }

  return true;
}

function sanitizeInput(input: string): string {
  return input.trim().slice(0, 1000); // Basic sanitization and length limit
}

export async function POST(request: NextRequest) {
  // NOTE: blockExternalAccess() is NOT used here because this is a PUBLIC
  // user-facing endpoint that must accept requests from users' browsers.
  // Security is provided by: rate limiting, honeypot field, input validation,
  // and optionally BotID in production environments (requires ENABLE_BOTID=1).
  // BotID is disabled in non-production environments to prevent false positives.

  // Validate request size to prevent DoS attacks via large payloads
  const contentLength = request.headers.get("content-length");
  const maxSize = 50 * 1024; // 50KB limit for contact form

  // Primary check: Content-Length header (for production environments)
  if (contentLength && parseInt(contentLength) > maxSize) {
    return NextResponse.json(
      {
        error: "Request too large",
        message: `Request size must not exceed ${Math.floor(maxSize / 1024)}KB`,
      },
      { status: 413 } // Payload Too Large
    );
  }

  // Secondary check: Body size validation (for testing/environments without Content-Length)
  let rawBody: string;
  let body: any;
  try {
    rawBody = await request.text();

    // Check actual body size
    const bodySize = Buffer.byteLength(rawBody, 'utf8');
    if (bodySize > maxSize) {
      return NextResponse.json(
        {
          error: "Request too large",
          message: `Request size must not exceed ${Math.floor(maxSize / 1024)}KB`,
        },
        { status: 413 } // Payload Too Large
      );
    }

    // Re-parse JSON from the text
    body = JSON.parse(rawBody);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Invalid JSON in request body",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 }
    );
  }

  // Validate the parsed data
  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Request body must be a JSON object" },
      { status: 400 }
    );
  }

  const contactData = body as ContactFormData;

  try {
    // Optional bot detection using Vercel BotID
    // If BotID is unavailable or misconfigured, we gracefully fall back to
    // rate limiting + honeypot + input validation for protection
    // See: https://vercel.com/docs/botid/get-started
    //
    // Toggle BotID via ENABLE_BOTID env var (set to '1' to enable). Default is disabled.
    // This approach allows us to re-enable BotID quickly after verifying configuration
    // in the Vercel dashboard without code changes.
    //
    // IMPORTANT: Only enable BotID in production AND when explicitly enabled via env var
    // This prevents false positives in development/preview and requires deliberate activation
    // TEMPORARILY DISABLED: BotID causing 403 errors - investigate configuration
    const shouldUseBotId = false; // process.env.NODE_ENV === 'production' && process.env.ENABLE_BOTID === '1';

    if (shouldUseBotId) {
      try {
        // TEMPORARILY DISABLED: checkBotId import is commented out to prevent 403 errors
        // Uncomment the import and this code when BotID is properly configured
        // const verification = await checkBotId();

        // // Only block if BotID confidently identifies this as a bot (not a verified bot like search engines)
        // // Verified bots (search engines, monitoring) are allowed through
        // if (verification.isBot && !verification.isVerifiedBot && !verification.bypassed) {
        //   console.warn("[Contact API] Bot detected by BotID - blocking request");
        //   return NextResponse.json(
        //     { error: "Access denied" },
        //     { status: 403 }
        //   );
        // }
      } catch (botIdError) {
        // BotID is optional - if it fails, continue with fallback protection
        // Common reasons: not configured, CSP issues, network errors, timeout
        // Log only the error message (avoid printing full error objects which may contain sensitive data)
        console.warn("[Contact API] BotID check failed, using fallback protection (rate limit + honeypot):",
          botIdError instanceof Error ? botIdError.message : String(botIdError)
        );
      }
    }

    // Apply rate limiting
    const clientIp = getClientIp(request);
    const rateLimitResult = await rateLimit(clientIp, RATE_LIMIT_CONFIG);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Too many requests. Please try again later.",
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            ...createRateLimitHeaders(rateLimitResult),
            "Retry-After": Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Extract form data (body was already parsed from request.text() above)
    // Extract form data (body was already parsed from request.text() above)
    const { name, email, message, role, website } = body || {};

    // Honeypot validation - if filled, it's likely a bot
    if (website && website.trim() !== "") {
      console.warn("[Contact API] Honeypot triggered - likely bot submission");
      // Return success to avoid revealing the honeypot
      return NextResponse.json(
        {
          success: true,
          message: "Message received. We'll get back to you soon!"
        },
        { status: 200 }
      );
    }

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeInput(name),
      email: sanitizeInput(email),
      message: sanitizeInput(message),
      role: role ? sanitizeInput(role) : undefined,
    };

    // Validate lengths
    if (sanitizedData.name.length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters" },
        { status: 400 }
      );
    }

    if (sanitizedData.message.length < 10) {
      return NextResponse.json(
        { error: "Message must be at least 10 characters" },
        { status: 400 }
      );
    }

    // Prompt security scanning - detect adversarial patterns
    try {
      const scanner = getPromptScanner();
      const scanResult = await scanner.scanPrompt(sanitizedData.message, {
        maxRiskScore: 70, // Block if risk score > 70
        cacheResults: true,
      });

      // Block if threats detected
      if (!scanResult.safe || scanResult.severity === 'critical') {
        console.warn("[Contact API] Prompt threat detected:", {
          severity: scanResult.severity,
          riskScore: scanResult.riskScore,
          threatCount: scanResult.threats.length,
        });

        // Return generic error to avoid leaking security details
        return NextResponse.json(
          {
            error: "Message validation failed",
            message: "Your message could not be processed. Please review your content and try again.",
          },
          { status: 400 }
        );
      }
    } catch (scanError) {
      // Fail open - if scanning fails, allow submission but log error
      console.error("[Contact API] Prompt scanning failed:", scanError);
    }

    //
    // Send event to Inngest for background processing
    // This returns immediately, making the API response much faster
    try {
      await inngest.send({
        name: "contact/form.submitted",
        data: {
          name: sanitizedData.name,
          email: sanitizedData.email,
          message: sanitizedData.message,
          role: sanitizedData.role,
          submittedAt: new Date().toISOString(),
          ip: clientIp,
        },
      });

      // Track analytics (async, don't wait)
      trackContactFormSubmission(
        sanitizedData.message.length,
        false, // We don't track if they have GitHub for privacy
        false  // We don't track if they have LinkedIn for privacy
      ).catch(err => console.warn("Analytics tracking failed:", err));

      // Log submission (anonymized)
      // Log an anonymized summary to avoid storing user-provided content in logs
      console.warn("Contact form submission queued:", {
        nameLength: sanitizedData.name.length,
        emailDomain: sanitizedData.email.split('@')[1] || 'unknown',
        messageLength: sanitizedData.message.length,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json(
        {
          success: true,
          message: "Message received successfully. You'll receive a confirmation email shortly."
        },
        {
          status: 200,
          headers: createRateLimitHeaders(rateLimitResult),
        }
      );
    } catch (inngestError) {
      // Avoid printing full error objects that could include sensitive details
      console.error("Failed to queue contact form:", inngestError instanceof Error ? inngestError.message : String(inngestError));
      return NextResponse.json(
        { error: "Failed to process your message. Please try again later." },
        { status: 500 }
      );
    }
  } catch (error) {
    const errorInfo = handleApiError(error, {
      route: "/api/contact",
      method: "POST",
      additionalData: body ? { emailDomain: body.email?.split('@')[1] } : {},
    });

    // For connection errors, return minimal response
    if (errorInfo.isConnectionError) {
      return new Response(null, { status: errorInfo.statusCode });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: errorInfo.statusCode }
    );
  }
}
