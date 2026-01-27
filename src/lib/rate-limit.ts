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

import { redis } from '@/mcp/shared/redis-client';
import { isIPBlocked, isIPSuspicious } from './blocked-ips';

const RATE_LIMIT_KEY_PREFIX = 'ratelimit:';

// In-memory fallback for local development without Redis
type RateLimitEntry = {
  count: number;
  resetTime: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

// Local IP reputation tracking for escalation (unknown -> suspicious -> malicious)
// Used to track repeat abuse attempts and escalate rate limits
type IpReputationEntry = {
  abuseCount: number;
  lastAbuseTime: number;
  classification: 'unknown' | 'suspicious' | 'malicious';
};

const localIpReputation = new Map<string, IpReputationEntry>();

// Cleanup old entries periodically to prevent memory leaks
const CLEANUP_INTERVAL = 60000; // 1 minute
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup > CLEANUP_INTERVAL) {
    const keysToDelete: string[] = [];
    const reputationKeysToDelete: string[] = [];

    rateLimitStore.forEach((entry, key) => {
      if (now > entry.resetTime) {
        keysToDelete.push(key);
      }
    });

    // Also cleanup expired reputation entries (24 hours without abuse)
    localIpReputation.forEach((entry, key) => {
      const hoursSinceLastAbuse = (now - entry.lastAbuseTime) / (1000 * 60 * 60);
      if (hoursSinceLastAbuse > 24) {
        reputationKeysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => rateLimitStore.delete(key));
    reputationKeysToDelete.forEach((key) => localIpReputation.delete(key));
    lastCleanup = now;
  }
}

/**
 * Get the current local reputation classification for an IP
 * Decays abuse count after 24 hours of no new attempts
 */
function getLocalIpReputation(ip: string): 'unknown' | 'suspicious' | 'malicious' {
  const entry = localIpReputation.get(ip);
  if (!entry) return 'unknown';

  const now = Date.now();
  const hoursSinceLastAbuse = (now - entry.lastAbuseTime) / (1000 * 60 * 60);

  // Decay: reset to unknown after 24 hours without new abuse attempts
  if (hoursSinceLastAbuse > 24) {
    localIpReputation.delete(ip);
    return 'unknown';
  }

  return entry.classification;
}

/**
 * Record an abuse attempt and potentially escalate IP classification
 * Escalation path: unknown (1 attempt) -> suspicious (3+ attempts) -> malicious (10+ attempts)
 */
function recordLocalAbuseAttempt(ip: string): void {
  const now = Date.now();
  const entry = localIpReputation.get(ip) || {
    abuseCount: 0,
    lastAbuseTime: now,
    classification: 'unknown' as const,
  };

  entry.abuseCount++;
  entry.lastAbuseTime = now;

  // Escalate classification based on cumulative abuse attempts
  if (entry.abuseCount >= 10) {
    entry.classification = 'malicious';
  } else if (entry.abuseCount >= 3) {
    entry.classification = 'suspicious';
  }

  localIpReputation.set(ip, entry);
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

  // Use Redis for distributed rate limiting
  try {
    return await rateLimitRedis(identifier, config);
  } catch (error) {
    // Fallback to in-memory on Redis errors
    console.error('Redis rate limit error, falling back to memory:', error);
    return rateLimitMemory(identifier, config);
  }
}

/**
 * Rate limit with IP reputation checking
 * Implements escalation: external DB + local abuse tracking
 * When rate limiting is exceeded, records an abuse attempt and escalates local reputation
 */
async function rateLimitWithReputation(
  ip: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  // Check if IP is permanently blocked
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

  // Check multiple reputation sources: external DB + local tracking
  const [isSuspiciousExternal, localReputation] = await Promise.all([
    isIPSuspicious(ip),
    Promise.resolve(getLocalIpReputation(ip)),
  ]);

  // Determine rate limit configuration based on combined reputation
  let reputationConfig: RateLimitConfig;
  let classification: 'malicious' | 'suspicious' | 'unknown' | 'benign';

  // Escalation logic: take the stricter of external or local reputation
  if (localReputation === 'malicious' || isSuspiciousExternal) {
    classification = 'suspicious';
    reputationConfig = {
      limit: DEFAULT_REPUTATION_LIMITS.suspicious.limit,
      windowInSeconds: DEFAULT_REPUTATION_LIMITS.suspicious.windowInSeconds,
      failClosed: config.failClosed,
    };
  } else if (localReputation === 'suspicious') {
    classification = 'suspicious';
    reputationConfig = {
      limit: DEFAULT_REPUTATION_LIMITS.suspicious.limit,
      windowInSeconds: DEFAULT_REPUTATION_LIMITS.suspicious.windowInSeconds,
      failClosed: config.failClosed,
    };
  } else {
    // For unknown/benign IPs, use the original config
    classification = 'unknown';
    reputationConfig = config;
  }

  // Apply rate limiting with reputation-adjusted config
  let result: RateLimitResult;

  try {
    result = await rateLimitRedis(ip, reputationConfig);
  } catch (error) {
    console.error('Redis rate limit error, falling back to memory:', error);
    result = await rateLimitMemory(ip, reputationConfig);
  }

  // Track local abuse attempts to escalate reputation
  // When rate limit is exceeded, record the abuse and potentially escalate classification
  if (!result.success) {
    recordLocalAbuseAttempt(ip);
    // Update the result classification to reflect new escalated reputation
    const updatedLocalRep = getLocalIpReputation(ip);
    classification =
      updatedLocalRep === 'malicious' || updatedLocalRep === 'suspicious'
        ? 'suspicious'
        : classification;
  }

  // Add reputation information to result
  result.reputation = {
    is_blocked: false,
    is_suspicious: isSuspiciousExternal || localReputation !== 'unknown',
    classification,
  };

  return result;
}

/**
 * Check if string is a valid IP address
 */
function isValidIP(str: string): boolean {
  const ipv4Regex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv4Regex.test(str) || ipv6Regex.test(str);
}

/**
 * Redis-based distributed rate limiting
 */
async function rateLimitRedis(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const key = `${RATE_LIMIT_KEY_PREFIX}${identifier}`;
  const now = Date.now();
  const windowMs = config.windowInSeconds * 1000;
  const resetTime = now + windowMs;

  try {
    // Use Redis INCR with PXAT (millisecond expiration timestamp)
    const count = await redis.incr(key);

    // Set expiration on first request
    if (count === 1) {
      await redis.pexpireat(key, resetTime);
    }

    // Get the TTL - use pttl which is the millisecond version
    let ttlMs = windowMs;
    try {
      const pttlResult = await redis.pttl(key);
      if (typeof pttlResult === 'number' && pttlResult > 0) {
        ttlMs = pttlResult;
      }
    } catch {
      // Fallback to window if pttl fails
      console.warn('Could not get pttl from Redis, using window duration:', windowMs);
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

    if (process.env.NODE_ENV !== 'production') {
      console.error(
        `Rate limit Redis error, failing ${shouldFailClosed ? 'closed' : 'open'}:`,
        error
      );
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
function rateLimitMemory(identifier: string, config: RateLimitConfig): RateLimitResult {
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
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, use the first one
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback (shouldn't happen on Vercel)
  return 'unknown';
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
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  };

  // Add reputation headers if available
  if (result.reputation) {
    headers['X-RateLimit-Reputation'] = result.reputation.classification;
    if (result.reputation.is_blocked) {
      headers['X-RateLimit-Blocked'] = 'true';
      headers['X-RateLimit-Block-Reason'] = result.reputation.reason || 'security';
    }
    if (result.reputation.is_suspicious) {
      headers['X-RateLimit-Suspicious'] = 'true';
    }
  }

  return headers;
}

/**
 * Rate limit specifically for IP addresses with reputation checking
 * This is the main function to use for API routes that need IP protection
 */
export async function rateLimitByIP(
  request: Request,
  config: {
    limit: number;
    windowInSeconds: number;
    checkReputation?: boolean;
    failClosed?: boolean;
  }
): Promise<RateLimitResult> {
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
  const standardLimits = limits.standard ?? {
    limit: 100,
    windowInSeconds: 300,
  };
  const suspiciousLimits = limits.suspicious ?? {
    limit: 10,
    windowInSeconds: 300,
  };

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
