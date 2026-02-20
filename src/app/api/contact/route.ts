import { NextRequest, NextResponse } from 'next/server';
// import { checkBotId } from "botid/server"; // TEMPORARILY DISABLED - causing 403 errors
// blockExternalAccess NOT imported - contact form is public user-facing endpoint
import { rateLimit, getClientIp, createRateLimitHeaders } from '@/lib/rate-limit';
import { RATE_LIMITS } from '@/lib/api/api-guardrails';
import { inngest } from '@/inngest/client';
import { trackContactFormSubmission } from '@/lib/analytics';
import { handleApiError } from '@/lib/error-handler';
import { getPromptScanner } from '@/lib/security';

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
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

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

type ValidationResult =
  | { ok: true; data: { name: string; email: string; message: string; role?: string } }
  | { ok: false; response: ReturnType<typeof NextResponse.json> };

/**
 * Validate and sanitize contact form data.
 * Returns either validated data or a ready-made error response.
 */
function validateContactData(body: ContactFormData): ValidationResult {
  const { name, email, message, role } = body;

  if (!name || !email || !message) {
    return { ok: false, response: NextResponse.json({ error: 'All fields are required' }, { status: 400 }) };
  }
  if (!validateEmail(email)) {
    return { ok: false, response: NextResponse.json({ error: 'Invalid email address' }, { status: 400 }) };
  }

  const data = {
    name: sanitizeInput(name),
    email: sanitizeInput(email),
    message: sanitizeInput(message),
    role: role ? sanitizeInput(role) : undefined,
  };

  if (data.name.length < 2) {
    return { ok: false, response: NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 }) };
  }
  if (data.message.length < 10) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Message must be at least 10 characters' }, { status: 400 }),
    };
  }

  return { ok: true, data };
}

type ParseResult = { ok: true; body: ContactFormData } | { ok: false; response: ReturnType<typeof NextResponse.json> };

/**
 * Parse, size-check, and JSON-decode the request body.
 */
async function parseRequestBody(request: NextRequest): Promise<ParseResult> {
  const maxSize = 50 * 1024;
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > maxSize) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Request too large', message: `Request size must not exceed ${Math.floor(maxSize / 1024)}KB` },
        { status: 413 }
      ),
    };
  }

  try {
    const rawBody = await request.text();
    if (Buffer.byteLength(rawBody, 'utf8') > maxSize) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: 'Request too large', message: `Request size must not exceed ${Math.floor(maxSize / 1024)}KB` },
          { status: 413 }
        ),
      };
    }
    const body = JSON.parse(rawBody);
    if (!body || typeof body !== 'object') {
      return { ok: false, response: NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 }) };
    }
    return { ok: true, body: body as ContactFormData };
  } catch (error) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Invalid JSON in request body', message: error instanceof Error ? error.message : 'Unknown error' },
        { status: 400 }
      ),
    };
  }
}

/** Run prompt security scan; returns a rejection response or null if scan passes/soft-fails */
async function scanMessageSecurity(message: string): Promise<ReturnType<typeof NextResponse.json> | null> {
  try {
    const scanner = getPromptScanner();
    const scanResult = await scanner.scanPrompt(message, {
      maxRiskScore: 70,
      cacheResults: true,
    });
    if (!scanResult.safe || scanResult.severity === 'critical') {
      console.warn('[Contact API] Prompt threat detected:', {
        severity: scanResult.severity,
        riskScore: scanResult.riskScore,
        threatCount: scanResult.threats.length,
      });
      return NextResponse.json(
        { error: 'Message validation failed', message: 'Your message could not be processed. Please review your content and try again.' },
        { status: 400 }
      );
    }
    return null;
  } catch (scanError) {
    console.error('[Contact API] Prompt scanning failed:', scanError);
    return null; // fail open
  }
}

/** Send sanitized contact data to Inngest and return a success/error response. */
async function sendContactToInngest(
  sanitizedData: { name: string; email: string; message: string; role?: string },
  clientIp: string,
  rateLimitResult: Awaited<ReturnType<typeof rateLimit>>
): Promise<ReturnType<typeof NextResponse.json>> {
  try {
    await inngest.send({
      name: 'contact/form.submitted',
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
      false // We don't track if they have LinkedIn for privacy
    ).catch((err) => console.warn('Analytics tracking failed:', err));

    console.warn('Contact form submission queued:', {
      nameLength: sanitizedData.name.length,
      emailDomain: sanitizedData.email.split('@')[1] || 'unknown',
      messageLength: sanitizedData.message.length,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Message received successfully. You'll receive a confirmation email shortly.",
      },
      { status: 200, headers: createRateLimitHeaders(rateLimitResult) }
    );
  } catch (inngestError) {
    console.error(
      'Failed to queue contact form:',
      inngestError instanceof Error ? inngestError.message : String(inngestError)
    );
    return NextResponse.json(
      { error: 'Failed to process your message. Please try again later.' },
      { status: 500 }
    );
  }
}

/**
 * Handle validated contact submission: BotID check, rate limiting, honeypot,
 * data validation, security scan, and Inngest queue dispatch.
 */
async function handleContactSubmission(
  request: NextRequest,
  body: ContactFormData
): Promise<ReturnType<typeof NextResponse.json> | Response> {
  // BotID check — TEMPORARILY DISABLED (causing 403 errors on initial setup).
  // To re-enable: 1) Go to Vercel Dashboard → Settings → Security → Enable Bot Protection
  //               2) Set ENABLE_BOTID=1 in Vercel environment variables
  //               3) Uncomment the import at top and the checkBotId() call below
  //               4) Change `false` below back to the env var check
  const shouldUseBotId = false; // process.env.NODE_ENV === 'production' && process.env.ENABLE_BOTID === '1';

  if (shouldUseBotId) {
    try {
      // TEMPORARILY DISABLED: checkBotId import is commented out to prevent 403 errors
      // const verification = await checkBotId();
      // if (verification.isBot && !verification.isVerifiedBot && !verification.bypassed) {
      //   console.warn("[Contact API] Bot detected by BotID - blocking request");
      //   return NextResponse.json({ error: "Access denied" }, { status: 403 });
      // }
    } catch (botIdError) {
      console.warn(
        '[Contact API] BotID check failed, using fallback protection (rate limit + honeypot):',
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
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          ...createRateLimitHeaders(rateLimitResult),
          'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  // Honeypot validation - if filled, it's likely a bot
  if (body.website && body.website.trim() !== '') {
    console.warn('[Contact API] Honeypot triggered - likely bot submission');
    return NextResponse.json(
      { success: true, message: "Message received. We'll get back to you soon!" },
      { status: 200 }
    );
  }

  // Validate and sanitize contact fields
  const validation = validateContactData(body);
  if (!validation.ok) return validation.response;
  const sanitizedData = validation.data;

  // Prompt security scanning - detect adversarial patterns
  const scanRejection = await scanMessageSecurity(sanitizedData.message);
  if (scanRejection) return scanRejection;

  return sendContactToInngest(sanitizedData, clientIp, rateLimitResult);
}

export async function POST(request: NextRequest) {
  // NOTE: blockExternalAccess() is NOT used here because this is a PUBLIC
  // user-facing endpoint that must accept requests from users' browsers.
  // Security is provided by: rate limiting, honeypot field, input validation,
  // and optionally BotID in production environments (requires ENABLE_BOTID=1).
  // BotID is disabled in non-production environments to prevent false positives.

  // Parse and size-check the request body
  const parseResult = await parseRequestBody(request);
  if (!parseResult.ok) return parseResult.response;
  const body = parseResult.body;

  try {
    return await handleContactSubmission(request, body);
  } catch (error) {
    const errorInfo = handleApiError(error, {
      route: '/api/contact',
      method: 'POST',
      additionalData: body ? { emailDomain: body.email?.split('@')[1] } : {},
    });

    if (errorInfo.isConnectionError) {
      return new Response(null, { status: errorInfo.statusCode });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: errorInfo.statusCode });
  }
}
