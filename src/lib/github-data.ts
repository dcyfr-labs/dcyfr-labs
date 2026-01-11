/**
 * Server-side GitHub Data Access
 *
 * Provides secure access to cached GitHub contribution data without
 * exposing public API endpoints. Used for server-side rendering
 * of GitHub activity widgets.
 */

// Conditional import to prevent client-side bundling
let createClientFn: any = null;

async function getCreateClient() {
  if (typeof window === "undefined" && !createClientFn) {
    const { createClient } = await import("redis");
    createClientFn = createClient;
  }
  return createClientFn;
}

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

const CACHE_KEY = "github:contributions:dcyfr";
const FALLBACK_DATA_KEY = "github:fallback-data";

// ============================================================================
// REDIS CLIENT
// ============================================================================

/**
 * Get Redis client for cache access
 */
async function getRedisClient() {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.warn("[GitHub Data] REDIS_URL not configured");
    return null;
  }

  try {
    const createClient = await getCreateClient();
    if (!createClient) {
      console.warn("[GitHub Data] Redis client not available on client-side");
      return null;
    }

    const redis = createClient({
      url: redisUrl,
      socket: {
        connectTimeout: 5000,
      },
    });

    await redis.connect();
    return redis;
  } catch (error) {
    console.error("[GitHub Data] Redis connection failed:", error);
    return null;
  }
}

// ============================================================================
// FALLBACK DATA
// ============================================================================

/**
 * Generate realistic fallback data for development/demo purposes (DEV ONLY)
 *
 * ⚠️  WARNING: This generates SAMPLE data and should only be used when Redis
 * is unavailable in development/testing environments.
 *
 * Do NOT rely on this fallback in production - it will show fake GitHub data.
 */
function generateFallbackData(): ContributionResponse {
  const nodeEnv = process.env.NODE_ENV || "development";
  const isProduction =
    nodeEnv === "production" || process.env.VERCEL_ENV === "production";

  // PRODUCTION WARNING
  if (isProduction) {
    console.error("[GitHub Data] ❌ CRITICAL: Fallback data in production!");
    console.error(
      "[GitHub Data]    This means Redis is unavailable in production."
    );
    console.error(
      "[GitHub Data]    Showing fake contribution data is NOT acceptable."
    );
    console.error(
      "[GitHub Data]    Please restore Redis connection immediately."
    );
  }

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
      date: date.toISOString().split("T")[0],
      count,
    });
  }

  return {
    contributions,
    source: "fallback-data",
    totalContributions,
    totalRepositories: 42,
    lastUpdated: new Date().toISOString(),
    warning: isProduction
      ? "❌ CRITICAL: Showing demo data in production (Redis unavailable)"
      : "Using demo data - GitHub API temporarily unavailable (DEV MODE)",
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
  username: string = "dcyfr"
): Promise<ContributionResponse> {
  // Only support the configured username for security
  if (username !== "dcyfr") {
    console.warn(
      `[GitHub Data] Username ${username} not supported, using fallback`
    );
    return generateFallbackData();
  }

  try {
    // Try to get data from Redis cache
    const redis = await getRedisClient();

    if (!redis) {
      console.warn("[GitHub Data] Redis not available, using fallback data");
      return generateFallbackData();
    }

    try {
      // First try the main cache
      const cached = await redis.get(CACHE_KEY);

      if (cached) {
        const data = JSON.parse(cached) as ContributionResponse;
        console.warn("[GitHub Data] ✅ Loaded from cache:", {
          totalContributions: data.totalContributions,
          lastUpdated: data.lastUpdated,
          source: data.source,
        });

        await redis.quit();
        return data;
      }

      // Try fallback cache if main cache is empty
      const fallbackCached = await redis.get(FALLBACK_DATA_KEY);

      if (fallbackCached) {
        const data = JSON.parse(fallbackCached) as ContributionResponse;
        data.warning = "Using cached data - GitHub API temporarily unavailable";
        console.warn("[GitHub Data] ⚠️ Using fallback cache");

        await redis.quit();
        return data;
      }

      await redis.quit();
    } catch (redisError) {
      console.error("[GitHub Data] Redis read error:", redisError);
      if (redis) {
        await redis.quit().catch(() => {
          /* ignore cleanup errors */
        });
      }
    }
  } catch (error) {
    console.error("[GitHub Data] Cache access failed:", error);
  }

  // If all cache attempts fail, return fallback data
  console.warn("[GitHub Data] All cache attempts failed, using fallback data");
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
    const redis = await getRedisClient();

    if (!redis) {
      return { cacheAvailable: false, dataFresh: false };
    }

    try {
      const cached = await redis.get(CACHE_KEY);

      if (!cached) {
        await redis.quit();
        return { cacheAvailable: true, dataFresh: false };
      }

      const data = JSON.parse(cached) as ContributionResponse;
      const lastUpdated = new Date(data.lastUpdated);
      const isRecent = Date.now() - lastUpdated.getTime() < 2 * 60 * 60 * 1000; // 2 hours

      await redis.quit();

      return {
        cacheAvailable: true,
        dataFresh: isRecent,
        lastUpdated: data.lastUpdated,
        totalContributions: data.totalContributions,
      };
    } catch (redisError) {
      await redis.quit().catch(() => {
        /* ignore cleanup errors */
      });
      return { cacheAvailable: true, dataFresh: false };
    }
  } catch (error) {
    return { cacheAvailable: false, dataFresh: false };
  }
}
