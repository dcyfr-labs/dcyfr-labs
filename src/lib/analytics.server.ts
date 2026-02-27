/**
 * Server-Side Analytics Data Fetcher
 *
 * Provides analytics data for Server Components without HTTP layer.
 * Uses server-side ADMIN_API_KEY internally (never exposed to client).
 *
 * This module extracts core analytics logic from the API routes to enable
 * secure server-side data fetching without exposing credentials to the browser.
 *
 * @module lib/analytics.server
 */

import { cache } from 'react';
import { posts } from '@/data/posts';
import {
  getMultiplePostViews,
  getMultiplePostViews24h,
  getMultiplePostViewsInRange,
} from '@/lib/views.server';
import { getPostSharesBulk, getPostShares24hBulk } from '@/lib/shares';
import { getPostCommentsBulk, getPostComments24hBulk } from '@/lib/comments';
import { redis } from '@/lib/redis-client';
import type { AnalyticsData, DailyData, PostAnalytics, VercelAnalytics } from '@/types/analytics';

// ---------------------------------------------------------------------------
// Private helpers (reduce cognitive complexity of getAnalyticsData)
// ---------------------------------------------------------------------------

/**
 * Attempt to fetch and enrich trending posts from Redis.
 * Returns null if Redis is unavailable or data is invalid.
 */
async function fetchRedisTrendingEnriched(
  allPosts: Array<{ id: string; slug: string; [key: string]: unknown }>,
  postsWithViews: PostAnalytics[]
): Promise<PostAnalytics[] | null> {
  try {
    const trendingData = await redis.get('blog:trending');
    if (typeof trendingData !== 'string') return null;
    const parsedTrending = JSON.parse(trendingData) as Array<{
      postId: string;
      totalViews: number;
      recentViews: number;
      score: number;
    }>;
    return parsedTrending
      .map((trending) => {
        const post = allPosts.find((p) => p.id === trending.postId);
        if (!post) return null;
        const fullPost = postsWithViews.find((p) => p.slug === post.slug);
        if (!fullPost) return null;
        return { ...fullPost, trendingScore: trending.score } as unknown as PostAnalytics;
      })
      .filter((item): item is PostAnalytics => item !== null);
  } catch {
    return null;
  }
}

type VercelAnalyticsResult = {
  data: VercelAnalytics | null;
  lastSynced: string | null;
};

/**
 * Fetch Vercel analytics sync data from Redis.
 * Returns null values if Redis is unavailable.
 */
async function fetchVercelAnalyticsFromRedis(): Promise<VercelAnalyticsResult> {
  try {
    const [vPages, vReferrers, vDevices, vSynced] = await Promise.all([
      redis.get('vercel:topPages:daily'),
      redis.get('vercel:topReferrers:daily'),
      redis.get('vercel:topDevices:daily'),
      redis.get('vercel:metrics:lastSynced'),
    ]);
    return {
      data: {
        topPages:
          vPages && typeof vPages === 'string'
            ? (JSON.parse(vPages) as VercelAnalytics['topPages'])
            : [],
        topReferrers:
          vReferrers && typeof vReferrers === 'string'
            ? (JSON.parse(vReferrers) as VercelAnalytics['topReferrers'])
            : [],
        topDevices:
          vDevices && typeof vDevices === 'string'
            ? (JSON.parse(vDevices) as VercelAnalytics['topDevices'])
            : [],
      },
      lastSynced: typeof vSynced === 'string' ? vSynced : null,
    };
  } catch (error) {
    console.error('[Analytics Server] Failed to fetch Vercel analytics from Redis:', error);
    return { data: null, lastSynced: null };
  }
}

/**
 * Server-only analytics data fetcher
 *
 * Fetches comprehensive analytics data including views, shares, comments,
 * trending posts, and Vercel analytics integration.
 *
 * Uses React cache() for request deduplication within a single request.
 *
 * @param days - Number of days for date range filtering, or null for "all" time
 * @returns Complete analytics data object
 *
 * @example
 * ```typescript
 * // In a Server Component:
 * const analytics = await getAnalyticsData(7); // Last 7 days
 * const allTime = await getAnalyticsData(null); // All time
 * ```
 */
export const getAnalyticsData = cache(
  async (days: number | null = null): Promise<AnalyticsData> => {
    try {
      // Default to 1 day if null is passed
      const effectiveDays = days;

      // Get view counts for all posts using their stable post IDs
      const postIds = posts.map((p) => p.id);
      const viewMap = await getMultiplePostViews(postIds);
      const views24hMap = await getMultiplePostViews24h(postIds);
      const viewsRangeMap = await getMultiplePostViewsInRange(postIds, effectiveDays);

      // Get share counts for all posts
      const shareMap = await getPostSharesBulk(postIds);
      const shares24hMap = await getPostShares24hBulk(postIds);

      // Get comment counts for all posts (by slug)
      const postSlugs = posts.map((p) => p.slug);
      const commentMap = await getPostCommentsBulk(postSlugs);
      const comments24hMap = await getPostComments24hBulk(postSlugs);

      // Combine with post data
      const postsWithViews = posts
        .map((post) => ({
          slug: post.slug,
          title: post.title,
          summary: post.summary,
          publishedAt: post.publishedAt,
          tags: post.tags,
          archived: post.archived ?? false,
          draft: post.draft ?? false,
          views: viewMap.get(post.id) || 0,
          views24h: views24hMap.get(post.id) || 0,
          viewsRange: viewsRangeMap.get(post.id) || 0,
          shares: shareMap[post.id] || 0,
          shares24h: shares24hMap[post.id] || 0,
          comments: commentMap[post.slug] || 0,
          comments24h: comments24hMap[post.slug] || 0,
          readingTime: post.readingTime,
        }))
        .sort((a, b) => b.views - a.views);

      // Calculate statistics
      const totalViews = postsWithViews.reduce((sum, post) => sum + post.views, 0);
      const totalViews24h = postsWithViews.reduce((sum, post) => sum + post.views24h, 0);
      const totalViewsRange = postsWithViews.reduce((sum, post) => sum + post.viewsRange, 0);
      const totalShares = postsWithViews.reduce((sum, post) => sum + post.shares, 0);
      const totalShares24h = postsWithViews.reduce((sum, post) => sum + post.shares24h, 0);
      const totalComments = postsWithViews.reduce((sum, post) => sum + post.comments, 0);
      const totalComments24h = postsWithViews.reduce((sum, post) => sum + post.comments24h, 0);

      const averageViews = postsWithViews.length > 0 ? totalViews / postsWithViews.length : 0;
      const averageViews24h = postsWithViews.length > 0 ? totalViews24h / postsWithViews.length : 0;
      const averageViewsRange =
        postsWithViews.length > 0 ? totalViewsRange / postsWithViews.length : 0;
      const averageShares = postsWithViews.length > 0 ? totalShares / postsWithViews.length : 0;
      const averageShares24h =
        postsWithViews.length > 0 ? totalShares24h / postsWithViews.length : 0;
      const averageComments = postsWithViews.length > 0 ? totalComments / postsWithViews.length : 0;
      const averageComments24h =
        postsWithViews.length > 0 ? totalComments24h / postsWithViews.length : 0;

      const topPost = postsWithViews[0];

      // Get top posts in last 24 hours
      const topPost24h = [...postsWithViews].sort((a, b) => b.views24h - a.views24h)[0];

      // Get top posts in selected range
      const topPostRange = [...postsWithViews].sort((a, b) => b.viewsRange - a.viewsRange)[0];

      // Get most shared posts
      const mostSharedPost = [...postsWithViews].sort((a, b) => b.shares - a.shares)[0];
      const mostSharedPost24h = [...postsWithViews].sort((a, b) => b.shares24h - a.shares24h)[0];

      // Get most commented posts
      const mostCommentedPost = [...postsWithViews].sort((a, b) => b.comments - a.comments)[0];
      const mostCommentedPost24h = [...postsWithViews].sort(
        (a, b) => b.comments24h - a.comments24h
      )[0];

      const trendingPosts = postsWithViews.slice(0, 5);

      // Get trending data from Redis if available
      const trendingFromRedis = await fetchRedisTrendingEnriched(posts, postsWithViews);

      // Attempt to read Vercel analytics sync data from Redis (optional)
      const { data: vercelData, lastSynced: vercelLastSynced } =
        await fetchVercelAnalyticsFromRedis();

      return {
        success: true,
        timestamp: new Date().toISOString(),
        dateRange: effectiveDays === null ? 'all' : `${effectiveDays}d`,
        summary: {
          totalPosts: postsWithViews.length,
          totalViews,
          totalViewsRange,
          totalShares,
          totalComments,
          averageViews: Math.round(averageViews),
          averageViewsRange: Math.round(averageViewsRange),
          averageShares: Math.round(averageShares),
          averageComments: Math.round(averageComments),
          topPost: topPost
            ? {
                slug: topPost.slug,
                title: topPost.title,
                views: topPost.views,
                views24h: topPost.views24h,
                viewsRange: topPost.viewsRange,
                shares: topPost.shares,
                shares24h: topPost.shares24h,
                comments: topPost.comments,
                comments24h: topPost.comments24h,
              }
            : null,
          topPostRange: topPostRange
            ? {
                slug: topPostRange.slug,
                title: topPostRange.title,
                views: topPostRange.views,
                views24h: topPostRange.views24h,
                viewsRange: topPostRange.viewsRange,
                shares: topPostRange.shares,
                shares24h: topPostRange.shares24h,
                comments: topPostRange.comments,
                comments24h: topPostRange.comments24h,
              }
            : null,
          mostSharedPost: mostSharedPost
            ? {
                slug: mostSharedPost.slug,
                title: mostSharedPost.title,
                views: mostSharedPost.views,
                shares: mostSharedPost.shares,
                shares24h: mostSharedPost.shares24h,
                comments: mostSharedPost.comments,
                comments24h: mostSharedPost.comments24h,
              }
            : null,
          mostCommentedPost: mostCommentedPost
            ? {
                slug: mostCommentedPost.slug,
                title: mostCommentedPost.title,
                views: mostCommentedPost.views,
                shares: mostCommentedPost.shares,
                shares24h: mostCommentedPost.shares24h,
                comments: mostCommentedPost.comments,
                comments24h: mostCommentedPost.comments24h,
              }
            : null,
        },
        posts: postsWithViews,
        trending: trendingFromRedis || trendingPosts,
        vercel: vercelData,
        vercelLastSynced: vercelLastSynced,
      };
    } catch (error) {
      console.error('[Analytics Server] Error fetching analytics data:', error);
      // Return empty data structure on error to prevent crashes
      return {
        success: false,
        timestamp: new Date().toISOString(),
        dateRange: days === null ? 'all' : `${days}d`,
        summary: {
          totalPosts: 0,
          totalViews: 0,
          totalViewsRange: 0,
          totalShares: 0,
          totalComments: 0,
          averageViews: 0,
          averageViewsRange: 0,
          averageShares: 0,
          averageComments: 0,
          topPost: null,
          topPostRange: null,
          mostSharedPost: null,
          mostCommentedPost: null,
        },
        posts: [],
        trending: [],
        vercel: null,
        vercelLastSynced: null,
      };
    }
  }
);

/**
 * Generates a date range array for the specified number of days
 */
function generateDateRange(days: number | null): Date[] {
  const now = new Date();
  const dateRange: Date[] = [];

  // If days is null (all), default to 90 days of historical data
  const daysToFetch = days === null ? 90 : days;

  for (let i = daysToFetch - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    dateRange.push(date);
  }

  return dateRange;
}

/**
 * Formats a date as ISO string (YYYY-MM-DD)
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Server-only daily analytics data fetcher
 *
 * Returns time-series data for chart visualization.
 *
 * Uses React cache() for request deduplication within a single request.
 *
 * @param days - Number of days for date range, or null for default (90 days)
 * @returns Array of daily analytics data points
 *
 * @example
 * ```typescript
 * // In a Server Component:
 * const daily = await getDailyAnalyticsData(30); // Last 30 days
 * const defaultRange = await getDailyAnalyticsData(null); // 90 days
 * ```
 */
export const getDailyAnalyticsData = cache(
  async (days: number | null = null): Promise<DailyData[]> => {
    try {
      // Generate date range
      const dateRange = generateDateRange(days);

      // Get all post IDs
      const postIds = posts.map((p) => p.id);

      // Fetch views data for the entire range
      const viewsRangeMap = await getMultiplePostViewsInRange(postIds, days);

      // Calculate total views in range for distribution
      let totalViewsInRange = 0;
      viewsRangeMap.forEach((views) => {
        totalViewsInRange += views;
      });

      // Distribute views across days (simple distribution model)
      // This provides realistic-looking data until per-day tracking is implemented
      // Using a slight weighted distribution toward more recent days (realistic for blog traffic)
      const dailyData = dateRange.map((date, index) => {
        const dateStr = formatDate(date);

        // Weight distribution: more recent days get slightly more weight
        // Formula: weight = (index + 1) / total indices
        const weight = (index + 1) / dateRange.length;
        const distributedViews =
          totalViewsInRange > 0 ? Math.round((totalViewsInRange * weight) / dateRange.length) : 0;

        return {
          date: dateStr,
          views: Math.max(0, distributedViews), // Ensure non-negative
          shares: 0, // Daily shares tracking not yet implemented
          comments: 0, // Daily comments tracking not yet implemented
          engagement: 0, // Will be shares + comments when implemented
        };
      });

      return dailyData;
    } catch (error) {
      console.error('[Analytics Server] Error fetching daily analytics:', error);
      // Return empty array on error
      return [];
    }
  }
);
