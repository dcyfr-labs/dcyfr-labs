/**
 * POST /api/views
 *
 * Records a blog post view with comprehensive anti-spam protection.
 *
 * Request body:
 * {
 *   postId: string (required) - permanent post identifier
 *   sessionId: string (required) - client-generated session ID (UUID v4)
 *   timeOnPage: number (required) - milliseconds spent on page (must be >= 5000)
 *   isVisible: boolean (required) - whether page is visible (from Visibility API)
 * }
 *
 * Response:
 * Success (200):
 * {
 *   recorded: true,
 *   count: 42
 * }
 *
 * Duplicate (200):
 * {
 *   recorded: false,
 *   count: null,
 *   message: "View already recorded for this session"
 * }
 *
 * Not visible (200):
 * {
 *   recorded: false,
 *   count: null,
 *   error: "Page is not visible"
 * }
 *
 * Rate limited (429):
 * {
 *   error: "Rate limit exceeded",
 *   recorded: false
 * }
 *
 * Validation error (400):
 * {
 *   error: "Invalid postId",
 *   recorded: false
 * }
 *
 * Server error (500):
 * {
 *   error: "Failed to record view",
 *   recorded: false
 * }
 *
 * Protection layers:
 * 1. Input validation (postId, sessionId format)
 * 2. Page visibility check
 * 3. Request validation (user-agent, etc)
 * 4. Timing validation (minimum time on page)
 * 5. Abuse pattern detection
 * 6. Rate limiting (IP-based)
 * 7. Session deduplication (prevent same session counting twice)
 */

import { NextRequest, NextResponse } from "next/server";
import {
  validateRequest,
  checkSessionDuplication,
  recordAbuseAttempt,
  detectAbusePattern,
  validateTiming,
  isValidSessionId,
  getClientIp,
} from "@/lib/anti-spam";
import { incrementPostViews } from "@/lib/views";
import { rateLimit } from "@/lib/rate-limit";

type ViewRequest = {
  postId?: unknown;
  sessionId?: unknown;
  timeOnPage?: unknown;
  isVisible?: unknown;
};

type ViewResponse = {
  recorded: boolean;
  count?: number | null;
  error?: string;
  message?: string;
};

/**
 * Helper to create rate limit headers
 */
function createRateLimitHeaders(rateLimitResult: {
  limit: number;
  remaining: number;
  reset: number;
}) {
  return {
    "X-RateLimit-Limit": rateLimitResult.limit.toString(),
    "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
    "X-RateLimit-Reset": rateLimitResult.reset.toString(),
  };
}

export async function POST(request: NextRequest): Promise<NextResponse<ViewResponse>> {
  const clientIp = getClientIp(request);

  try {
    // Parse request body
    let data: ViewRequest;
    try {
      data = await request.json();
    } catch (error) {
      console.error("[View API] Invalid JSON:", error);
      return NextResponse.json(
        {
          error: "Failed to record view - invalid request",
          recorded: false,
        },
        { status: 500 }
      );
    }

    // Validate input types and presence
    if (typeof data.postId !== "string" || !data.postId.trim()) {
      return NextResponse.json(
        {
          error: "Invalid postId - must be a non-empty string",
          recorded: false,
        },
        { status: 400 }
      );
    }

    if (!isValidSessionId(data.sessionId)) {
      return NextResponse.json(
        {
          error: "Invalid sessionId - must be a valid UUID",
          recorded: false,
        },
        { status: 400 }
      );
    }

    if (typeof data.timeOnPage !== "number" || data.timeOnPage < 0) {
      return NextResponse.json(
        {
          error: "Invalid timeOnPage - must be a positive number",
          recorded: false,
        },
        { status: 400 }
      );
    }

    if (typeof data.isVisible !== "boolean") {
      return NextResponse.json(
        {
          error: "Invalid isVisible - must be a boolean",
          recorded: false,
        },
        { status: 400 }
      );
    }

    const postId = data.postId.trim();
    const sessionId = data.sessionId as string;
    const timeOnPage = data.timeOnPage as number;
    const isVisible = data.isVisible as boolean;

    // Check if page is visible - don't count hidden views
    if (!isVisible) {
      return NextResponse.json(
        {
          recorded: false,
          count: null,
          error: "Page is not visible - view not recorded",
        },
        { status: 200 }
      );
    }

    // Layer 1: Validate request (user-agent, headers, etc)
    const requestValidation = validateRequest(request);
    if (!requestValidation.valid) {
      await recordAbuseAttempt(clientIp, "view", requestValidation.reason!);
      return NextResponse.json(
        {
          error: `Request validation failed: ${requestValidation.reason}`,
          recorded: false,
        },
        { status: 400 }
      );
    }

    // Layer 2: Validate timing
    const timingValidation = validateTiming("view", timeOnPage);
    if (!timingValidation.valid) {
      await recordAbuseAttempt(clientIp, "view", timingValidation.reason!);
      return NextResponse.json(
        {
          recorded: false,
          count: null,
          error: `Insufficient time on page: ${timingValidation.reason}`,
        },
        { status: 200 }
      );
    }

    // Layer 3: Detect abuse patterns
    const isAbusePattern = await detectAbusePattern(clientIp, "view");
    if (isAbusePattern) {
      await recordAbuseAttempt(clientIp, "view", "abuse_pattern_detected");
      return NextResponse.json(
        {
          error: "Suspicious activity detected",
          recorded: false,
        },
        { status: 429 }
      );
    }

    // Layer 4: Rate limiting
    const rateLimitResult = await rateLimit(`view:${clientIp}`, {
      limit: 10,
      windowInSeconds: 300, // 5 minutes
    });

    const headers = createRateLimitHeaders(rateLimitResult);

    if (!rateLimitResult.success) {
      await recordAbuseAttempt(clientIp, "view", "rate_limit_exceeded");
      return NextResponse.json(
        {
          error: "Rate limit exceeded - too many views from this IP",
          recorded: false,
        },
        { status: 429, headers }
      );
    }

    // Layer 5: Session deduplication
    const isDuplicate = await checkSessionDuplication(
      "view",
      postId,
      sessionId,
      1800 // 30 minutes
    );

    if (isDuplicate) {
      // Not an error, just not counted (don't record abuse)
      return NextResponse.json(
        {
          recorded: false,
          count: null,
          message: "View already recorded for this session",
        },
        { status: 200, headers }
      );
    }

    // All validations passed - increment view count
    const count = await incrementPostViews(postId);

    return NextResponse.json(
      {
        recorded: true,
        count,
      },
      { status: 200, headers }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[View API] Error:", message);

    return NextResponse.json(
      {
        error: "Failed to record view - server error",
        recorded: false,
      },
      { status: 500 }
    );
  }
}
