/**
 * Dev Tools - Redis Health Check Endpoint
 *
 * Tests Redis connectivity and configuration.
 * Only accessible in development mode (protected by proxy.ts).
 */

import { NextResponse } from 'next/server';
import { assertDevOr404 } from '@/lib/dev-only';
import { redis } from '@/lib/redis';

export async function GET() {
  // Defense-in-depth: explicit environment check for Vercel Fluid Compute optimization
  assertDevOr404();
  try {
    const start = Date.now();
    const testKey = `health-check:${Date.now()}`;

    // Test Upstash REST API with set/get/del
    await redis.set(testKey, 'test', { ex: 10 });
    const value = await redis.get(testKey);
    await redis.del(testKey);
    const latency = Date.now() - start;

    const isConnected = value === 'test';

    return NextResponse.json(
      {
        enabled: true,
        configured: true,
        connected: isConnected,
        message: isConnected ? 'Redis health check passed' : 'Redis health check failed',
        testResult: {
          success: isConnected,
          latency,
        },
        timestamp: new Date().toISOString(),
      },
      {
        status: isConnected ? 200 : 503,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        enabled: false,
        configured: false,
        connected: false,
        message: 'Failed to check Redis status',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  }
}
