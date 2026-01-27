/**
 * Engagement Analytics (Likes & Bookmarks)
 *
 * Redis-backed global analytics for user engagement across the site.
 * Tracks likes and bookmarks with cross-environment persistence.
 *
 * Features:
 * - Global counters for likes and bookmarks
 * - History tracking for trending analysis
 * - Cross-environment persistence (dev/preview/production)
 * - Graceful fallback when Redis unavailable
 *
 * Key Format:
 * - likes:post:{slug} - Total like count for a post
 * - bookmarks:post:{slug} - Total bookmark count for a post
 * - likes:project:{slug} - Total like count for a project
 * - bookmarks:project:{slug} - Total bookmark count for a project
 */

import { redis } from '@/mcp/shared/redis-client';

// ============================================================================
// CONSTANTS
// ============================================================================

const LIKE_KEY_PREFIX = 'likes:';
const BOOKMARK_KEY_PREFIX = 'bookmarks:';
const LIKE_HISTORY_PREFIX = 'likes:history:';
const BOOKMARK_HISTORY_PREFIX = 'bookmarks:history:';

// ============================================================================
// TYPES
// ============================================================================

export type ContentType = 'post' | 'project' | 'activity';

export interface EngagementStats {
  likes: number;
  bookmarks: number;
  likeHistory24h?: number;
  bookmarkHistory24h?: number;
}

// ============================================================================
// KEY FORMATTERS
// ============================================================================

/**
 * Format Redis key for like count
 * @param contentType - Type of content (post, project, activity)
 * @param slug - Content slug/identifier
 */
const formatLikeKey = (contentType: ContentType, slug: string) =>
  `${LIKE_KEY_PREFIX}${contentType}:${slug}`;

/**
 * Format Redis key for bookmark count
 * @param contentType - Type of content (post, project, activity)
 * @param slug - Content slug/identifier
 */
const formatBookmarkKey = (contentType: ContentType, slug: string) =>
  `${BOOKMARK_KEY_PREFIX}${contentType}:${slug}`;

/**
 * Format Redis key for like history (sorted set)
 */
const formatLikeHistoryKey = (contentType: ContentType, slug: string) =>
  `${LIKE_HISTORY_PREFIX}${contentType}:${slug}`;

/**
 * Format Redis key for bookmark history (sorted set)
 */
const formatBookmarkHistoryKey = (contentType: ContentType, slug: string) =>
  `${BOOKMARK_HISTORY_PREFIX}${contentType}:${slug}`;

// ============================================================================
// LIKE OPERATIONS
// ============================================================================

/**
 * Increment like count for content
 * @param contentType - Type of content (post, project, activity)
 * @param slug - Content slug/identifier
 * @returns Updated like count, or null if Redis unavailable
 */
export async function incrementLikes(
  contentType: ContentType,
  slug: string
): Promise<number | null> {
  try {
    const count = await redis.incr(formatLikeKey(contentType, slug));

    // Record in history for trending analysis
    const now = Date.now();
    await redis.zadd(formatLikeHistoryKey(contentType, slug), {
      score: now,
      member: `${now}`,
    });

    // Clean up history older than 90 days
    const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000;
    await redis.zremrangebyscore(formatLikeHistoryKey(contentType, slug), '-inf', ninetyDaysAgo);

    return count;
  } catch (error) {
    console.error('[EngagementAnalytics] Failed to increment likes:', error);
    return null;
  }
}

/**
 * Decrement like count for content (unlike)
 * @param contentType - Type of content
 * @param slug - Content slug/identifier
 * @returns Updated like count, or null if Redis unavailable
 */
export async function decrementLikes(
  contentType: ContentType,
  slug: string
): Promise<number | null> {
  try {
    const count = await redis.decr(formatLikeKey(contentType, slug));
    // Ensure count doesn't go negative
    if (count < 0) {
      await redis.set(formatLikeKey(contentType, slug), 0);
      return 0;
    }
    return count;
  } catch (error) {
    console.error('[EngagementAnalytics] Failed to decrement likes:', error);
    return null;
  }
}

/**
 * Get like count for content
 * @param contentType - Type of content
 * @param slug - Content slug/identifier
 * @returns Like count, or null if Redis unavailable
 */
export async function getLikes(contentType: ContentType, slug: string): Promise<number | null> {
  try {
    const value = await redis.get(formatLikeKey(contentType, slug));
    const parsed = value === null ? 0 : Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  } catch (error) {
    console.error('[EngagementAnalytics] Failed to get likes:', error);
    return null;
  }
}

/**
 * Get like count for last 24 hours
 */
export async function getLikes24h(contentType: ContentType, slug: string): Promise<number | null> {
  try {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const count = await redis.zcount(formatLikeHistoryKey(contentType, slug), oneDayAgo, now);
    return count;
  } catch (error) {
    console.error('[EngagementAnalytics] Failed to get 24h likes:', error);
    return null;
  }
}

// ============================================================================
// BOOKMARK OPERATIONS
// ============================================================================

/**
 * Increment bookmark count for content
 * @param contentType - Type of content
 * @param slug - Content slug/identifier
 * @returns Updated bookmark count, or null if Redis unavailable
 */
export async function incrementBookmarks(
  contentType: ContentType,
  slug: string
): Promise<number | null> {
  try {
    const count = await redis.incr(formatBookmarkKey(contentType, slug));

    // Record in history for trending analysis
    const now = Date.now();
    await redis.zadd(formatBookmarkHistoryKey(contentType, slug), {
      score: now,
      member: `${now}`,
    });

    // Clean up history older than 90 days
    const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000;
    await redis.zremrangebyscore(
      formatBookmarkHistoryKey(contentType, slug),
      '-inf',
      ninetyDaysAgo
    );

    return count;
  } catch (error) {
    console.error('[EngagementAnalytics] Failed to increment bookmarks:', error);
    return null;
  }
}

/**
 * Decrement bookmark count for content (unbookmark)
 * @param contentType - Type of content
 * @param slug - Content slug/identifier
 * @returns Updated bookmark count, or null if Redis unavailable
 */
export async function decrementBookmarks(
  contentType: ContentType,
  slug: string
): Promise<number | null> {
  try {
    const count = await redis.decr(formatBookmarkKey(contentType, slug));
    // Ensure count doesn't go negative
    if (count < 0) {
      await redis.set(formatBookmarkKey(contentType, slug), 0);
      return 0;
    }
    return count;
  } catch (error) {
    console.error('[EngagementAnalytics] Failed to decrement bookmarks:', error);
    return null;
  }
}

/**
 * Get bookmark count for content
 * @param contentType - Type of content
 * @param slug - Content slug/identifier
 * @returns Bookmark count, or null if Redis unavailable
 */
export async function getBookmarks(contentType: ContentType, slug: string): Promise<number | null> {
  try {
    const value = await redis.get(formatBookmarkKey(contentType, slug));
    const parsed = value === null ? 0 : Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  } catch (error) {
    console.error('[EngagementAnalytics] Failed to get bookmarks:', error);
    return null;
  }
}

/**
 * Get bookmark count for last 24 hours
 */
export async function getBookmarks24h(
  contentType: ContentType,
  slug: string
): Promise<number | null> {
  try {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const count = await redis.zcount(formatBookmarkHistoryKey(contentType, slug), oneDayAgo, now);
    return count;
  } catch (error) {
    console.error('[EngagementAnalytics] Failed to get 24h bookmarks:', error);
    return null;
  }
}

// ============================================================================
// COMBINED OPERATIONS
// ============================================================================

/**
 * Get all engagement stats for content
 * @param contentType - Type of content
 * @param slug - Content slug/identifier
 * @returns Engagement stats with likes and bookmarks
 */
export async function getEngagementStats(
  contentType: ContentType,
  slug: string
): Promise<EngagementStats | null> {
  try {
    const [likes, bookmarks, likes24h, bookmarks24h] = await Promise.all([
      getLikes(contentType, slug),
      getBookmarks(contentType, slug),
      getLikes24h(contentType, slug),
      getBookmarks24h(contentType, slug),
    ]);

    return {
      likes: likes ?? 0,
      bookmarks: bookmarks ?? 0,
      likeHistory24h: likes24h ?? 0,
      bookmarkHistory24h: bookmarks24h ?? 0,
    };
  } catch (error) {
    console.error('[EngagementAnalytics] Failed to get engagement stats:', error);
    return null;
  }
}

/**
 * Get engagement stats for multiple content items
 * @param items - Array of content type and slug pairs
 * @returns Map of slug to engagement stats
 */
export async function getBulkEngagementStats(
  items: Array<{ contentType: ContentType; slug: string }>
): Promise<Map<string, EngagementStats>> {
  const results = new Map<string, EngagementStats>();

  await Promise.all(
    items.map(async ({ contentType, slug }) => {
      const stats = await getEngagementStats(contentType, slug);
      if (stats) {
        results.set(slug, stats);
      }
    })
  );

  return results;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get top liked content
 * @param contentType - Type of content to query
 * @param limit - Maximum number of results (default: 10)
 * @returns Array of [slug, count] pairs
 */
export async function getTopLiked(
  contentType: ContentType,
  limit = 10
): Promise<Array<{ slug: string; count: number }>> {
  try {
    // Get all keys matching the pattern
    const pattern = `${LIKE_KEY_PREFIX}${contentType}:*`;
    const keys = await redis.keys(pattern);

    // Get counts for all keys
    const counts = await Promise.all(
      keys.map(async (key) => {
        const value = await redis.get(key);
        const slug = key.replace(`${LIKE_KEY_PREFIX}${contentType}:`, '');
        return { slug, count: value ? Number(value) : 0 };
      })
    );

    // Sort by count descending and limit
    return counts.sort((a, b) => b.count - a.count).slice(0, limit);
  } catch (error) {
    console.error('[EngagementAnalytics] Failed to get top liked:', error);
    return [];
  }
}

/**
 * Get top bookmarked content
 * @param contentType - Type of content to query
 * @param limit - Maximum number of results (default: 10)
 * @returns Array of [slug, count] pairs
 */
export async function getTopBookmarked(
  contentType: ContentType,
  limit = 10
): Promise<Array<{ slug: string; count: number }>> {
  try {
    // Get all keys matching the pattern
    const pattern = `${BOOKMARK_KEY_PREFIX}${contentType}:*`;
    const keys = await redis.keys(pattern);

    // Get counts for all keys
    const counts = await Promise.all(
      keys.map(async (key) => {
        const value = await redis.get(key);
        const slug = key.replace(`${BOOKMARK_KEY_PREFIX}${contentType}:`, '');
        return { slug, count: value ? Number(value) : 0 };
      })
    );

    // Sort by count descending and limit
    return counts.sort((a, b) => b.count - a.count).slice(0, limit);
  } catch (error) {
    console.error('[EngagementAnalytics] Failed to get top bookmarked:', error);
    return [];
  }
}
