/**
 * Server-side GitHub Data Access
 *
 * Provides secure access to cached GitHub contribution data without
 * exposing public API endpoints. Used for server-side rendering
 * of GitHub activity widgets.
 */

import { redis, getRedisEnvironment, getRedisKeyPrefix } from '@/mcp/shared/redis-client';

// ============================================================================
// TYPES
// ============================================================================

export interface ContributionDay {
  date: string;
  count: number;
}

export interface ContributionResponse {
  contributions: ContributionDay[];
  source: string;
  totalContributions: number;
  totalRepositories?: number;
  pinnedRepositories?: PinnedRepository[];
  lastUpdated: string;
  warning?: string;
}

export interface PinnedRepository {
  name: string;
  description?: string;
  url: string;
  language?: string;
  stars: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CACHE_KEY_BASE = 'github:contributions:dcyfr';
const FALLBACK_DATA_KEY_BASE = 'github:fallback-data';

/**
 * Get environment-aware cache key
 * Matches the key format used by populate-build-cache.mjs
 */
function getCacheKey(): string {
  return `${getRedisKeyPrefix()}${CACHE_KEY_BASE}`;
}

function getFallbackCacheKey(): string {
  return `${getRedisKeyPrefix()}${FALLBACK_DATA_KEY_BASE}`;
}

// ============================================================================
// FALLBACK DATA
// ============================================================================

/**
 * Return empty state when cache is unavailable
 *
 * NO demo/mock data is generated. Cache should be populated during build
 * or manually via /api/dev/populate-cache endpoint.
 */
function getEmptyState(): ContributionResponse {
  const isProduction = process.env.VERCEL_ENV === 'production';

  console.error('[GitHub Data] ❌ Cache unavailable - returning empty state');

  if (isProduction) {
    console.error('[GitHub Data]    CRITICAL: Redis unavailable in production');
    console.error('[GitHub Data]    Action required: Check build cache population');
  } else {
    console.warn('[GitHub Data]    Run: curl http://localhost:3000/api/dev/populate-cache');
  }

  return {
    contributions: [],
    source: 'cache-miss',
    totalContributions: 0,
    lastUpdated: new Date().toISOString(),
    warning: isProduction
      ? 'Unable to load GitHub data. Please try again later.'
      : 'Cache not populated. Visit /api/dev/populate-cache to populate.',
  };
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Fetch GitHub contribution data from cache (server-side)
 *
 * Returns cached data from Redis, with fallback to realistic demo data.
 * This function is designed for server-side usage only.
 *
 * @param username GitHub username (currently only supports "dcyfr")
 * @returns Promise<ContributionResponse> GitHub contribution data
 */
export async function getGitHubContributions(
  username: string = 'dcyfr'
): Promise<ContributionResponse> {
  // Only support the configured username for security
  if (username !== 'dcyfr') {
    console.warn(`[GitHub Data] Username ${username} not supported, returning empty state`);
    return getEmptyState();
  }

  try {
    const cacheKey = getCacheKey();
    console.log('[GitHub Data] 🔍 Attempting cache read', {
      key: cacheKey,
      environment: getRedisEnvironment(),
      redisAvailable: !!redis,
      gitCommitRef: process.env.VERCEL_GIT_COMMIT_REF,
      vercelEnv: process.env.VERCEL_ENV,
    });

    // Try the main cache
    const cached = await redis.get(cacheKey);

    if (cached && typeof cached === 'string') {
      const data = JSON.parse(cached) as ContributionResponse;

      // ✅ Clean any stale warning field from cached data
      // Production cache should never have warnings (those are for fallback only)
      if (data.source === 'github-api') {
        delete (data as any).warning;
      }

      console.log('[GitHub Data] ✅ Cache HIT', {
        totalContributions: data.totalContributions,
        lastUpdated: data.lastUpdated,
        source: data.source,
        hasWarning: !!(data as any).warning,
      });
      return data;
    } else {
      console.warn('[GitHub Data] ⚠️ Cache MISS - key not found or invalid', {
        cachedType: typeof cached,
        cachedValue: cached === null ? 'null' : 'other',
      });
    }

    // Try fallback cache if main cache is empty
    const fallbackCached = await redis.get(getFallbackCacheKey());

    if (fallbackCached && typeof fallbackCached === 'string') {
      const data = JSON.parse(fallbackCached) as ContributionResponse;
      data.warning = 'Using cached data - GitHub API temporarily unavailable';
      console.warn('[GitHub Data] ⚠️ Using fallback cache');
      return data;
    }
  } catch (error) {
    console.error('[GitHub Data] ❌ Cache read failed', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
  }

  // If all cache attempts fail, return empty state
  console.warn('[GitHub Data] All cache attempts failed, returning empty state');
  return getEmptyState();
}

/**
 * Check if GitHub data cache is healthy (for monitoring)
 */
export async function checkGitHubDataHealth(): Promise<{
  cacheAvailable: boolean;
  dataFresh: boolean;
  lastUpdated?: string;
  totalContributions?: number;
}> {
  try {
    const cached = await redis.get(getCacheKey());

    if (!cached || typeof cached !== 'string') {
      return { cacheAvailable: true, dataFresh: false };
    }

    const data = JSON.parse(cached) as ContributionResponse;
    const lastUpdated = new Date(data.lastUpdated);
    const isRecent = Date.now() - lastUpdated.getTime() < 2 * 60 * 60 * 1000; // 2 hours

    return {
      cacheAvailable: true,
      dataFresh: isRecent,
      lastUpdated: data.lastUpdated,
      totalContributions: data.totalContributions,
    };
  } catch (error) {
    return { cacheAvailable: false, dataFresh: false };
  }
}
