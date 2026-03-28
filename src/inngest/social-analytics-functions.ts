/**
 * Social Analytics Functions
 *
 * Manages scheduled syncing of social media analytics data.
 * Currently supports DEV.to engagement metrics.
 *
 * Benefits:
 * - Fresh engagement data without manual intervention
 * - Respects API rate limits (10 req/min for DEV.to)
 * - Proactive error detection for API issues
 * - Historical data tracking
 */

import { inngest } from './client';
import { fetchDevToMetricsBatch } from '@/lib/social-analytics';
import { redis } from '@/lib/redis';

// ============================================================================
// TYPES
// ============================================================================

interface PostWithDevSlug {
  id: string;
  devSlug: string;
}

// ============================================================================
// SYNC DEV.TO METRICS
// ============================================================================

/**
 * Daily DEV.to Metrics Sync
 *
 * Fetches engagement metrics from DEV.to for all published articles.
 * Runs every 6 hours to keep metrics fresh while respecting rate limits.
 *
 * Cron schedule: Every 6 hours (00:00, 06:00, 12:00, 18:00 UTC)
 *
 * Benefits:
 * - Fresh engagement data (views, reactions, comments)
 * - Respects DEV.to rate limit (10 req/min)
 * - Batch processing for efficiency
 * - Automatic error recovery with retries
 *
 * Rate Limiting:
 * - Fetches in batches of 10 articles per minute
 * - Automatically waits between batches
 * - Total sync time: ~6 minutes for 60 articles
 */
export const syncDevToMetrics = inngest.createFunction(
  {
    id: 'sync-dev-to-metrics',
    retries: 2, // Retry on transient API failures
  },
  { cron: '0 */6 * * *' }, // Every 6 hours
  async ({ step }) => {
    // Step 1: Get all posts with DEV articles
    const posts = await step.run('fetch-posts-with-dev-slugs', async () => {
      console.warn('[DEV.to Sync] Fetching posts with DEV articles...');

      try {
        // Get list of posts with DEV slugs from Redis cache
        // In a real implementation, this would query your database
        const postsKey = 'posts:dev-slugs';
        const postsData = await redis.get(postsKey);

        if (!postsData) {
          console.warn('[DEV.to Sync] No posts with DEV slugs found in cache');
          return [];
        }

        const posts = JSON.parse(postsData as string) as PostWithDevSlug[];
        console.warn(`[DEV.to Sync] Found ${posts.length} posts with DEV articles`);

        return posts;
      } catch (error) {
        console.error('[DEV.to Sync] Failed to fetch posts:', error);
        throw new Error(
          `Failed to fetch posts with DEV slugs: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    });

    // Skip if no posts to sync
    if (posts.length === 0) {
      return {
        status: 'skipped',
        message: 'No posts with DEV articles found',
        timestamp: new Date().toISOString(),
      };
    }

    // Step 2: Fetch metrics from DEV.to API
    const metrics = await step.run('fetch-dev-metrics', async () => {
      console.warn(`[DEV.to Sync] Fetching metrics for ${posts.length} articles...`);

      try {
        // Batch fetch with automatic rate limiting
        // Map id to postId for the batch fetch function
        const articlesToBatch = posts.map((p) => ({ postId: p.id, devSlug: p.devSlug }));
        const results = await fetchDevToMetricsBatch(articlesToBatch);

        // Count successful fetches
        const successCount = results.filter((r) => r !== null).length;
        const failCount = results.length - successCount;

        console.warn(`[DEV.to Sync] Fetched ${successCount} metrics, ${failCount} failed`);

        return {
          results,
          successCount,
          failCount,
        };
      } catch (error) {
        console.error('[DEV.to Sync] Failed to fetch metrics:', error);
        throw new Error(
          `Failed to fetch DEV.to metrics: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    });

    // Step 3: Cache the metrics
    const cached = await step.run('cache-metrics', async () => {
      console.warn('[DEV.to Sync] Caching metrics...');

      let cachedCount = 0;
      let errorCount = 0;

      for (let i = 0; i < metrics.results.length; i++) {
        const result = metrics.results[i];
        if (!result) continue;

        try {
          const cacheKey = `dev-metrics:${result.postId}`;
          await redis.set(
            cacheKey,
            JSON.stringify({
              ...result,
              lastFetchedAt: new Date().toISOString(),
            }),
            { ex: 21600 } // 6 hours TTL
          );

          cachedCount++;
        } catch (error) {
          console.error(`[DEV.to Sync] Failed to cache metrics for ${result.postId}:`, error);
          errorCount++;
        }
      }

      console.warn(`[DEV.to Sync] Cached ${cachedCount} metrics, ${errorCount} errors`);

      return {
        cachedCount,
        errorCount,
      };
    });

    // Step 4: Return summary
    return {
      status: 'success',
      message: 'DEV.to metrics sync completed',
      timestamp: new Date().toISOString(),
      summary: {
        totalPosts: posts.length,
        fetched: metrics.successCount,
        failed: metrics.failCount,
        cached: cached.cachedCount,
        cacheErrors: cached.errorCount,
      },
    };
  }
);

// ============================================================================
// MANUAL SYNC TRIGGER
// ============================================================================

/**
 * Manual DEV.to Sync Trigger
 *
 * Allows manual triggering of DEV.to metrics sync via API call.
 * Useful for:
 * - Immediate sync after publishing new article
 * - Testing sync functionality
 * - Recovery from sync failures
 *
 * Event payload:
 * ```ts
 * {
 *   name: "social/dev-to.sync",
 *   data: {
 *     postId?: string,  // Optional: sync specific post
 *     force?: boolean   // Force refresh even if cached
 *   }
 * }
 * ```
 */
export const manualDevToSync = inngest.createFunction(
  {
    id: 'manual-dev-to-sync',
    retries: 1,
  },
  { event: 'social/dev-to.sync' },
  async ({ event, step }) => {
    const { postId, force } = event.data;

    // If specific post ID provided, sync only that post
    if (postId) {
      return await step.run('sync-single-post', async () => {
        console.warn(`[DEV.to Sync] Manual sync for post ${postId}...`);

        // Get DEV slug for this post
        const postKey = `post:${postId}:dev-slug`;
        const devSlug = await redis.get(postKey);

        if (!devSlug) {
          throw new Error(`No DEV slug found for post ${postId}`);
        }

        // Fetch metrics via API endpoint
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/social-analytics/dev-to`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              postId,
              devSlug,
              forceRefresh: force,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();
        return result;
      });
    }

    // Otherwise, trigger full sync (reuse existing function)
    return await step.invoke('trigger-full-sync', {
      function: syncDevToMetrics,
    });
  }
);

// ============================================================================
// AGGREGATE REFERRAL DATA
// ============================================================================

/**
 * Daily Referral Aggregation
 *
 * Aggregates referral tracking data from Redis (24h TTL) into long-term storage.
 * Runs daily at 2:00 AM UTC to process previous day's data.
 *
 * Cron schedule: Daily at 2:00 AM UTC
 *
 * Benefits:
 * - Long-term analytics storage
 * - Reduced Redis memory usage
 * - Historical trend analysis
 * - Aggregated reporting
 */
export const aggregateReferrals = inngest.createFunction(
  {
    id: 'aggregate-referral-data',
    retries: 2,
  },
  { cron: '0 2 * * *' }, // Daily at 2:00 AM UTC
  async ({ step }) => {
    // Step 1: Get all referral counters from Redis
    const counters = await step.run('fetch-referral-counters', async () => {
      console.warn('[Referral Aggregation] Fetching counters from Redis...');

      try {
        // Get all referral counter keys
        const keys = await redis.keys('referral:count:*');
        console.warn(`[Referral Aggregation] Found ${keys.length} counter keys`);

        if (keys.length === 0) {
          return [];
        }

        // Fetch all counter values
        const values = await Promise.all(
          keys.map(async (key: string) => {
            const value = await redis.get(key);
            return { key, value: parseInt((value as string) || '0', 10) };
          })
        );

        return values.filter((v: { key: string; value: number }) => v.value > 0);
      } catch (error) {
        console.error('[Referral Aggregation] Failed to fetch counters:', error);
        throw new Error(
          `Failed to fetch referral counters: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    });

    // Skip if no data to aggregate
    if (counters.length === 0) {
      return {
        status: 'skipped',
        message: 'No referral data to aggregate',
        timestamp: new Date().toISOString(),
      };
    }

    // Step 2: Aggregate by post and platform
    const aggregated = await step.run('aggregate-data', async () => {
      console.warn(`[Referral Aggregation] Aggregating ${counters.length} counters...`);

      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const aggregations: Record<string, Record<string, number>> = {};

      for (const { key, value } of counters) {
        // Parse key: referral:count:POST_ID:PLATFORM
        const parts = key.split(':');
        if (parts.length !== 4) continue;

        const postId = parts[2];
        const platform = parts[3];

        if (!aggregations[postId]) {
          aggregations[postId] = {};
        }

        aggregations[postId][platform] = value;
      }

      // Store aggregated data
      const storageKey = `referral:aggregated:${today}`;
      await redis.set(storageKey, JSON.stringify(aggregations), {
        ex: 2592000, // 30 days
      });

      console.warn(
        `[Referral Aggregation] Aggregated data for ${Object.keys(aggregations).length} posts`
      );

      return {
        date: today,
        posts: Object.keys(aggregations).length,
        totalReferrals: counters.reduce(
          (sum: number, c: { key: string; value: number }) => sum + c.value,
          0
        ),
      };
    });

    return {
      status: 'success',
      message: 'Referral data aggregated successfully',
      timestamp: new Date().toISOString(),
      summary: aggregated,
    };
  }
);
