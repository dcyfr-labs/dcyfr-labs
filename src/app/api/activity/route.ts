/**
 * Activity Feed API Endpoint
 *
 * Provides a unified REST API for fetching aggregated activity from multiple sources.
 * Supports filtering by source type, time range, and pagination.
 *
 * Features:
 * - Rate limiting (60 requests per minute)
 * - 5-minute cache with stale-while-revalidate
 * - Real-time trending and milestone data from Redis
 * - GitHub activity integration
 * - Engagement-based filtering
 *
 * @route GET /api/activity
 */

import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import {
  transformPosts,
  transformProjects,
  transformChangelog,
  aggregateActivities,
} from "@/lib/activity/sources";
import {
  transformPostsWithViews,
  transformTrendingPosts,
  transformMilestones,
  transformHighEngagementPosts,
  transformCommentMilestones,
  transformGitHubActivity,
} from "@/lib/activity/sources.server";
import { posts } from "@/data/posts";
import { projects } from "@/data/projects";
import { changelog } from "@/data/changelog";
import type { ActivityItem } from "@/lib/activity/types";

/**
 * GET /api/activity
 *
 * Query Parameters:
 * - sources: Comma-separated list of sources to include (blog,project,trending,milestone,engagement,github,changelog)
 * - limit: Maximum number of items to return (default: 50, max: 100)
 * - after: ISO timestamp - only include items after this date
 * - before: ISO timestamp - only include items before this date
 *
 * Example: /api/activity?sources=blog,trending,milestone&limit=20
 */
export async function GET(request: NextRequest) {
  // Extract client IP for rate limiting
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : "127.0.0.1";

  // Rate limiting: 60 requests per minute
  try {
    const rateLimitResult = await rateLimit(ip, {
      limit: 60,
      windowInSeconds: 60,
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          retryAfter: rateLimitResult.reset,
        },
        {
          status: 429,
          headers: {
            "Retry-After": rateLimitResult.reset?.toString() || "60",
          },
        }
      );
    }
  } catch (error) {
    console.error("[Activity API] Rate limiting error:", error);
    // Continue without rate limiting if Redis is unavailable
  }

  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const sourcesParam = searchParams.get("sources");
  const limitParam = searchParams.get("limit");
  const afterParam = searchParams.get("after");
  const beforeParam = searchParams.get("before");

  const sources = sourcesParam
    ? sourcesParam.split(",").map((s) => s.trim())
    : [];
  const limit = Math.min(
    parseInt(limitParam || "50", 10),
    100
  ); // Max 100 items

  const after = afterParam ? new Date(afterParam) : undefined;
  const before = beforeParam ? new Date(beforeParam) : undefined;

  try {
    // Gather activity from all sources in parallel
    const activities: ActivityItem[] = [];

    const fetchPromises: Promise<void>[] = [];

    // Standard blog posts (enriched with views)
    if (!sources.length || sources.includes("blog")) {
      fetchPromises.push(
        transformPostsWithViews(posts)
          .then((items) => {
            activities.push(...items);
          })
          .catch((error) => {
            console.error("[Activity API] Blog posts fetch failed:", error);
            // Continue without blog posts
          })
      );
    }

    // Projects
    if (!sources.length || sources.includes("project")) {
      fetchPromises.push(
        Promise.resolve(transformProjects([...projects])).then((items) => {
          activities.push(...items);
        })
      );
    }

    // Changelog
    if (!sources.length || sources.includes("changelog")) {
      fetchPromises.push(
        Promise.resolve(transformChangelog(changelog)).then((items) => {
          activities.push(...items);
        })
      );
    }

    // Trending posts (from Redis)
    if (!sources.length || sources.includes("trending")) {
      fetchPromises.push(
        transformTrendingPosts(posts, 10)
          .then((items) => {
            activities.push(...items);
          })
          .catch((error) => {
            console.error("[Activity API] Trending posts fetch failed:", error);
            // Continue without trending posts
          })
      );
    }

    // Milestones (from Redis)
    if (!sources.length || sources.includes("milestone")) {
      fetchPromises.push(
        transformMilestones(posts, 20)
          .then((items) => {
            activities.push(...items);
          })
          .catch((error) => {
            console.error("[Activity API] Milestones fetch failed:", error);
            // Continue without milestones
          })
      );
    }

    // High engagement posts
    if (!sources.length || sources.includes("engagement")) {
      fetchPromises.push(
        transformHighEngagementPosts(posts, 5, 10)
          .then((items) => {
            activities.push(...items);
          })
          .catch((error) => {
            console.error("[Activity API] High engagement posts fetch failed:", error);
            // Continue without engagement posts
          })
      );
    }

    // Comment milestones
    if (!sources.length || sources.includes("comments")) {
      fetchPromises.push(
        transformCommentMilestones(posts, 10)
          .then((items) => {
            activities.push(...items);
          })
          .catch((error) => {
            console.error("[Activity API] Comment milestones fetch failed:", error);
            // Continue without comment milestones
          })
      );
    }

    // GitHub activity
    if (!sources.length || sources.includes("github")) {
      fetchPromises.push(
        transformGitHubActivity("dcyfr", ["dcyfr-labs"], 15)
          .then((items) => {
            activities.push(...items);
          })
          .catch((error) => {
            console.error("[Activity API] GitHub activity fetch failed:", error);
            // Continue without GitHub activities
          })
      );
    }

    // Wait for all sources to complete
    await Promise.all(fetchPromises);

    // Aggregate and sort
    const aggregated = aggregateActivities(activities, {
      limit,
      after,
      before,
    });

    return NextResponse.json(
      {
        success: true,
        count: aggregated.length,
        total: activities.length,
        activities: aggregated,
        filters: {
          sources: sources.length ? sources : "all",
          limit,
          after: after?.toISOString(),
          before: before?.toISOString(),
        },
      },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=300, stale-while-revalidate=600",
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("[Activity API] Failed to fetch activity feed:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch activity feed",
        message:
          error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
