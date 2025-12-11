/**
 * Research API Route
 *
 * AI-powered research endpoint using Perplexity API.
 * Provides real-time web search with citation generation.
 *
 * Security features:
 * - EXTERNAL ACCESS BLOCKED FOR SECURITY
 * - Rate limiting (5 requests/minute per IP)
 * - Input validation and sanitization
 * - Server-side caching (5 minutes)
 * - Graceful error handling
 * - Request size limits
 */

import { NextRequest, NextResponse } from "next/server";
import { blockExternalAccess } from "@/lib/api-security";
import {
  rateLimit,
  getClientIp,
  createRateLimitHeaders,
} from "@/lib/rate-limit";
import {
  research,
  isPerplexityConfigured,
  type ChatMessage,
  type PerplexityRequestOptions,
  type ResearchResult,
} from "@/lib/perplexity";
import { SERVICES } from "@/lib/site-config";
import {
  recordApiCall,
  estimatePerplexityCost,
} from "@/lib/api-guardrails";

// ============================================================================
// CONFIG
// ============================================================================

// Rate limiting: 5 requests per minute per IP
const RATE_LIMIT_CONFIG = {
  limit: SERVICES.perplexity.rateLimit.requestsPerMinute,
  windowInSeconds: 60,
};

// Request validation limits
const MAX_MESSAGES = 20; // Maximum messages in conversation
const MAX_MESSAGE_LENGTH = 10000; // Maximum characters per message
const MAX_TOTAL_LENGTH = 50000; // Maximum total characters in request

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate chat messages
 */
function validateMessages(messages: unknown): messages is ChatMessage[] {
  if (!Array.isArray(messages)) {
    return false;
  }

  if (messages.length === 0 || messages.length > MAX_MESSAGES) {
    return false;
  }

  let totalLength = 0;

  for (const message of messages) {
    if (
      typeof message !== "object" ||
      message === null ||
      !("role" in message) ||
      !("content" in message)
    ) {
      return false;
    }

    const role = message.role;
    const content = message.content;

    // Validate role
    if (!["system", "user", "assistant"].includes(role as string)) {
      return false;
    }

    // Validate content
    if (typeof content !== "string") {
      return false;
    }

    // Check message length
    if (content.length > MAX_MESSAGE_LENGTH) {
      return false;
    }

    totalLength += content.length;
  }

  // Check total length
  if (totalLength > MAX_TOTAL_LENGTH) {
    return false;
  }

  return true;
}

/**
 * Validate request options
 */
function validateOptions(
  options: unknown
): options is PerplexityRequestOptions {
  if (options === undefined || options === null) {
    return true; // Options are optional
  }

  if (typeof options !== "object") {
    return false;
  }

  const opts = options as Record<string, unknown>;

  // Validate model if provided
  if (opts.model !== undefined) {
    const validModels = [
      "llama-3.1-sonar-small-128k-online",
      "llama-3.1-sonar-large-128k-online",
      "llama-3.1-sonar-huge-128k-online",
    ];
    if (!validModels.includes(opts.model as string)) {
      return false;
    }
  }

  // Validate temperature if provided
  if (
    opts.temperature !== undefined &&
    (typeof opts.temperature !== "number" ||
      opts.temperature < 0 ||
      opts.temperature > 2)
  ) {
    return false;
  }

  // Validate max_tokens if provided
  if (
    opts.max_tokens !== undefined &&
    (typeof opts.max_tokens !== "number" ||
      opts.max_tokens < 1 ||
      opts.max_tokens > 4096)
  ) {
    return false;
  }

  // Validate search_recency_filter if provided
  if (opts.search_recency_filter !== undefined) {
    const validFilters = ["hour", "day", "week", "month"];
    if (!validFilters.includes(opts.search_recency_filter as string)) {
      return false;
    }
  }

  // Validate search_domain_filter if provided
  if (opts.search_domain_filter !== undefined) {
    if (
      !Array.isArray(opts.search_domain_filter) ||
      !opts.search_domain_filter.every((d) => typeof d === "string")
    ) {
      return false;
    }
  }

  return true;
}

// ============================================================================
// API ROUTE
// ============================================================================

/**
 * POST /api/research
 *
 * Request body:
 * {
 *   "messages": [
 *     { "role": "system", "content": "You are a helpful assistant." },
 *     { "role": "user", "content": "What are the latest React features?" }
 *   ],
 *   "options": {
 *     "model": "llama-3.1-sonar-large-128k-online",
 *     "return_citations": true,
 *     "search_recency_filter": "week"
 *   }
 * }
 *
 * Response:
 * {
 *   "content": "...",
 *   "citations": ["https://..."],
 *   "usage": {
 *     "promptTokens": 100,
 *     "completionTokens": 200,
 *     "totalTokens": 300
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  // Block external access for security
  const blockResponse = blockExternalAccess(request);
  if (blockResponse) return blockResponse;

  // Check if Perplexity is configured
  if (!isPerplexityConfigured()) {
    return NextResponse.json(
      {
        error: "Research service not configured",
        message:
          "Perplexity API key is not set. Please configure PERPLEXITY_API_KEY in your environment.",
      },
      { status: 503 }
    );
  }

  // Check API usage limits
  // API usage limits are enforced by the rate limiter (via trackApiUsage)
  // to avoid duplicated checks; proceed with rate limiting and per-request checks.
  // Rate limiting check
  const clientIp = getClientIp(request);
  const rateLimitResult = await rateLimit(clientIp, RATE_LIMIT_CONFIG);

  if (!rateLimitResult.success) {
    const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000);

    return NextResponse.json(
      {
        error: "Rate limit exceeded. Please try again later.",
        retryAfter,
      },
      {
        status: 429,
        headers: {
          ...createRateLimitHeaders(rateLimitResult),
          "Retry-After": retryAfter.toString(),
        },
      }
    );
  }

  // Parse and validate request body
  let body: unknown;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      {
        error: "Invalid JSON in request body",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 }
    );
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Request body must be a JSON object" },
      { status: 400 }
    );
  }

  const { messages, options } = body as {
    messages?: unknown;
    options?: unknown;
  };

  // Validate messages
  if (!validateMessages(messages)) {
    return NextResponse.json(
      {
        error: "Invalid messages format",
        message: `Messages must be an array of 1-${MAX_MESSAGES} chat messages with role and content fields. Each message must be under ${MAX_MESSAGE_LENGTH} characters.`,
      },
      { status: 400 }
    );
  }

  // Validate options
  if (!validateOptions(options)) {
    return NextResponse.json(
      {
        error: "Invalid options format",
        message:
          "Options must be a valid PerplexityRequestOptions object. See API documentation.",
      },
      { status: 400 }
    );
  }

  // Perform research
  try {
    console.log(`[Research API] Processing request for ${messages.length} messages`);

    const result: ResearchResult = await research(messages, options);

    console.log(
      `[Research API] Success - ${result.usage.totalTokens} tokens used`
    );

    // Track API usage and cost
    const estimatedCost = estimatePerplexityCost({
      model: options?.model || SERVICES.perplexity.defaultModel,
      promptTokens: result.usage.promptTokens,
      completionTokens: result.usage.completionTokens,
    });

    recordApiCall("perplexity", "/api/research", {
      cost: estimatedCost,
      tokens: result.usage.totalTokens,
    });

    console.log(
      `[Research API] Estimated cost: $${estimatedCost.toFixed(4)}`
    );

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": `public, s-maxage=${SERVICES.perplexity.cacheMinutes * 60}, stale-while-revalidate=${SERVICES.perplexity.cacheMinutes * 120}`,
        "X-Cache-Status": "MISS",
        ...createRateLimitHeaders(rateLimitResult),
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error("[Research API] Error:", errorMessage);
    if (errorStack) console.error("Stack trace:", errorStack);

    // Check for specific error types
    if (errorMessage.includes("API key not configured")) {
      return NextResponse.json(
        {
          error: "Service not configured",
          message: "Perplexity API key is not configured on the server.",
        },
        { status: 503 }
      );
    }

    if (errorMessage.includes("401") || errorMessage.includes("Unauthorized")) {
      return NextResponse.json(
        {
          error: "Authentication failed",
          message: "Invalid or expired Perplexity API key.",
        },
        { status: 503 }
      );
    }

    if (
      errorMessage.includes("429") ||
      errorMessage.toLowerCase().includes("rate limit")
    ) {
      return NextResponse.json(
        {
          error: "Upstream rate limit exceeded",
          message: "Perplexity API rate limit reached. Please try again later.",
        },
        { status: 503 }
      );
    }

    // Generic error response
    return NextResponse.json(
      {
        error: "Research request failed",
        message: "An error occurred while processing your research request.",
        details:
          process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/research
 *
 * Returns API status and configuration
 */
export async function GET(request: NextRequest) {
  // Block external access for security
  const blockResponse = blockExternalAccess(request);
  if (blockResponse) return blockResponse;

  const configured = isPerplexityConfigured();

  return NextResponse.json({
    service: "Perplexity AI Research",
    status: configured ? "available" : "not configured",
    configured,
    rateLimit: {
      requestsPerMinute: RATE_LIMIT_CONFIG.limit,
      windowSeconds: RATE_LIMIT_CONFIG.windowInSeconds,
    },
    cache: {
      ttlMinutes: SERVICES.perplexity.cacheMinutes,
    },
    models: [
      "llama-3.1-sonar-small-128k-online",
      "llama-3.1-sonar-large-128k-online",
      "llama-3.1-sonar-huge-128k-online",
    ],
    defaultModel: SERVICES.perplexity.defaultModel,
  });
}
