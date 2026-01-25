/**
 * Like API Endpoint
 *
 * POST /api/engagement/like
 * Increments or decrements global like count in Redis
 *
 * Request body:
 * {
 *   "slug": "my-post",
 *   "contentType": "post" | "project" | "activity",
 *   "action": "like" | "unlike"
 * }
 *
 * Security:
 * - Rate limiting: 30 requests per minute per IP
 */

import { NextRequest, NextResponse } from "next/server";
import {
  incrementLikes,
  decrementLikes,
  getLikes,
  type ContentType,
} from "@/lib/engagement-analytics";
import { rateLimit, getClientIp, createRateLimitHeaders } from "@/lib/rate-limit";

interface LikeRequestBody {
  slug: string;
  contentType: ContentType;
  action: "like" | "unlike";
}

export async function POST(request: NextRequest) {
  // Rate limiting: 30 requests per minute per IP
  const clientIp = getClientIp(request);
  const rateLimitResult = await rateLimit(`engagement:like:${clientIp}`, {
    limit: 30,
    windowInSeconds: 60,
  });

  if (!rateLimitResult.success) {
    const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000);
    return NextResponse.json(
      { error: "Rate limit exceeded", retryAfter },
      {
        status: 429,
        headers: {
          ...createRateLimitHeaders(rateLimitResult),
          "Retry-After": retryAfter.toString(),
        },
      }
    );
  }

  try {
    const body = (await request.json()) as LikeRequestBody;
    const { slug, contentType, action } = body;

    // Validate input
    if (!slug || !contentType || !action) {
      return NextResponse.json(
        { error: "Missing required fields: slug, contentType, action" },
        { status: 400 }
      );
    }

    if (!["post", "project", "activity"].includes(contentType)) {
      return NextResponse.json(
        { error: "Invalid contentType. Must be post, project, or activity" },
        { status: 400 }
      );
    }

    if (!["like", "unlike"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be like or unlike" },
        { status: 400 }
      );
    }

    // Perform action
    let newCount: number | null;
    if (action === "like") {
      newCount = await incrementLikes(contentType, slug);
    } else {
      newCount = await decrementLikes(contentType, slug);
    }

    // Handle Redis unavailable
    if (newCount === null) {
      return NextResponse.json(
        { error: "Analytics unavailable", count: 0 },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      count: newCount,
      action,
    });
  } catch (error) {
    console.error("[API] Like endpoint error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Get like count for content
 *
 * GET /api/engagement/like?slug=my-post&contentType=post
 */
export async function GET(request: NextRequest) {
  // Rate limiting: 60 requests per minute per IP (higher for reads)
  const clientIp = getClientIp(request);
  const rateLimitResult = await rateLimit(`engagement:like:get:${clientIp}`, {
    limit: 60,
    windowInSeconds: 60,
  });

  if (!rateLimitResult.success) {
    const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000);
    return NextResponse.json(
      { error: "Rate limit exceeded", retryAfter },
      {
        status: 429,
        headers: {
          ...createRateLimitHeaders(rateLimitResult),
          "Retry-After": retryAfter.toString(),
        },
      }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const contentType = searchParams.get("contentType") as ContentType;

    if (!slug || !contentType) {
      return NextResponse.json(
        { error: "Missing required query params: slug, contentType" },
        { status: 400 }
      );
    }

    const count = await getLikes(contentType, slug);

    if (count === null) {
      return NextResponse.json(
        { error: "Analytics unavailable", count: 0 },
        { status: 503 }
      );
    }

    return NextResponse.json({ count });
  } catch (error) {
    console.error("[API] Like GET endpoint error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
