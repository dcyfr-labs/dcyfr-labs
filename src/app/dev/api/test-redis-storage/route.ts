/**
 * Test Redis storage functionality
 */
import { NextResponse } from 'next/server';
import { assertDevOr404 } from '@/lib/dev-only';
import { redis } from '@/mcp/shared/redis-client';

export async function GET() {
  // Defense-in-depth: explicit environment check for Vercel Fluid Compute optimization
  assertDevOr404();
  const result: {
    redisConfigured: boolean;
    setWorks: boolean;
    getWorks: boolean;
    errorMsg?: string;
  } = {
    redisConfigured: true, // Upstash REST client is always configured
    setWorks: false,
    getWorks: false,
  };

  try {
    // Test SET
    const testKey = `test-${Date.now()}`;
    const testData = { message: 'test', timestamp: new Date().toISOString() };
    console.warn('[Test] Attempting set with key:', testKey);

    await redis.set(testKey, JSON.stringify(testData));
    result.setWorks = true;
    console.warn('[Test] Set successful');

    // Test GET
    console.warn('[Test] Attempting get...');
    const getValue = await redis.get(testKey);
    result.getWorks = getValue !== null && typeof getValue === 'string';
    console.warn('[Test] Get result:', getValue);

    // Cleanup
    await redis.del(testKey);
    console.warn('[Test] Cleanup complete');
  } catch (err) {
    result.errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[Test] Error:', result.errorMsg);
  }

  return NextResponse.json(result);
}
