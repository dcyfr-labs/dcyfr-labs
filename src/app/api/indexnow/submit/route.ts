import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { inngest } from "@/inngest/client";
import {
  buildKeyLocation,
  isInngestBranchEnvironmentIssue,
  validateSameDomain,
} from "@/lib/indexnow/indexnow";
import { checkRateLimit, getClientIp } from "@/lib/indexnow/rate-limit";
import {
  INDEXNOW_EVENTS,
  type IndexNowSubmissionRequestedEventData,
} from "@/lib/indexnow/events";
import { blockExternalAccessExceptInngestAndSameOrigin } from "@/lib/api/api-security";

// IndexNow submission request schema
const IndexNowSubmissionSchema = z.object({
  urls: z.array(z.string().url()).min(1).max(10000),
  key: z.string().uuid().optional(), // Optional, will use env var if not provided
  keyLocation: z.string().url().optional(), // Optional, will auto-generate if not provided
});

export const runtime = "nodejs";
const INDEXNOW_SUBMIT_LIMIT = 30;
const INDEXNOW_SUBMIT_WINDOW_MS = 60_000;

function buildRateLimitHeaders(rateLimit: {
  limit: number;
  remaining: number;
  resetAt: number;
}): HeadersInit {
  return {
    "X-RateLimit-Limit": String(rateLimit.limit),
    "X-RateLimit-Remaining": String(rateLimit.remaining),
    "X-RateLimit-Reset": String(Math.floor(rateLimit.resetAt / 1000)),
  };
}

/** Queue IndexNow submission event or defer if Inngest branch environment missing */
async function queueIndexNowEvent(
  eventData: IndexNowSubmissionRequestedEventData
): Promise<{ status: "queued" | "deferred"; warning?: string }> {
  try {
    await inngest.send({
      name: INDEXNOW_EVENTS.submissionRequested,
      data: eventData,
    });
    return { status: "queued" };
  } catch (queueError) {
    const queueErrorMessage =
      queueError instanceof Error ? queueError.message : "Unknown queue error";
    const isBranchEnvIssue = isInngestBranchEnvironmentIssue(queueErrorMessage);

    if (!isBranchEnvIssue) {
      throw queueError;
    }

    console.warn("IndexNow queue deferred:", queueErrorMessage);
    return {
      status: "deferred",
      warning:
        "Inngest branch environment is not configured; submission accepted but not queued.",
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Block external access - restrict to Inngest service and dcyfr.ai origin only
    const accessError = blockExternalAccessExceptInngestAndSameOrigin(request);
    if (accessError) {
      return accessError;
    }

    const clientIp = getClientIp(request.headers);
    const rateLimit = checkRateLimit(
      `indexnow-submit:${clientIp}`,
      INDEXNOW_SUBMIT_LIMIT,
      INDEXNOW_SUBMIT_WINDOW_MS
    );

    if (!rateLimit.allowed) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((rateLimit.resetAt - Date.now()) / 1000)
      );

      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          limit: rateLimit.limit,
          remaining: rateLimit.remaining,
          resetAt: new Date(rateLimit.resetAt).toISOString(),
        },
        {
          status: 429,
          headers: {
            ...buildRateLimitHeaders(rateLimit),
            "Retry-After": String(retryAfterSeconds),
          },
        }
      );
    }

    // 1. VALIDATE
    const body = await request.json();
    const validation = IndexNowSubmissionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: validation.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const { urls, key, keyLocation } = validation.data;

    // Validate environment
    const apiKey = key || process.env.INDEXNOW_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "IndexNow API key not configured" },
        { status: 503 }
      );
    }

    // Generate key location if not provided
    const finalKeyLocation = buildKeyLocation(
      process.env.NEXT_PUBLIC_SITE_URL,
      apiKey,
      keyLocation
    );

    // Validate URLs are from our domain (security check)
    const domainValidation = validateSameDomain(
      urls,
      process.env.NEXT_PUBLIC_SITE_URL
    );
    if (!domainValidation.isValid) {
      return NextResponse.json(
        {
          error: "URLs must be from the same domain as the application",
          invalidUrl: domainValidation.invalidUrl,
          allowedDomain: domainValidation.allowedDomain,
        },
        { status: 400 }
      );
    }

    // 2. QUEUE
    const requestId = crypto.randomUUID();
    const eventData: IndexNowSubmissionRequestedEventData = {
      urls,
      key: apiKey,
      keyLocation: finalKeyLocation,
      requestId,
      requestedAt: Date.now(),
      userAgent: request.headers.get("user-agent") || "unknown",
      ip: clientIp,
    };

    const queueResult = await queueIndexNowEvent(eventData);

    // 3. RESPOND
    return NextResponse.json(
      {
        success: true,
        message:
          queueResult.status === "queued"
            ? "IndexNow submission queued successfully"
            : "IndexNow submission accepted (queue deferred)",
        requestId,
        queueStatus: queueResult.status,
        ...(queueResult.warning ? { warning: queueResult.warning } : {}),
        queued: {
          urls: urls.length,
          keyLocation: finalKeyLocation,
        },
      },
      {
        headers: buildRateLimitHeaders(rateLimit),
      }
    );
  } catch (error) {
    console.error("IndexNow submission error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: "Internal server error",
        ...(process.env.NODE_ENV === "development"
          ? { detail: errorMessage }
          : {}),
      },
      { status: 500 }
    );
  }
}

// GET method for API documentation/status
export async function GET() {
  return NextResponse.json({
    service: "IndexNow Submission API",
    version: "1.0.0",
    documentation: {
      method: "POST",
      endpoint: "/api/indexnow/submit",
      description:
        "Submit URLs to IndexNow protocol for real-time search indexing",
      schema: {
        urls: "string[] (required) - Array of URLs to submit (max 10,000)",
        key: "string (optional) - IndexNow API key (UUID format)",
        keyLocation: "string (optional) - URL where key file is hosted",
      },
      example: {
        urls: [
          "https://www.dcyfr.ai/blog/new-post",
          "https://www.dcyfr.ai/features/updated-feature",
        ],
      },
    },
    status: {
      keyConfigured: !!process.env.INDEXNOW_API_KEY,
      appUrlConfigured: !!process.env.NEXT_PUBLIC_SITE_URL,
    },
  });
}
