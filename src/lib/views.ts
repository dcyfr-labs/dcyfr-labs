import { createClient } from "redis";

const VIEW_KEY_PREFIX = "views:post:";
const VIEW_HISTORY_KEY_PREFIX = "views:history:post:";
const PROJECT_VIEW_KEY_PREFIX = "views:project:";
const PROJECT_VIEW_HISTORY_KEY_PREFIX = "views:history:project:";
const redisUrl = process.env.REDIS_URL;

type RedisClient = ReturnType<typeof createClient>;

declare global {
  var __redisClient: RedisClient | undefined;
}

const formatKey = (postId: string) => `${VIEW_KEY_PREFIX}${postId}`;
const formatHistoryKey = (postId: string) => `${VIEW_HISTORY_KEY_PREFIX}${postId}`;
const formatProjectKey = (projectSlug: string) => `${PROJECT_VIEW_KEY_PREFIX}${projectSlug}`;
const formatProjectHistoryKey = (projectSlug: string) => `${PROJECT_VIEW_HISTORY_KEY_PREFIX}${projectSlug}`;

async function getClient(): Promise<RedisClient | null> {
  if (!redisUrl) return null;

  if (!globalThis.__redisClient) {
    const client = createClient({ 
      url: redisUrl,
      socket: {
        connectTimeout: 5000,      // 5s connection timeout
        reconnectStrategy: (retries) => {
          if (retries > 3) return new Error('Max retries exceeded');
          return Math.min(retries * 100, 3000); // Exponential backoff, max 3s
        },
      },
    });
    client.on("error", (error) => {
      if (process.env.NODE_ENV !== "production") {
        console.error("Redis error", error);
      }
    });
    globalThis.__redisClient = client;
  }

  const client = globalThis.__redisClient;
  if (!client) return null;

  if (!client.isOpen) {
    await client.connect();
  }

  return client;
}

/**
 * Increment view count for a post by its ID
 * Uses the permanent post ID (not the slug) so views survive post renames
 * Also records the view in a sorted set for 24-hour tracking
 * @param postId Permanent post identifier (from post.id field)
 * @returns Updated view count, or null if Redis unavailable
 */
export async function incrementPostViews(postId: string): Promise<number | null> {
  const client = await getClient();
  if (!client) return null;
  try {
    const count = await client.incr(formatKey(postId));
    
    // Record view in sorted set with timestamp for 24-hour tracking
    const now = Date.now();
    await client.zAdd(formatHistoryKey(postId), {
      score: now,
      value: `${now}`,
    });
    
    // Clean up views older than 90 days (keep data for trending analysis and long-term analytics)
    const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000;
    await client.zRemRangeByScore(formatHistoryKey(postId), "-inf", ninetyDaysAgo);
    
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
  const client = await getClient();
  if (!client) return null;
  try {
    const value = await client.get(formatKey(postId));
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
  const client = await getClient();
  if (!client) return null;
  try {
    const now = Date.now();
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;
    const count = await client.zCount(
      formatHistoryKey(postId),
      twentyFourHoursAgo,
      now
    );
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
export async function getPostViewsInRange(postId: string, days: number | null): Promise<number | null> {
  const client = await getClient();
  if (!client) return null;
  
  // If days is null, return all-time views
  if (days === null) {
    return getPostViews(postId);
  }
  
  try {
    const now = Date.now();
    const rangeStart = now - (days * 24 * 60 * 60 * 1000);
    const count = await client.zCount(
      formatHistoryKey(postId),
      rangeStart,
      now
    );
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
  const client = await getClient();
  const viewMap = new Map<string, number>();
  
  if (!client) return viewMap;
  
  try {
    const keys = postIds.map(formatKey);
    const values = await client.mGet(keys);
    
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
  const client = await getClient();
  const viewMap = new Map<string, number>();
  
  if (!client) return viewMap;
  
  try {
    const now = Date.now();
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;
    
    // Use Redis pipeline to batch all zCount operations into a single round-trip
    const pipeline = client.multi();
    postIds.forEach((postId) => {
      pipeline.zCount(formatHistoryKey(postId), twentyFourHoursAgo, now);
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
export async function getMultiplePostViewsInRange(postIds: string[], days: number | null): Promise<Map<string, number>> {
  const client = await getClient();
  const viewMap = new Map<string, number>();
  
  if (!client) return viewMap;
  
  // If days is null, return all-time views
  if (days === null) {
    return getMultiplePostViews(postIds);
  }
  
  try {
    const now = Date.now();
    const rangeStart = now - (days * 24 * 60 * 60 * 1000);
    
    // Use Redis pipeline to batch all zCount operations into a single round-trip
    const pipeline = client.multi();
    postIds.forEach((postId) => {
      pipeline.zCount(formatHistoryKey(postId), rangeStart, now);
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
