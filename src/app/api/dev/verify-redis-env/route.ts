import { NextResponse } from 'next/server';
import { redis, getRedisEnvironment, getRedisKeyPrefix } from '@/mcp/shared/redis-client';

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

function resolveUsingRedis(
  environment: string,
  hasProductionUrl: boolean,
  hasProductionToken: boolean,
  hasPreviewUrl: boolean,
  hasPreviewToken: boolean
): string {
  if (environment === 'production') {
    return hasProductionUrl && hasProductionToken ? 'production' : 'none';
  }
  if (hasPreviewUrl && hasPreviewToken) return 'preview';
  if (hasProductionUrl && hasProductionToken) return 'production (fallback)';
  return 'none';
}

async function checkRedisConnection(): Promise<{ connected: boolean; error: string | null }> {
  try {
    await redis.ping();
    return { connected: true, error: null };
  } catch (error) {
    return { connected: false, error: error instanceof Error ? error.message : String(error) };
  }
}

async function readGithubCache(cacheKey: string): Promise<{ status: string; data: object | null }> {
  try {
    const cached = await redis.get(cacheKey);
    if (cached && typeof cached === 'string') {
      const data = JSON.parse(cached) as {
        totalContributions?: number;
        lastUpdated?: string;
        source?: string;
      };
      return {
        status: 'found',
        data: {
          totalContributions: data.totalContributions,
          lastUpdated: data.lastUpdated,
          source: data.source,
        },
      };
    }
    return { status: `not-found (type: ${typeof cached})`, data: null };
  } catch (error) {
    return {
      status: `error: ${error instanceof Error ? error.message : String(error)}`,
      data: null,
    };
  }
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

/**
 * Verify Redis environment configuration
 *
 * Shows what Redis the app is connecting to and what key prefixes it's using
 *
 * Development-only endpoint. Blocked in preview/production by middleware and
 * by this explicit handler guard (defense-in-depth).
 */
export async function GET() {
  // Only available in local development — exposes Redis credentials metadata
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Only available in development' }, { status: 403 });
  }

  const environment = getRedisEnvironment();
  const keyPrefix = getRedisKeyPrefix();

  // Check which Redis URLs are configured
  const hasProductionUrl = !!process.env.UPSTASH_REDIS_REST_URL;
  const hasProductionToken = !!process.env.UPSTASH_REDIS_REST_TOKEN;
  const hasPreviewUrl = !!process.env.UPSTASH_REDIS_REST_URL_PREVIEW;
  const hasPreviewToken = !!process.env.UPSTASH_REDIS_REST_TOKEN_PREVIEW;

  const usingRedis = resolveUsingRedis(
    environment,
    hasProductionUrl,
    hasProductionToken,
    hasPreviewUrl,
    hasPreviewToken
  );

  const { connected: redisConnected, error: redisError } = await checkRedisConnection();

  const cacheKey = 'github:contributions:dcyfr';
  const { status: cacheStatus, data: cacheData } = redisConnected
    ? await readGithubCache(cacheKey)
    : { status: 'not-checked', data: null };

  const isDevelopment = process.env.NODE_ENV === 'development';
  const needsCachePopulation = redisConnected && cacheStatus.includes('not-found');

  const response: Record<string, unknown> = {
    environment: {
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      detectedEnv: environment,
    },
    redis: {
      connected: redisConnected,
      error: redisError,
      using: usingRedis,
      keyPrefix,
      credentials: {
        production: {
          url: hasProductionUrl ? 'configured' : 'missing',
          token: hasProductionToken ? 'configured' : 'missing',
        },
        preview: {
          url: hasPreviewUrl ? 'configured' : 'missing',
          token: hasPreviewToken ? 'configured' : 'missing',
        },
      },
    },
    cache: {
      key: `${keyPrefix}${cacheKey}`,
      status: cacheStatus,
      data: cacheData,
    },
    vercel: {
      deploymentId: process.env.VERCEL_DEPLOYMENT_ID || 'not set',
      region: process.env.VERCEL_REGION || 'not set',
      url: process.env.VERCEL_URL || 'not set',
    },
  };

  if (isDevelopment && needsCachePopulation) {
    response.actions = {
      populateCache: {
        message: '⚠️ Cache is empty. Click the link below to populate it:',
        endpoint: '/api/dev/populate-cache',
        description: 'Populates GitHub and Credly data in preview database',
      },
      alternativeEndpoints: {
        githubOnly: '/api/dev/refresh-github',
        credlyOnly: '/api/dev/refresh-credly',
      },
    };
  }

  return NextResponse.json(response);
}
