/**
 * Maintenance Workflows API
 * GET endpoint for fetching GitHub Actions workflow data
 */

import { NextRequest, NextResponse } from "next/server";
import { blockExternalAccess } from "@/lib/api-security";
import { getAllWorkflowSummaries } from "@/lib/github-workflows";
import { TRACKED_WORKFLOWS } from "@/types/maintenance";
import { createClient } from "redis";

const CACHE_KEY = "maintenance:workflow:summaries";
const CACHE_TTL = 300; // 5 minutes
const redisUrl = process.env.REDIS_URL;

/**
 * Get Redis client (with connection)
 */
async function getRedisClient() {
  if (!redisUrl) return null;

  try {
    const client = createClient({ url: redisUrl });
    await client.connect();
    return client;
  } catch {
    return null;
  }
}

/**
 * GET /api/maintenance/workflows
 * Fetches workflow summaries with Redis caching
 *
 * Query params:
 * - limit: Number of runs per workflow (default: 10)
 * - skip_cache: Skip Redis cache (default: false)
 */
export async function GET(request: NextRequest) {
  // Block external access - internal maintenance tools only
  const blockResponse = blockExternalAccess(request);
  if (blockResponse) return blockResponse;

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skipCache = searchParams.get("skip_cache") === "true";

    // Try to get from cache first (unless skip_cache is true)
    if (!skipCache) {
      try {
        const redis = await getRedisClient();
        if (redis) {
          try {
            const cached = await redis.get(CACHE_KEY);

            if (cached) {
              const data = JSON.parse(cached);
              return NextResponse.json({
                workflows: data,
                cached: true,
                timestamp: new Date().toISOString(),
              });
            }
          } finally {
            await redis.disconnect();
          }
        }
      } catch (cacheError) {
        // Redis unavailable - continue without cache
        console.warn("Redis cache unavailable, fetching fresh data:", cacheError);
      }
    }

    // Fetch fresh data from GitHub API
    const summaries = await getAllWorkflowSummaries(TRACKED_WORKFLOWS, limit);

    // Cache the results
    try {
      const redis = await getRedisClient();
      if (redis) {
        try {
          await redis.setEx(CACHE_KEY, CACHE_TTL, JSON.stringify(summaries));
        } finally {
          await redis.disconnect();
        }
      }
    } catch (cacheError) {
      // Redis unavailable - continue without caching
      console.warn("Failed to cache workflow data:", cacheError);
    }

    return NextResponse.json({
      workflows: summaries,
      cached: false,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to fetch workflow data:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch workflow data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
