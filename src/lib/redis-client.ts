/**
 * Redis Client Configuration
 *
 * Centralized Redis client for the application.
 * Moved from src/mcp/shared/redis-client.ts during refactor.
 */

import 'server-only';
import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;

/**
 * Get Redis environment configuration
 */
export function getRedisEnvironment(): 'production' | 'development' | 'test' {
  if (process.env.NODE_ENV === 'production') {
    return 'production';
  }
  if (process.env.NODE_ENV === 'test') {
    return 'test';
  }
  return 'development';
}

/**
 * Get Redis key prefix based on environment
 */
export function getRedisKeyPrefix(): string {
  const env = getRedisEnvironment();
  switch (env) {
    case 'production':
      return 'dcyfr:prod:';
    case 'test':
      return 'dcyfr:test:';
    case 'development':
    default:
      return 'dcyfr:dev:';
  }
}

/**
 * Initialize and return Redis client
 */
function getRedisClient(): RedisClientType {
  if (redisClient) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    console.warn('[Redis] REDIS_URL not set - Redis operations will be stubbed');
    // Return a stub client that no-ops all operations
    // This allows the build to succeed without Redis credentials
    return createStubRedisClient();
  }

  redisClient = createClient({
    url: redisUrl,
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          return new Error('Redis connection failed after 10 retries');
        }
        return Math.min(retries * 100, 3000);
      },
    },
  });

  redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });

  redisClient.on('connect', () => {
    console.log('Redis client connected');
  });

  redisClient.on('ready', () => {
    console.log('Redis client ready');
  });

  redisClient.on('end', () => {
    console.log('Redis client disconnected');
    redisClient = null;
  });

  // Connect asynchronously
  redisClient.connect().catch((err) => {
    console.error('Failed to connect to Redis:', err);
  });

  return redisClient;
}

/**
 * Create a stub Redis client for when REDIS_URL is not set
 * All operations return empty/default values
 */
function createStubRedisClient(): RedisClientType {
  const stub = {
    // Common operations return safe defaults
    get: async () => null,
    set: async () => 'OK',
    setEx: async () => 'OK',
    del: async () => 0,
    exists: async () => 0,
    expire: async () => false,
    ttl: async () => -2,
    pTTL: async () => -2,
    incr: async () => 1,
    decr: async () => -1,

    // Hash operations
    hGet: async () => null,
    hGetAll: async () => ({}),
    hSet: async () => 0,
    hDel: async () => 0,
    hExists: async () => false,
    hIncrBy: async () => 0,

    // List operations
    lPush: async () => 0,
    rPush: async () => 0,
    lPop: async () => null,
    rPop: async () => null,
    lRange: async () => [],
    lTrim: async () => 'OK',

    // Set operations
    sAdd: async () => 0,
    sRem: async () => 0,
    sMembers: async () => [],
    sIsMember: async () => false,
    sCard: async () => 0,

    // Sorted set operations
    zAdd: async () => 0,
    zRem: async () => 0,
    zRange: async () => [],
    zRangeByScore: async () => [],
    zScore: async () => null,
    zCount: async () => 0,
    zRemRangeByScore: async () => 0,

    // Multi/pipeline operations
    multi: () => stub,
    exec: async () => [],

    // Scan operations
    scan: async () => ({ cursor: 0, keys: [] }),

    // Key operations
    keys: async () => [],
    mGet: async () => [],
    pExpireAt: async () => false,

    // Connection methods (no-ops)
    connect: async () => undefined as any,
    disconnect: async () => undefined,
    quit: async () => undefined,
    isOpen: false,
    isReady: false,

    // Event emitter methods (no-ops)
    on: () => stub,
    off: () => stub,
    once: () => stub,
    emit: () => false,
  } as unknown as RedisClientType;

  return stub;
}

/**
 * Exported Redis client instance
 */
export const redis = getRedisClient();

/**
 * Close Redis connection (for graceful shutdown)
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}
