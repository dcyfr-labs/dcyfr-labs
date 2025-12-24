/**
 * RSS Feed Route Handler
 *
 * Generates RSS 2.0 XML feed for the activity timeline.
 * Accessible at /activity/rss.xml
 *
 * @see /docs/features/activity-feed.md#rss-feed
 */

import { NextResponse } from "next/server";
import type { ActivityItem } from "@/lib/activity/types";
import { generateRSSFeed, filterActivitiesForRSS } from "@/lib/activity/rss";
import { createClient } from "redis";

// ============================================================================
// REDIS CLIENT HELPER
// ============================================================================

async function getRedisClient() {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) return null;

  try {
    const client = createClient({
      url: redisUrl,
      socket: {
        connectTimeout: 5000,
        reconnectStrategy: (retries) => {
          if (retries > 3) return new Error("Max retries exceeded");
          return Math.min(retries * 100, 3000);
        },
      },
    });

    if (!client.isOpen) {
      await client.connect();
    }

    return client;
  } catch (error) {
    console.error("[RSS Feed] Redis connection failed:", error);
    return null;
  }
}

// ============================================================================
// ROUTE HANDLER
// ============================================================================

/**
 * GET /activity/rss.xml - Generate RSS feed
 */
export async function GET() {
  try {
    // Fetch activities from cache
    const redis = await getRedisClient();
    let activities: ActivityItem[] = [];

    if (redis) {
      try {
        const cached = await redis.get("activity:feed:all");
        if (cached) {
          activities = JSON.parse(cached);
          console.log(`[RSS Feed] ✅ Loaded ${activities.length} items from cache`);
        } else {
          console.warn("[RSS Feed] ⚠️ Cache miss - returning empty feed");
        }
        await redis.quit();
      } catch (error) {
        console.error("[RSS Feed] Cache read error:", error);
        if (redis.isOpen) await redis.quit();
      }
    } else {
      console.warn("[RSS Feed] ⚠️ Redis unavailable - returning empty feed");
    }

    // Filter and generate RSS feed
    const rssActivities = filterActivitiesForRSS(activities);
    const rssXML = generateRSSFeed(rssActivities);

    // Return XML response with proper headers
    return new NextResponse(rssXML, {
      status: 200,
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("[RSS Feed] Generation error:", error);

    // Return empty but valid RSS feed on error
    const errorFeed = generateRSSFeed([], {
      description: "Activity feed temporarily unavailable",
    });

    return new NextResponse(errorFeed, {
      status: 500,
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  }
}

// Enable ISR with 5-minute revalidation (same as activity page)
export const revalidate = 300;
