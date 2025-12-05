import { createClient } from "redis";

const SHARE_KEY_PREFIX = "shares:post:";
const SHARE_HISTORY_KEY_PREFIX = "shares:history:post:";
const redisUrl = process.env.REDIS_URL;

type RedisClient = ReturnType<typeof createClient>;

declare global {
  var __redisClient: RedisClient | undefined;
}

const formatKey = (postId: string) => `${SHARE_KEY_PREFIX}${postId}`;
const formatHistoryKey = (postId: string) => `${SHARE_HISTORY_KEY_PREFIX}${postId}`;

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
 * Increment share count for a post by its ID
 * Uses the permanent post ID (not the slug) so shares survive post renames
 * Also records the share in a sorted set for time-based tracking
 * 
 * @param postId Permanent post identifier (from post.id field)
 * @returns Updated share count, or null if Redis unavailable
 */
export async function incrementPostShares(postId: string): Promise<number | null> {
  const client = await getClient();
  if (!client) return null;
  try {
    const count = await client.incr(formatKey(postId));
    
    // Record share in sorted set with timestamp
    const now = Date.now();
    await client.zAdd(formatHistoryKey(postId), {
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
 * Get share count for a post in the last 24 hours
 * 
 * @param postId Permanent post identifier (from post.id field)
 * @returns Share count in last 24 hours, or null if Redis unavailable
 */
export async function getPostShares24h(postId: string): Promise<number | null> {
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
 * Get share counts for multiple posts at once (by ID)
 * More efficient than calling getPostShares multiple times
 * 
 * @param postIds Array of permanent post identifiers
 * @returns Map of postId -> share count
 */
export async function getPostSharesBulk(postIds: string[]): Promise<Record<string, number>> {
  const client = await getClient();
  if (!client || postIds.length === 0) return {};
  
  try {
    const keys = postIds.map(formatKey);
    const values = await client.mGet(keys);
    
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
  const client = await getClient();
  if (!client || postIds.length === 0) return {};
  
  try {
    const now = Date.now();
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;
    
    // Use Redis pipeline to batch all zCount operations into a single round-trip
    const pipeline = client.multi();
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
