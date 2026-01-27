/**
 * Anti-spam utilities for view and share tracking
 *
 * Provides multiple layers of protection:
 * 1. Rate limiting (IP-based)
 * 2. Session deduplication (prevent same session counting twice)
 * 3. Request validation (user-agent, referer, timing)
 * 4. Abuse pattern detection
 */

import { redis } from '@/mcp/shared/redis-client';
import { NextRequest } from 'next/server';

/**
 * Extract client IP from request headers
 * Handles various proxy headers (Vercel, CloudFlare, etc.)
 */
export function getClientIp(request: NextRequest): string {
  // Check common proxy headers in order of trust
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can be a comma-separated list, take the first (original client)
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to a generic identifier if no IP available
  return 'unknown';
}

/**
 * Validate basic request properties to detect bots and suspicious activity
 */
export type RequestValidationResult = {
  valid: boolean;
  reason?: string;
};

export function validateRequest(request: NextRequest): RequestValidationResult {
  const userAgent = request.headers.get('user-agent');

  // Require user-agent
  if (!userAgent) {
    return { valid: false, reason: 'missing_user_agent' };
  }

  // Block known bot patterns (basic check, not exhaustive)
  const botPatterns = [/bot/i, /crawler/i, /spider/i, /scraper/i, /curl/i, /wget/i, /python/i];

  for (const pattern of botPatterns) {
    if (pattern.test(userAgent)) {
      return { valid: false, reason: 'bot_detected' };
    }
  }

  // Check for suspiciously short user-agents
  if (userAgent.length < 10) {
    return { valid: false, reason: 'suspicious_user_agent' };
  }

  return { valid: true };
}

/**
 * Check if a session has already performed an action within a time window
 * Returns true if this is a duplicate (should be blocked)
 */
export async function checkSessionDuplication(
  actionType: 'view' | 'share',
  postId: string,
  sessionId: string,
  windowSeconds: number
): Promise<boolean> {
  const key = `session:${actionType}:${postId}:${sessionId}`;

  try {
    // Check if key exists
    const exists = await redis.exists(key);

    if (exists) {
      // This session already performed this action recently
      return true;
    }

    // Set the key with expiration
    await redis.setex(key, windowSeconds, '1');
    return false;
  } catch (error) {
    console.error('Session deduplication error:', error);
    // On error, allow the action (fail open for availability)
    return false;
  }
}

/**
 * Record an abuse attempt for monitoring and pattern detection
 */
export async function recordAbuseAttempt(
  ip: string,
  actionType: 'view' | 'share',
  reason: string
): Promise<void> {
  const key = `abuse:${actionType}:${ip}`;
  const now = Date.now();

  try {
    // Add to sorted set with timestamp
    await redis.zadd(key, {
      score: now,
      member: `${now}:${reason}`,
    });

    // Keep only last 24 hours of abuse records
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    await redis.zremrangebyscore(key, '-inf', oneDayAgo);

    // Set expiration to auto-cleanup
    await redis.expire(key, 86400); // 24 hours
  } catch (error) {
    console.error('Failed to record abuse attempt:', error);
  }
}

/**
 * Check if an IP has suspicious abuse patterns
 * Returns true if the IP should be rate-limited more aggressively
 */
export async function detectAbusePattern(
  ip: string,
  actionType: 'view' | 'share'
): Promise<boolean> {
  const key = `abuse:${actionType}:${ip}`;
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;

  try {
    // Count abuse attempts in the last hour
    const count = await redis.zcount(key, oneHourAgo, now);

    // More than 10 abuse attempts in an hour = suspicious
    return count > 10;
  } catch (error) {
    console.error('Abuse pattern detection error:', error);
    return false;
  }
}

/**
 * Validate timing-based constraints
 * For shares: ensure minimum time has passed since page load
 */
export type TimingValidation = {
  valid: boolean;
  reason?: string;
};

export function validateTiming(
  actionType: 'view' | 'share',
  timeSincePageLoad?: number
): TimingValidation {
  if (typeof timeSincePageLoad !== 'number' || timeSincePageLoad < 0) {
    return { valid: false, reason: 'invalid_timing_data' };
  }

  if (actionType === 'view') {
    // Views require at least 5 seconds on page (genuine reading)
    if (timeSincePageLoad < 5000) {
      return { valid: false, reason: 'insufficient_time_on_page' };
    }
  } else if (actionType === 'share') {
    // Shares require at least 2 seconds (prevent instant auto-scripts)
    if (timeSincePageLoad < 2000) {
      return { valid: false, reason: 'share_too_fast' };
    }
  }

  return { valid: true };
}

// Re-export client-safe utilities (no Redis dependency)
export { generateSessionId, isValidSessionId } from './anti-spam-client';
