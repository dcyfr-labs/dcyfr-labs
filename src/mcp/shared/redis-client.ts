/**
 * Redis client for MCP servers
 * Uses REDIS_URL from environment (same as main app)
 * 
 * Note: Uses standard redis client (not @upstash/redis) to support
 * both Redis Cloud and Upstash instances via REDIS_URL
 */

import { createClient } from "redis";

type RedisClient = ReturnType<typeof createClient>;

let redisClient: RedisClient | null = null;
let connecting: Promise<RedisClient> | null = null;

/**
 * Get or create Redis client for MCP servers
 * Only initializes when first used (lazy loading)
 */
async function getRedisClient(): Promise<RedisClient> {
  const redisUrl = process.env.REDIS_URL;
  
  if (!redisUrl) {
    throw new Error(
      "Missing Redis credentials. Set REDIS_URL in .env.local (same as main app)"
    );
  }

  // If already connected, return it
  if (redisClient?.isOpen) {
    return redisClient;
  }

  // If currently connecting, wait for that
  if (connecting) {
    return connecting;
  }

  // Start new connection
  connecting = (async () => {
    if (!redisClient) {
      redisClient = createClient({ 
        url: redisUrl,
        socket: {
          connectTimeout: 5000,
          reconnectStrategy: (retries) => {
            if (retries > 3) return new Error('Max retries exceeded');
            return Math.min(retries * 100, 3000);
          },
        },
      });

      redisClient.on("error", (error) => {
        console.error("[MCP Analytics] Redis error:", error);
      });
    }

    if (!redisClient.isOpen) {
      await redisClient.connect();
    }

    connecting = null;
    return redisClient;
  })();

  return connecting;
}

/**
 * Redis client proxy that auto-connects on first use
 * Provides same interface as standard redis client
 */
export const redis = new Proxy({} as RedisClient, {
  get(_target, prop) {
    // Return an async wrapper for any method
    return async (...args: any[]) => {
      const client = await getRedisClient();
      const method = client[prop as keyof RedisClient];
      if (typeof method === 'function') {
        return method.apply(client, args);
      }
      return method;
    };
  },
});

/**
 * Close Redis connection (for cleanup)
 */
export async function closeRedisClient() {
  if (redisClient?.isOpen) {
    await redisClient.quit();
    redisClient = null;
    connecting = null;
  }
}
