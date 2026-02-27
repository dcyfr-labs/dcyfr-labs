import { NextRequest, NextResponse } from 'next/server';
import { redis, getRedisEnvironment } from '@/lib/redis-client';
import { blockExternalAccess } from '@/lib/api/api-security';

/**
 * Redis Health Check Endpoint
 *
 * Tests Redis connectivity and environment detection
 * Returns environment info and connection status
 *
 * Security: Internal-only access (Vercel cron, monitoring)
 *
 * Usage:
 *   Production: https://www.dcyfr.ai/api/health/redis (internal only)
 *   Preview: https://dcyfr-labs-git-feature-*.vercel.app/api/health/redis (internal only)
 *   Local: http://localhost:3000/api/health/redis
 */
export async function GET(request: NextRequest) {
  // Block external access - internal monitoring only
  const blockResponse = blockExternalAccess(request);
  if (blockResponse) return blockResponse;
  const environment = getRedisEnvironment();

  // Environment diagnostics for debugging Redis issues
  const diagnostics = {
    environment,
    timestamp: new Date().toISOString(),
    redis_config: {
      upstash_url_configured: !!process.env.UPSTASH_REDIS_REST_URL,
      upstash_token_configured: !!process.env.UPSTASH_REDIS_REST_TOKEN,
      upstash_preview_url_configured: !!process.env.UPSTASH_REDIS_REST_URL_PREVIEW,
      upstash_preview_token_configured: !!process.env.UPSTASH_REDIS_REST_TOKEN_PREVIEW,
      // Security check: detect problematic legacy variables
      legacy_redis_url_present: !!process.env.REDIS_URL,
      legacy_preview_redis_url_present: !!process.env.PREVIEW_REDIS_URL,
    },
  };

  try {
    // Test Redis connection with unique key and timeout protection
    const testKey = `health:check:${Date.now()}`;

    await Promise.race([
      (async () => {
        await redis.set(testKey, 'ok', { EX: 10 });
        const value = await redis.get(testKey);
        await redis.del(testKey);

        if (value !== 'ok') {
          throw new Error(`Test value mismatch: expected 'ok', got '${value}'`);
        }
      })(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Health check timeout after 8 seconds')), 8000)
      ),
    ]);

    return NextResponse.json({
      status: 'healthy',
      ...diagnostics,
      test_result: 'passed',
      message:
        diagnostics.redis_config.legacy_redis_url_present ||
        diagnostics.redis_config.legacy_preview_redis_url_present
          ? '⚠️ WARNING: Legacy Redis variables detected. Remove REDIS_URL and PREVIEW_REDIS_URL to prevent DNS errors.'
          : '✅ Redis connection working properly',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        status: 'unhealthy',
        ...diagnostics,
        test_result: 'failed',
        error: errorMessage,
        troubleshooting: {
          common_issues: [
            'Legacy REDIS_URL or PREVIEW_REDIS_URL environment variables pointing to old Redis Cloud',
            'Missing Upstash credentials (UPSTASH_REDIS_REST_URL/TOKEN)',
            'Network connectivity issues to Upstash servers',
            'Invalid Upstash REST API credentials',
          ],
          next_steps: [
            'Check Vercel environment variables for legacy Redis URLs',
            'Verify Upstash credentials in Vercel dashboard',
            'Test individual Redis operations in Inngest dashboard',
          ],
        },
      },
      { status: 503 }
    );
  }
}
