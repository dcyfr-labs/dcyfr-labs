/**
 * Distributed rate limiter for API routes using Redis
 * 
 * Uses Redis for shared rate limiting across serverless instances when REDIS_URL is configured.
 * Falls back to in-memory storage for local development without Redis.
 * 
 * Features:
 * - Distributed rate limiting (Redis)
 * - Automatic TTL/expiration
 * - Graceful fallback to in-memory
 * - Standard rate limit headers
 */

import { createClient } from "redis";

type RedisClient = ReturnType<typeof createClient>;

const RATE_LIMIT_KEY_PREFIX = "ratelimit:";

declare global {
  var __rateLimitRedisClient: RedisClient | undefined;
}

/**
 * Get or create the Redis client for rate limiting
 */
async function getRateLimitClient(): Promise<RedisClient | null> {
  const redisUrl = process.env.REDIS_URL; // Read dynamically to allow test overrides
  if (!redisUrl) return null;

  if (!globalThis.__rateLimitRedisClient) {
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
        console.error("Rate limit Redis error:", error);
      }
    });
    globalThis.__rateLimitRedisClient = client;
  }

  const client = globalThis.__rateLimitRedisClient;
  if (!client) return null;

  if (!client.isOpen) {
    await client.connect();
  }

  return client;
}

// In-memory fallback for local development without Redis
type RateLimitEntry = {
  count: number;
  resetTime: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically to prevent memory leaks
const CLEANUP_INTERVAL = 60000; // 1 minute
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup > CLEANUP_INTERVAL) {
    const keysToDelete: string[] = [];
    rateLimitStore.forEach((entry, key) => {
      if (now > entry.resetTime) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((key) => rateLimitStore.delete(key));
    lastCleanup = now;
  }
}

export type RateLimitConfig = {
  /**
   * Maximum number of requests allowed within the window
   */
  limit: number;
  /**
   * Time window in seconds
   */
  windowInSeconds: number;
  /**
   * If true, fail closed (deny request) on Redis errors instead of failing open
   * Use for critical endpoints like contact forms
   * Default: false (fail open for availability)
   */
  failClosed?: boolean;
};

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

/**
 * Rate limit a request by identifier using Redis (distributed) or in-memory (fallback)
 * 
 * @param identifier - Unique identifier (e.g., IP address, user ID)
 * @param config - Rate limit configuration
 * @returns Rate limit result with success status and metadata
 */
export async function rateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const client = await getRateLimitClient();
  
  // Use Redis if available (distributed rate limiting)
  if (client) {
    return rateLimitRedis(client, identifier, config);
  }
  
  // Fallback to in-memory rate limiting (local development)
  return rateLimitMemory(identifier, config);
}

/**
 * Redis-based distributed rate limiting
 */
async function rateLimitRedis(
  client: RedisClient,
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const key = `${RATE_LIMIT_KEY_PREFIX}${identifier}`;
  const now = Date.now();
  const windowMs = config.windowInSeconds * 1000;
  const resetTime = now + windowMs;

  try {
    // Use Redis INCR with PXAT (millisecond expiration timestamp)
    const count = await client.incr(key);
    
    // Set expiration on first request
    if (count === 1) {
      await client.pExpireAt(key, resetTime);
    }
    
    // Get the TTL - use pttl which is the millisecond version
    let ttlMs = windowMs;
    try {
      const pttlResult = await (client.pttl ? client.pttl(key) : Promise.resolve(-2));
      if (typeof pttlResult === 'number' && pttlResult > 0) {
        ttlMs = pttlResult;
      }
    } catch {
      // Fallback to window if pttl fails
      console.debug('Could not get pttl from Redis, using window duration:', windowMs);
      ttlMs = windowMs;
    }
    const actualResetTime = now + ttlMs;

    if (count <= config.limit) {
      return {
        success: true,
        limit: config.limit,
        remaining: Math.max(0, config.limit - count),
        reset: actualResetTime,
      };
    }

    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      reset: actualResetTime,
    };
  } catch (error) {
    // On Redis error, fail according to configuration
    const shouldFailClosed = config.failClosed ?? false;

    if (process.env.NODE_ENV !== "production") {
      console.error(`Rate limit Redis error, failing ${shouldFailClosed ? 'closed' : 'open'}:`, error);
    }

    if (shouldFailClosed) {
      // Fail closed: deny the request to maintain security
      return {
        success: false,
        limit: config.limit,
        remaining: 0,
        reset: resetTime,
      };
    }

    // Fail open: allow the request to maintain availability
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      reset: resetTime,
    };
  }
}

/**
 * In-memory rate limiting (fallback for local development)
 */
function rateLimitMemory(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  cleanup();

  const now = Date.now();
  const windowMs = config.windowInSeconds * 1000;
  
  const entry = rateLimitStore.get(identifier);

  // No previous entry or window expired
  if (!entry || now > entry.resetTime) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(identifier, newEntry);

    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      reset: newEntry.resetTime,
    };
  }

  // Within the current window
  if (entry.count < config.limit) {
    entry.count += 1;
    rateLimitStore.set(identifier, entry);

    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - entry.count,
      reset: entry.resetTime,
    };
  }

  // Rate limit exceeded
  return {
    success: false,
    limit: config.limit,
    remaining: 0,
    reset: entry.resetTime,
  };
}

/**
 * Get the client IP address from the request
 * Works with Vercel's proxy headers
 * 
 * @param request - Next.js request object
 * @returns IP address or 'unknown'
 */
export function getClientIp(request: Request): string {
  // Vercel provides the real IP in x-forwarded-for or x-real-ip headers
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, use the first one
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Fallback (shouldn't happen on Vercel)
  return "unknown";
}

/**
 * Create rate limit headers for the response
 * Following standard rate limit header conventions
 * 
 * @param result - Rate limit result
 * @returns Headers object
 */
export function createRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": result.reset.toString(),
  };
}
