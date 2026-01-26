import { NextResponse } from 'next/server';
import { redis, getRedisEnvironment } from '@/mcp/shared/redis-client';

/**
 * Redis Health Check Endpoint
 *
 * Tests Redis connectivity and environment detection
 * Returns environment info and connection status
 *
 * Usage:
 *   Production: https://www.dcyfr.ai/api/health/redis
 *   Preview: https://dcyfr-labs-git-feature-*.vercel.app/api/health/redis
 *   Local: http://localhost:3000/api/health/redis
 */
export async function GET() {
  const environment = getRedisEnvironment();

  try {
    // Test Redis connection with unique key
    const testKey = `health:check:${Date.now()}`;
    await redis.set(testKey, 'ok', { ex: 10 });
    const value = await redis.get(testKey);
    await redis.del(testKey);

    return NextResponse.json({
      status: 'ok',
      environment,
      timestamp: new Date().toISOString(),
      test: value === 'ok' ? 'passed' : 'failed',
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        environment,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
