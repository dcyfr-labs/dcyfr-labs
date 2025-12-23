import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/error-handler";
import { rateLimit, getClientIp, createRateLimitHeaders } from "@/lib/rate-limit";
import type { CredlyBadgesResponse } from "@/types/credly";

/**
 * Credly Badges API Route
 * 
 * Fetches public badge data from Credly for the specified user.
 * This is a proxy endpoint to avoid CORS issues and add caching.
 * 
 * Endpoint: GET /api/credly/badges?username=dcyfr&limit=10
 * 
 * Rate Limiting: 10 requests per minute per IP
 * Cache: 1 hour (badges don't change frequently)
 */

const CREDLY_USERNAME = "dcyfr";
const CACHE_TTL = 60 * 60; // 1 hour in seconds

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimitResult = await rateLimit(clientIp, {
      limit: 10,
      windowInSeconds: 60,
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        {
          status: 429,
          headers: createRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username") || CREDLY_USERNAME;
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    // ✅ SSRF Protection: Validate username format
    // Only allow alphanumeric characters, hyphens, underscores, and dots
    if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
      return NextResponse.json(
        { error: "Invalid username format. Only alphanumeric, dots, hyphens, and underscores allowed." },
        { status: 400 }
      );
    }

    // ✅ Additional validation: Max length to prevent abuse
    if (username.length > 255) {
      return NextResponse.json(
        { error: "Username too long" },
        { status: 400 }
      );
    }

    // ✅ SSRF Protection: Use URL constructor to prevent injection
    // This ensures the username cannot break out of the pathname
    const credlyUrl = new URL("https://www.credly.com");
    credlyUrl.pathname = `/users/${encodeURIComponent(username)}/badges.json`;

    const response = await fetch(credlyUrl.toString(), {
      next: { revalidate: CACHE_TTL },
    });

    if (!response.ok) {
      throw new Error(`Credly API returned ${response.status}`);
    }

    const data: CredlyBadgesResponse = await response.json();

    // Limit results if requested
    const badges = limit > 0 ? data.data.slice(0, limit) : data.data;

    return NextResponse.json(
      {
        badges,
        total_count: data.metadata.total_count,
        count: badges.length,
      },
      {
        status: 200,
        headers: {
          ...createRateLimitHeaders(rateLimitResult),
          "Cache-Control": `public, s-maxage=${CACHE_TTL}, stale-while-revalidate`,
        },
      }
    );
  } catch (error) {
    const errorResult = handleApiError(error, {
      route: "/api/credly/badges",
      method: "GET",
    });
    
    return NextResponse.json(
      { error: errorResult.message },
      { status: errorResult.statusCode }
    );
  }
}
