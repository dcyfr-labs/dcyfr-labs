/**
 * Upstash Redis client for MCP servers and main app
 * Supports multi-environment setup with automatic key namespacing
 *
 * Environments:
 * - Production: Dedicated database (no key prefix)
 * - Preview: Shared database with preview:{PR}:* prefix
 * - Development: Shared database with dev:{username}:* prefix
 * - Test: In-memory fallback (no Redis)
 *
 * Upstash provides serverless Redis with HTTP-based REST API, perfect for
 * Vercel Edge Functions and serverless deployments (no persistent connections needed)
 */

import { Redis } from '@upstash/redis';

/**
 * Upstash Redis client instance
 * Lazy-initialized on first use to avoid connection in build/test environments
 */
let redisClient: Redis | null = null;

function getProductionCredentials(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    console.error('❌ CRITICAL: Production Redis credentials missing');
    return null;
  }
  return { url, token };
}

function getPreviewCredentials(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL_PREVIEW;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN_PREVIEW;
  if (url && token) {
    console.warn('Preview Redis connected (shared preview database)');
    return { url, token };
  }

  // ✅ PRODUCTION FALLBACK: Check production credentials exist before using
  const prodUrl = process.env.UPSTASH_REDIS_REST_URL;
  const prodToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (prodUrl && prodToken) {
    console.warn('⚠️ Preview Redis not configured, using production credentials (unsafe!)');
    // CRITICAL: Do NOT use any legacy REDIS_URL or PREVIEW_REDIS_URL
    // Only use Upstash variables which use REST API instead of TCP
    return { url: prodUrl, token: prodToken };
  }

  // Log detailed error for debugging
  console.error('❌ Preview Redis credentials missing:', {
    UPSTASH_REDIS_REST_URL_PREVIEW: process.env.UPSTASH_REDIS_REST_URL_PREVIEW
      ? 'SET'
      : 'MISSING',
    UPSTASH_REDIS_REST_TOKEN_PREVIEW: process.env.UPSTASH_REDIS_REST_TOKEN_PREVIEW
      ? 'SET'
      : 'MISSING',
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL ? 'SET' : 'MISSING',
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN ? 'SET' : 'MISSING',
    // SECURITY: Do NOT log legacy variables that might contain old Redis Cloud URLs
    legacyPreviewRedisExists: !!process.env.PREVIEW_REDIS_URL,
    legacyRedisExists: !!process.env.REDIS_URL,
  });

  if (process.env.PREVIEW_REDIS_URL || process.env.REDIS_URL) {
    console.error('🚨 CRITICAL: Legacy Redis variables detected! These cause ENOTFOUND errors.');
    console.error('   Remove PREVIEW_REDIS_URL and REDIS_URL from environment variables.');
    console.error('   Only use UPSTASH_REDIS_REST_* variables for serverless Redis.');
  }

  return null;
}

function getDevelopmentCredentials(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL_PREVIEW;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN_PREVIEW;
  if (url && token) {
    console.warn('Development Redis connected (shared preview database)');
    return { url, token };
  }
  // Graceful degradation: No warning in production logs
  if (process.env.NODE_ENV !== 'test') {
    console.warn('ℹ️ Development Redis not configured, analytics/caching disabled');
  }
  return null;
}

/**
 * Get environment-specific Redis credentials
 * Returns null for test environment (uses in-memory fallback)
 */
function getRedisCredentials(): { url: string; token: string } | null {
  const isProduction =
    process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'production';
  const isPreview = process.env.VERCEL_ENV === 'preview';
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isTest = process.env.NODE_ENV === 'test';

  // Test environment: No Redis (in-memory fallback)
  if (isTest) return null;
  if (isProduction) return getProductionCredentials();
  if (isPreview) return getPreviewCredentials();
  if (isDevelopment) return getDevelopmentCredentials();
  return null;
}

/**
 * Get environment-specific key prefix for Redis isolation
 *
 * SIMPLIFIED ARCHITECTURE (2026-01-30):
 * - Production: No prefix (dedicated database)
 * - Everything else (Dev + Preview): 'preview:' prefix (SHARED)
 *
 * This allows dev and preview to share the same cached data,
 * reducing complexity and ensuring consistency across environments.
 *
 * FIX (2026-02-01): More defensive production check to prevent prefix in production
 */
export function getRedisKeyPrefix(): string {
  // ✅ DEFENSIVE: Multiple checks to ensure production is detected correctly
  // Priority order: VERCEL_ENV (most reliable) > NODE_ENV (fallback)
  const isProduction =
    process.env.VERCEL_ENV === 'production' ||
    (process.env.NODE_ENV === 'production' &&
      (!process.env.VERCEL_ENV || process.env.VERCEL_ENV !== 'preview'));

  if (isProduction) {
    return ''; // No prefix for production (dedicated database)
  }

  // ✅ SIMPLIFIED: All non-production environments share 'preview:' prefix
  // This includes: local development, preview deployments, CI/CD
  return 'preview:';
}

/**
 * Get or create Upstash Redis client
 * Returns null if Redis not configured (graceful degradation)
 */
function getRedisClient(): Redis | null {
  const credentials = getRedisCredentials();

  if (!credentials) {
    // Graceful degradation: Redis not configured (expected in development/test)
    // Only log once to avoid console spam during module initialization
    if (!redisClient && process.env.NODE_ENV === 'development') {
      console.warn('[Redis] No credentials configured (using fallback)', {
        environment: getRedisEnvironment(),
      });
    }
    return null;
  }

  if (!redisClient) {
    console.warn('[Redis] Client initialized', {
      environment: getRedisEnvironment(),
      urlPrefix: credentials.url.substring(0, 30),
      keyPrefix: getRedisKeyPrefix(),
    });

    try {
      redisClient = new Redis({
        url: credentials.url,
        token: credentials.token,
        // Add resilience configurations for production reliability
        retry: {
          retries: 3,
          backoff: (retryCount: number) => {
            // Exponential backoff: 100ms, 200ms, 400ms (capped at 2000ms)
            return Math.min(100 * Math.pow(2, retryCount), 2000);
          },
        },
      });

      // Test connection asynchronously (non-blocking)
      redisClient
        .ping()
        .then(() => {
          console.warn('[Redis] ✅ Connection verified successfully');
        })
        .catch((error) => {
          console.error(
            '[Redis] ⚠️ Ping test failed (client still available for retries):',
            error instanceof Error ? error.message : String(error)
          );
        });
    } catch (initError) {
      console.error('[Redis] ❌ Failed to initialize client:', initError);
      redisClient = null;
      return null;
    }
  }

  return redisClient;
}

/**
 * Upstash Redis client with environment-aware key prefixing
 * Auto-initializes on first use with environment credentials
 *
 * Compatible with standard Redis API:
 * - get, set, setex, del
 * - incr, zadd, zrange, lpush, lrange
 * - All operations work via HTTP REST API
 *
 * Automatic key namespacing:
 * - Production: no prefix (dedicated database)
 * - Preview: preview:{PR}:key
 * - Development: dev:{username}:key
 */
export const redis = new Proxy({} as Redis, {
  get(_target, prop) {
    const client = getRedisClient();

    // Graceful degradation: return no-op functions when Redis unavailable
    if (!client) {
      if (prop === 'ping') {
        return async () => {
          throw new Error('Redis not configured');
        };
      }
      // Return generic no-op async function for method calls when Redis unavailable
      // This prevents "redis.get is not a function" errors in tests and allows
      // code to gracefully handle missing cache (receives null result).
      return async (..._args: any[]) => null;
    }

    const value = client[prop as keyof Redis];

    if (typeof value === 'function') {
      // Intercept methods that use keys and add environment prefix
      const keyMethods = [
        'get',
        'set',
        'setex',
        'del',
        'incr',
        'decr',
        'zadd',
        'zrange',
        'zrangebyscore',
        'zrem',
        'lpush',
        'rpush',
        'lrange',
        'llen',
        'hget',
        'hset',
        'hdel',
        'hgetall',
        'expire',
        'ttl',
        'exists',
      ];

      if (keyMethods.includes(prop as string)) {
        return function (key: string, ...args: any[]): Promise<any> {
          const prefixedKey = getRedisKeyPrefix() + key;

          // Add timeout protection to Redis operations
          const redisMethod = value as (...args: any[]) => any;
          const operation = redisMethod.call(client, prefixedKey, ...args);

          // Most Redis operations should complete quickly
          // Use different timeouts based on operation type
          const timeout = ['keys', 'scan'].includes(prop as string) ? 15000 : 10000;

          return Promise.race([
            operation,
            new Promise((_, reject) =>
              setTimeout(
                () => reject(new Error(`Redis ${String(prop)} operation timed out`)),
                timeout
              )
            ),
          ]);
        };
      }

      // Add timeout protection to non-key methods as well
      if (typeof value === 'function') {
        return function (...args: any[]): Promise<any> {
          const redisMethod = value as (...args: any[]) => any;
          const operation = redisMethod.call(client, ...args);

          // Use shorter timeout for ping and other utility operations
          const timeout = prop === 'ping' ? 5000 : 10000;

          return Promise.race([
            operation,
            new Promise((_, reject) =>
              setTimeout(
                () => reject(new Error(`Redis ${String(prop)} operation timed out`)),
                timeout
              )
            ),
          ]);
        };
      }

      return value;
    }

    return value;
  },
});

/**
 * Get current Redis environment for debugging
 * Returns: 'production' | 'preview' | 'development' | 'test' | 'unknown'
 */
export function getRedisEnvironment(): string {
  if (process.env.NODE_ENV === 'test') return 'test';
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'production') {
    return 'production';
  }
  if (process.env.VERCEL_ENV === 'preview') return 'preview';
  if (process.env.NODE_ENV === 'development') return 'development';
  return 'unknown';
}

/**
 * Close Redis connection (for cleanup)
 * Note: Upstash uses HTTP, so no persistent connection to close
 * This is kept for API compatibility with previous implementation
 */
export async function closeRedisClient() {
  // Upstash uses HTTP REST API, no persistent connection to close
  // Just reset the client instance
  redisClient = null;
}
