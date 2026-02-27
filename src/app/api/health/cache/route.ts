/**
 * Cache Health Check Endpoint
 *
 * Verifies that all critical cache keys are populated in Redis.
 * Use for monitoring and alerting on cache state.
 *
 * Security: Internal-only access (Vercel cron, monitoring)
 *
 * Usage:
 *   curl https://www.dcyfr.ai/api/health/cache (internal only)
 *
 * Returns:
 *   200 OK - All caches populated
 *   503 Service Unavailable - One or more caches missing
 */

import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis-client';
import { blockExternalAccess } from '@/lib/api/api-security';

export async function GET(request: NextRequest) {
  // Block external access - internal monitoring only
  const blockResponse = blockExternalAccess(request);
  if (blockResponse) return blockResponse;
  try {
    // Define all critical cache keys (base keys - Proxy adds prefix)
    const checks = {
      credly: {
        all: 'credly:badges:dcyfr:all',
        limit10: 'credly:badges:dcyfr:10',
        limit3: 'credly:badges:dcyfr:3',
      },
      github: 'github:contributions:dcyfr',
    };

    const results: Record<string, any> = {};
    let totalChecks = 0;
    let passedChecks = 0;

    // Check Credly cache variants
    for (const [variant, key] of Object.entries(checks.credly)) {
      totalChecks++;
      const exists = await redis.exists(key);
      const cached = exists === 1;

      if (cached) passedChecks++;

      results[`credly_${variant}`] = {
        cached,
        key,
        status: cached ? 'OK' : 'MISSING',
      };
    }

    // Check GitHub cache
    totalChecks++;
    const githubExists = await redis.exists(checks.github);
    const githubCached = githubExists === 1;

    if (githubCached) passedChecks++;

    results.github = {
      cached: githubCached,
      key: checks.github,
      status: githubCached ? 'OK' : 'MISSING',
    };

    const allHealthy = passedChecks === totalChecks;

    return NextResponse.json(
      {
        healthy: allHealthy,
        summary: `${passedChecks}/${totalChecks} cache keys populated`,
        checks: results,
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          VERCEL_ENV: process.env.VERCEL_ENV,
          note: 'Keys auto-prefixed by Redis Proxy',
        },
        timestamp: new Date().toISOString(),
      },
      {
        status: allHealthy ? 200 : 503,
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('[Cache Health] Check failed:', error);

    return NextResponse.json(
      {
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
        },
      }
    );
  }
}
