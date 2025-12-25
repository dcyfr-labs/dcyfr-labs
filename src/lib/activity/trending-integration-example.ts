/**
 * Trending Integration Example
 *
 * This file demonstrates how to integrate trending calculation into activity sources.
 * Copy the relevant patterns into your actual activity source files (sources.ts, etc.)
 *
 * @module lib/activity/trending-integration-example
 */

import type { ActivityItem } from "./types";
import { calculateTrendingStatus, type EngagementMetrics } from "./trending";

// ============================================================================
// EXAMPLE: Enriching Blog Post Activities with Trending Status
// ============================================================================

/**
 * Example: Enrich a blog post activity with trending metadata
 *
 * This would typically be called from your blog activity source generator
 * (e.g., in src/lib/activity/sources.ts or src/lib/activity/blog-source.ts)
 */
export async function enrichBlogPostWithTrending(
  activity: ActivityItem
): Promise<ActivityItem> {
  // Extract post ID from activity ID
  // Format: "blog-{slug}" → extract slug
  const slug = activity.id.replace(/^blog-/, "");

  // Gather engagement metrics from multiple sources
  const metrics: EngagementMetrics = {
    views: await getPostViews(slug, 30), // Past 30 days for monthly trending
    likes: await getPostLikes(slug),
    comments: await getPostComments(slug),
    readingCompletion: await getPostReadingCompletion(slug),
    periodDays: 30,
  };

  // Calculate trending status for both weekly and monthly
  const weeklyMetrics: EngagementMetrics = {
    ...metrics,
    periodDays: 7,
  };

  const weeklyStatus = calculateTrendingStatus(weeklyMetrics);
  const monthlyStatus = calculateTrendingStatus(metrics);

  // Enrich activity with trending metadata
  return {
    ...activity,
    meta: {
      ...activity.meta,
      // Add trending status
      trendingStatus: {
        isWeeklyTrending: weeklyStatus.isWeeklyTrending,
        isMonthlyTrending: monthlyStatus.isMonthlyTrending,
        engagementScore: Math.max(
          weeklyStatus.engagementScore,
          monthlyStatus.engagementScore
        ),
      },
      // Keep backward compatibility
      trending:
        weeklyStatus.isWeeklyTrending || monthlyStatus.isMonthlyTrending,
    },
  };
}

// ============================================================================
// PLACEHOLDER DATA FETCHERS
// ============================================================================
// Replace these with actual implementations that fetch from your data sources

/**
 * Get post views for a given time period
 * TODO: Implement with Vercel Analytics, Redis, or your analytics solution
 */
async function getPostViews(
  slug: string,
  periodDays: number
): Promise<number> {
  // Example implementation:
  // 1. Query Vercel Analytics API for page views
  // 2. Query Redis for cached view counts
  // 3. Aggregate from multiple sources

  // Placeholder: Return 0 for now
  return 0;
}

/**
 * Get post likes (from activity reactions hook)
 * TODO: Implement with server-side like tracking
 */
async function getPostLikes(slug: string): Promise<number> {
  // Example implementation:
  // 1. Query database for like counts
  // 2. Aggregate from localStorage → server sync
  // 3. Use Giscus reactions API

  // Placeholder: Return 0 for now
  return 0;
}

/**
 * Get post comments (from Giscus)
 * TODO: Implement with GitHub Discussions API
 */
async function getPostComments(slug: string): Promise<number> {
  // Example implementation:
  // See: src/lib/comments.ts for existing Giscus integration
  // Use getPostCommentCount(slug)

  // Placeholder: Return 0 for now
  return 0;
}

/**
 * Get average reading completion percentage
 * TODO: Implement with analytics scroll depth tracking
 */
async function getPostReadingCompletion(slug: string): Promise<number> {
  // Example implementation:
  // 1. Query analytics for average scroll depth
  // 2. Calculate from ArticleReadingProgress component data
  // 3. Aggregate from multiple sessions

  // Placeholder: Return 0 for now
  return 0;
}

// ============================================================================
// EXAMPLE: Batch Enrichment for Activity Feed
// ============================================================================

/**
 * Example: Enrich all activities in a feed with trending status
 *
 * This would be called when generating the activity feed
 * (e.g., in src/app/activity/page.tsx or activity API routes)
 */
export async function enrichActivitiesWithTrending(
  activities: ActivityItem[]
): Promise<ActivityItem[]> {
  // Process in parallel for better performance
  return await Promise.all(
    activities.map(async (activity) => {
      // Only enrich blog and project activities
      // (skip GitHub commits, milestones, etc.)
      if (activity.source === "blog" || activity.source === "project") {
        return await enrichBlogPostWithTrending(activity);
      }

      return activity;
    })
  );
}

// ============================================================================
// EXAMPLE: Integration with Existing Activity Sources
// ============================================================================

/**
 * Example: How to integrate into existing blog activity generator
 *
 * In your actual code (e.g., src/lib/activity/sources.ts), you would:
 *
 * ```typescript
 * import { enrichBlogPostWithTrending } from './trending-integration-example';
 *
 * export async function getBlogActivities(): Promise<ActivityItem[]> {
 *   const posts = await getPosts();
 *
 *   const activities: ActivityItem[] = posts.map(post => ({
 *     id: `blog-${post.slug}`,
 *     source: "blog",
 *     verb: "published",
 *     title: post.title,
 *     description: post.summary,
 *     timestamp: new Date(post.publishedAt),
 *     href: `/blog/${post.slug}`,
 *     meta: {
 *       tags: post.tags,
 *       readingTime: post.readingTime.text,
 *       stats: {
 *         views: post.views,
 *         comments: post.comments,
 *       },
 *     },
 *   }));
 *
 *   // Enrich with trending status
 *   return await Promise.all(
 *     activities.map(activity => enrichBlogPostWithTrending(activity))
 *   );
 * }
 * ```
 */
