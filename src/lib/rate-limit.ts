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
 * - IP reputation-based rate limiting
 * - Automatic blocking of malicious IPs
 */

import { createClient } from "redis";
import { isIPBlocked, isIPSuspicious } from "./blocked-ips";

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
  /**
   * If true, check IP reputation and apply different limits
   * Default: false (standard rate limiting)
   */
  checkReputation?: boolean;
};

export type ReputationBasedRateLimitConfig = {
  malicious: { limit: number; windowInSeconds: number; block: boolean };
  suspicious: { limit: number; windowInSeconds: number; block: boolean };
  unknown: { limit: number; windowInSeconds: number; block: boolean };
  benign: { limit: number; windowInSeconds: number; block: boolean };
};

// Default reputation-based rate limits
const DEFAULT_REPUTATION_LIMITS: ReputationBasedRateLimitConfig = {
  malicious: { limit: 1, windowInSeconds: 3600, block: true },
  suspicious: { limit: 10, windowInSeconds: 300, block: false },
  unknown: { limit: 60, windowInSeconds: 300, block: false },
  benign: { limit: 1000, windowInSeconds: 300, block: false },
};

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  /**
   * IP reputation information (only when checkReputation=true)
   */
  reputation?: {
    is_blocked: boolean;
    is_suspicious: boolean;
    classification: 'malicious' | 'suspicious' | 'unknown' | 'benign';
    reason?: string;
  };
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
  // Check IP reputation if enabled and identifier looks like an IP
  if (config.checkReputation && isValidIP(identifier)) {
    return await rateLimitWithReputation(identifier, config);
  }
  
  const client = await getRateLimitClient();
  
  // Use Redis if available (distributed rate limiting)
  if (client) {
    return rateLimitRedis(client, identifier, config);
  }
  
  // Fallback to in-memory rate limiting (local development)
  return rateLimitMemory(identifier, config);
}

/**
 * Rate limit with IP reputation checking
 */
async function rateLimitWithReputation(
  ip: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  // Check if IP is blocked
  const isBlocked = await isIPBlocked(ip);
  if (isBlocked) {
    return {
      success: false,
      limit: 0,
      remaining: 0,
      reset: Date.now() + 3600000, // Reset in 1 hour
      reputation: {
        is_blocked: true,
        is_suspicious: false,
        classification: 'malicious',
        reason: 'IP is permanently blocked',
      },
    };
  }

  // Check if IP is suspicious  
  const isSuspicious = await isIPSuspicious(ip);
  
  // Determine rate limit configuration based on reputation
  let reputationConfig: RateLimitConfig;
  let classification: 'malicious' | 'suspicious' | 'unknown' | 'benign';
  
  if (isSuspicious) {
    classification = 'suspicious';
    reputationConfig = {
      limit: DEFAULT_REPUTATION_LIMITS.suspicious.limit,
      windowInSeconds: DEFAULT_REPUTATION_LIMITS.suspicious.windowInSeconds,
      failClosed: config.failClosed,
    };
  } else {
    // For unknown/benign IPs, use the original config but with reputation metadata
    classification = 'unknown';
    reputationConfig = config;
  }

  // Apply rate limiting with reputation-adjusted config
  const client = await getRateLimitClient();
  let result: RateLimitResult;
  
  if (client) {
    result = await rateLimitRedis(client, ip, reputationConfig);
  } else {
    result = await rateLimitMemory(ip, reputationConfig);
  }

  // Add reputation information to result
  result.reputation = {
    is_blocked: false,
    is_suspicious: isSuspicious,
    classification,
  };

  return result;
}

/**
 * Check if string is a valid IP address
 */
function isValidIP(str: string): boolean {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv4Regex.test(str) || ipv6Regex.test(str);
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
 * Following standard rate limit header conventions with IP reputation info
 * 
 * @param result - Rate limit result
 * @returns Headers object
 */
export function createRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": result.reset.toString(),
  };
  
  // Add reputation headers if available
  if (result.reputation) {
    headers["X-RateLimit-Reputation"] = result.reputation.classification;
    if (result.reputation.is_blocked) {
      headers["X-RateLimit-Blocked"] = "true";
      headers["X-RateLimit-Block-Reason"] = result.reputation.reason || "security";
    }
    if (result.reputation.is_suspicious) {
      headers["X-RateLimit-Suspicious"] = "true";
    }
  }
  
  return headers;
}

/**
 * Rate limit specifically for IP addresses with reputation checking
 * This is the main function to use for API routes that need IP protection
 */
export async function rateLimitByIP(request: Request, config: {
  limit: number;
  windowInSeconds: number;
  checkReputation?: boolean;
  failClosed?: boolean;
}): Promise<RateLimitResult> {
  const clientIp = getClientIp(request);
  
  return await rateLimit(clientIp, {
    limit: config.limit,
    windowInSeconds: config.windowInSeconds,
    checkReputation: config.checkReputation ?? true, // Default to checking reputation
    failClosed: config.failClosed,
  });
}

/**
 * Simplified rate limiting for endpoints that need IP reputation protection
 * Uses sensible defaults for most use cases
 */
export async function rateLimitWithProtection(
  request: Request,
  limits: {
    standard?: { limit: number; windowInSeconds: number };
    suspicious?: { limit: number; windowInSeconds: number };
  } = {}
): Promise<RateLimitResult> {
  const clientIp = getClientIp(request);
  
  // Default limits
  const standardLimits = limits.standard ?? { limit: 100, windowInSeconds: 300 };
  const suspiciousLimits = limits.suspicious ?? { limit: 10, windowInSeconds: 300 };
  
  // Check reputation first
  const [isBlocked, isSuspicious] = await Promise.all([
    isIPBlocked(clientIp),
    isIPSuspicious(clientIp),
  ]);
  
  if (isBlocked) {
    return {
      success: false,
      limit: 0,
      remaining: 0,
      reset: Date.now() + 3600000,
      reputation: {
        is_blocked: true,
        is_suspicious: false,
        classification: 'malicious',
        reason: 'IP is blocked due to malicious activity',
      },
    };
  }
  
  // Apply appropriate limits based on reputation
  const config = isSuspicious ? suspiciousLimits : standardLimits;
  
  const result = await rateLimit(clientIp, config);
  
  // Add reputation info
  result.reputation = {
    is_blocked: false,
    is_suspicious: isSuspicious,
    classification: isSuspicious ? 'suspicious' : 'unknown',
  };
  
  return result;
}
