/**
 * Server-side GitHub Data Access
 *
 * Provides secure access to cached GitHub contribution data without
 * exposing public API endpoints. Used for server-side rendering
 * of GitHub activity widgets.
 */

import { redis, getRedisEnvironment } from '@/mcp/shared/redis-client';

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

const CACHE_KEY = 'github:contributions:dcyfr';
const FALLBACK_DATA_KEY = 'github:fallback-data';

// ============================================================================
// FALLBACK DATA
// ============================================================================

/**
 * Generate realistic fallback data for development/demo purposes (DEV ONLY)
 *
 * ⚠️  WARNING: This generates SAMPLE data and should only be used when Redis
 * is unavailable in development/testing environments.
 *
 * Do NOT use this fallback in production - demo data must never reach production users.
 * In production, if Redis is unavailable, return an error response instead.
 */
function generateFallbackData(): ContributionResponse {
  // ✅ FIX: Use VERCEL_ENV to properly distinguish production from preview
  // Preview environments have NODE_ENV=production but VERCEL_ENV=preview
  const isProduction = process.env.VERCEL_ENV === 'production';

  // PRODUCTION PROTECTION: NEVER show demo data in production
  if (isProduction) {
    console.error('[GitHub Data] ❌ CRITICAL ERROR: Redis unavailable in production');
    console.error('[GitHub Data]    Cannot load real GitHub contributions');
    console.error('[GitHub Data]    Returning empty data instead of demo data');
    console.error('[GitHub Data]    Action required: Restore Redis connection');

    // Return empty data instead of demo data
    return {
      contributions: [],
      source: 'error',
      totalContributions: 0,
      lastUpdated: new Date().toISOString(),
      warning:
        '⚠️ Unable to load GitHub data - Redis connection unavailable. Please try again later.',
    };
  }

  // Development/preview: Use demo data with clear indication
  const contributions: ContributionDay[] = [];
  const endDate = new Date();
  let totalContributions = 0;

  // Generate data for past year
  for (let i = 365; i >= 0; i--) {
    const date = new Date(endDate);
    date.setDate(date.getDate() - i);

    // Simulate realistic contribution patterns
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const baseChance = isWeekend ? 0.3 : 0.8;

    let count = 0;
    if (Math.random() < baseChance) {
      count = Math.floor(Math.random() * (isWeekend ? 3 : 8)) + 1;
      totalContributions += count;
    }

    contributions.push({
      date: date.toISOString().split('T')[0],
      count,
    });
  }

  return {
    contributions,
    source: 'fallback-data',
    totalContributions,
    totalRepositories: 42,
    lastUpdated: new Date().toISOString(),
    warning: 'Using demo data - GitHub API temporarily unavailable (DEV MODE)',
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
    console.warn(`[GitHub Data] Username ${username} not supported, using fallback`);
    return generateFallbackData();
  }

  try {
    console.log('[GitHub Data] 🔍 Attempting cache read', {
      key: CACHE_KEY,
      environment: getRedisEnvironment(),
      redisAvailable: !!redis,
    });

    // Try the main cache
    const cached = await redis.get(CACHE_KEY);

    if (cached && typeof cached === 'string') {
      const data = JSON.parse(cached) as ContributionResponse;
      console.log('[GitHub Data] ✅ Cache HIT', {
        totalContributions: data.totalContributions,
        lastUpdated: data.lastUpdated,
        source: data.source,
      });
      return data;
    } else {
      console.warn('[GitHub Data] ⚠️ Cache MISS - key not found or invalid', {
        cachedType: typeof cached,
        cachedValue: cached === null ? 'null' : 'other',
      });
    }

    // Try fallback cache if main cache is empty
    const fallbackCached = await redis.get(FALLBACK_DATA_KEY);

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

  // If all cache attempts fail, return fallback data
  console.warn('[GitHub Data] All cache attempts failed, using fallback data');
  return generateFallbackData();
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
    const cached = await redis.get(CACHE_KEY);

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
