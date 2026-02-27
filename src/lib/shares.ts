import { redis } from '@/lib/redis-client';

const SHARE_KEY_PREFIX = 'shares:post:';
const SHARE_HISTORY_KEY_PREFIX = 'shares:history:post:';

const formatKey = (postId: string) => `${SHARE_KEY_PREFIX}${postId}`;
const formatHistoryKey = (postId: string) => `${SHARE_HISTORY_KEY_PREFIX}${postId}`;

/**
 * Increment share count for a post by its ID
 * Uses the permanent post ID (not the slug) so shares survive post renames
 * Also records the share in a sorted set for time-based tracking
 *
 * @param postId Permanent post identifier (from post.id field)
 * @returns Updated share count, or null if Redis unavailable
 */
export async function incrementPostShares(postId: string): Promise<number | null> {
  try {
    const count = await redis.incr(formatKey(postId));

    // Record share in sorted set with timestamp
    const now = Date.now();
    await redis.zAdd(formatHistoryKey(postId), {
      score: now,
      value: `${now}`,
    });

    return count;
  } catch {
    return null;
  }
}

/**
 * Get share count for a post by its ID
 *
 * @param postId Permanent post identifier (from post.id field)
 * @returns Share count, or null if Redis unavailable
 */
export async function getPostShares(postId: string): Promise<number | null> {
  try {
    const value = await redis.get(formatKey(postId));
    const parsed = value === null ? null : Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Get share count for a post in the last 24 hours
 *
 * @param postId Permanent post identifier (from post.id field)
 * @returns Share count in last 24 hours, or null if Redis unavailable
 */
export async function getPostShares24h(postId: string): Promise<number | null> {
  try {
    const now = Date.now();
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;
    const count = await redis.zCount(formatHistoryKey(postId), twentyFourHoursAgo, now);
    return count;
  } catch {
    return null;
  }
}

/**
 * Get share counts for multiple posts at once (by ID)
 * More efficient than calling getPostShares multiple times
 *
 * @param postIds Array of permanent post identifiers
 * @returns Map of postId -> share count
 */
export async function getPostSharesBulk(postIds: string[]): Promise<Record<string, number>> {
  if (postIds.length === 0) return {};

  try {
    const keys = postIds.map(formatKey);
    const values = await redis.mGet(keys);

    const result: Record<string, number> = {};
    postIds.forEach((postId, index) => {
      const value = values[index];
      const parsed = value === null ? 0 : Number(value);
      result[postId] = Number.isFinite(parsed) ? parsed : 0;
    });

    return result;
  } catch {
    return {};
  }
}

/**
 * Get share counts for multiple posts in the last 24 hours
 *
 * @param postIds Array of permanent post identifiers
 * @returns Map of postId -> 24h share count
 */
export async function getPostShares24hBulk(postIds: string[]): Promise<Record<string, number>> {
  if (postIds.length === 0) return {};

  try {
    const now = Date.now();
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

    // Use Redis pipeline to batch all zCount operations into a single round-trip
    const pipeline = redis.multi();
    postIds.forEach((postId) => {
      pipeline.zCount(formatHistoryKey(postId), twentyFourHoursAgo, now);
    });

    const results = await pipeline.exec();

    const result: Record<string, number> = {};
    if (results) {
      results.forEach((count, index) => {
        const shareCount = typeof count === 'number' ? count : 0;
        result[postIds[index]] = Number.isFinite(shareCount) ? shareCount : 0;
      });
    }

    return result;
  } catch {
    return {};
  }
}
