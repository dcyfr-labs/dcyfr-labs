import { NextRequest, NextResponse } from "next/server";
// import { checkBotId } from "botid/server"; // Disabled - see PR #112
import { blockExternalAccess } from "@/lib/api-security";
import { rateLimit, getClientIp, createRateLimitHeaders } from "@/lib/rate-limit";
import { RATE_LIMITS } from "@/lib/api-guardrails";
import { inngest } from "@/inngest/client";
import { trackContactFormSubmission } from "@/lib/analytics";
import { handleApiError } from "@/lib/error-handler";

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
  website?: string; // Honeypot field
};

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function sanitizeInput(input: string): string {
  return input.trim().slice(0, 1000); // Basic sanitization and length limit
}

export async function POST(request: NextRequest) {
  // Block external access for security
  const blockResponse = blockExternalAccess(request);
  if (blockResponse) return blockResponse;

  let body: ContactFormData | undefined;
  
  try {
    /* BotID temporarily disabled due to false positives - see PR #112
    // Optional bot detection using Vercel BotID
    // If BotID is unavailable or misconfigured, we gracefully fall back to
    // rate limiting + honeypot + input validation for protection
    // See: https://vercel.com/docs/botid/get-started
    //
    // Toggle BotID via ENABLE_BOTID env var (set to '1' to enable). Default is disabled.
    // This approach allows us to re-enable BotID quickly after verifying configuration
    // in the Vercel dashboard without code changes.
    if (process.env.ENABLE_BOTID === '1') {
      try {
        const verification = await checkBotId();

        // Only block if BotID confidently identifies this as a bot (not a verified bot like search engines)
        // Verified bots (search engines, monitoring) are allowed through
        if (verification.isBot && !verification.isVerifiedBot && !verification.bypassed) {
          console.log("[Contact API] Bot detected by BotID - blocking request");
          return NextResponse.json(
            { error: "Access denied" },
            { status: 403 }
          );
        }
      } catch (botIdError) {
        // BotID is optional - if it fails, continue with fallback protection
        // Common reasons: not configured, CSP issues, network errors, timeout
        // Log only the error message (avoid printing full error objects which may contain sensitive data)
        console.warn("[Contact API] BotID check failed, using fallback protection (rate limit + honeypot):",
          botIdError instanceof Error ? botIdError.message : String(botIdError)
        );
      }
    }
    */

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

    body = await request.json();
    const { name, email, message, website } = body || {};

    // Honeypot validation - if filled, it's likely a bot
    if (website && website.trim() !== "") {
      console.log("[Contact API] Honeypot triggered - likely bot submission");
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

    // Send event to Inngest for background processing
    // This returns immediately, making the API response much faster
    try {
      await inngest.send({
        name: "contact/form.submitted",
        data: {
          name: sanitizedData.name,
          email: sanitizedData.email,
          message: sanitizedData.message,
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
      console.info("Contact form submission queued:", {
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
