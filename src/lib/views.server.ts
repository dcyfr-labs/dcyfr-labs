import { redis } from '@/mcp/shared/redis-client';

const VIEW_KEY_PREFIX = 'views:post:';
const VIEW_HISTORY_KEY_PREFIX = 'views:history:post:';
const PROJECT_VIEW_KEY_PREFIX = 'views:project:';
const PROJECT_VIEW_HISTORY_KEY_PREFIX = 'views:history:project:';

const formatKey = (postId: string) => `${VIEW_KEY_PREFIX}${postId}`;
const formatHistoryKey = (postId: string) => `${VIEW_HISTORY_KEY_PREFIX}${postId}`;
const formatProjectKey = (projectSlug: string) => `${PROJECT_VIEW_KEY_PREFIX}${projectSlug}`;
const formatProjectHistoryKey = (projectSlug: string) =>
  `${PROJECT_VIEW_HISTORY_KEY_PREFIX}${projectSlug}`;

/**
 * Increment view count for a post by its ID
 * Uses the permanent post ID (not the slug) so views survive post renames
 * Also records the view in a sorted set for 24-hour tracking
 * @param postId Permanent post identifier (from post.id field)
 * @returns Updated view count, or null if Redis unavailable
 */
export async function incrementPostViews(postId: string): Promise<number | null> {
  try {
    const count = await redis.incr(formatKey(postId));

    // Record view in sorted set with timestamp for 24-hour tracking
    const now = Date.now();
    await redis.zadd(formatHistoryKey(postId), {
      score: now,
      member: `${now}`,
    });

    // Clean up views older than 90 days (keep data for trending analysis and long-term analytics)
    const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000;
    await redis.zremrangebyscore(formatHistoryKey(postId), '-inf', ninetyDaysAgo);

    return count;
  } catch {
    return null;
  }
}

/**
 * Get view count for a post by its ID
 * @param postId Permanent post identifier (from post.id field)
 * @returns View count, or null if Redis unavailable
 */
export async function getPostViews(postId: string): Promise<number | null> {
  try {
    const value = await redis.get(formatKey(postId));
    const parsed = value === null ? null : Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Get view count for a post in the last 24 hours
 * @param postId Permanent post identifier (from post.id field)
 * @returns View count in last 24 hours, or null if Redis unavailable
 */
export async function getPostViews24h(postId: string): Promise<number | null> {
  try {
    const now = Date.now();
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;
    const count = await redis.zcount(formatHistoryKey(postId), twentyFourHoursAgo, now);
    return count;
  } catch {
    return null;
  }
}

/**
 * Get view count for a post within a time range
 * @param postId Permanent post identifier (from post.id field)
 * @param days Number of days to look back (7, 30, 90, etc.) or null for all time
 * @returns View count in specified range, or null if Redis unavailable
 */
export async function getPostViewsInRange(
  postId: string,
  days: number | null
): Promise<number | null> {
  // If days is null, return all-time views
  if (days === null) {
    return getPostViews(postId);
  }

  try {
    const now = Date.now();
    const rangeStart = now - days * 24 * 60 * 60 * 1000;
    const count = await redis.zcount(formatHistoryKey(postId), rangeStart, now);
    return count;
  } catch {
    return null;
  }
}

/**
 * Get view counts for multiple posts at once (by ID)
 * Uses post IDs instead of slugs for permanence
 * @param postIds Array of permanent post identifiers
 * @returns Map of postId -> view count
 */
export async function getMultiplePostViews(postIds: string[]): Promise<Map<string, number>> {
  const viewMap = new Map<string, number>();

  try {
    const keys = postIds.map(formatKey);
    const values = await redis.mget(...keys);

    postIds.forEach((postId, index) => {
      const value = values[index];
      const parsed = value === null ? 0 : Number(value);
      if (Number.isFinite(parsed)) {
        viewMap.set(postId, parsed);
      }
    });
  } catch {
    // Return empty map on error
  }

  return viewMap;
}

/**
 * Get view counts for multiple posts in the last 24 hours
 * @param postIds Array of permanent post identifiers
 * @returns Map of postId -> 24h view count
 */
export async function getMultiplePostViews24h(postIds: string[]): Promise<Map<string, number>> {
  const viewMap = new Map<string, number>();

  try {
    const now = Date.now();
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

    // Use Redis pipeline to batch all zCount operations into a single round-trip
    const pipeline = redis.pipeline();
    postIds.forEach((postId) => {
      pipeline.zcount(formatHistoryKey(postId), twentyFourHoursAgo, now);
    });

    const results = await pipeline.exec();

    if (results) {
      results.forEach((result, index) => {
        const count = typeof result === 'number' ? result : 0;
        if (Number.isFinite(count)) {
          viewMap.set(postIds[index], count);
        }
      });
    }
  } catch {
    // Return empty map on error
  }

  return viewMap;
}

/**
 * Get view counts for multiple posts within a time range
 * @param postIds Array of permanent post identifiers
 * @param days Number of days to look back (7, 30, 90, etc.) or null for all time
 * @returns Map of postId -> view count in range
 */
export async function getMultiplePostViewsInRange(
  postIds: string[],
  days: number | null
): Promise<Map<string, number>> {
  const viewMap = new Map<string, number>();

  // If days is null, return all-time views
  if (days === null) {
    return getMultiplePostViews(postIds);
  }

  try {
    const now = Date.now();
    const rangeStart = now - days * 24 * 60 * 60 * 1000;

    // Use Redis pipeline to batch all zCount operations into a single round-trip
    const pipeline = redis.pipeline();
    postIds.forEach((postId) => {
      pipeline.zcount(formatHistoryKey(postId), rangeStart, now);
    });

    const results = await pipeline.exec();

    if (results) {
      results.forEach((result, index) => {
        const count = typeof result === 'number' ? result : 0;
        if (Number.isFinite(count)) {
          viewMap.set(postIds[index], count);
        }
      });
    }
  } catch {
    // Return empty map on error
  }

  return viewMap;
}
