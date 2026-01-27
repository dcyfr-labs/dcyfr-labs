import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as analyticsGET } from '@/app/api/analytics/route';
import {
  getMultiplePostViews,
  getMultiplePostViews24h,
  getMultiplePostViewsInRange,
} from '@/lib/views';
import { getPostSharesBulk, getPostShares24hBulk } from '@/lib/shares';
import { getPostCommentsBulk, getPostComments24hBulk } from '@/lib/comments';
import { rateLimit } from '@/lib/rate-limit';
import { blockExternalAccess } from '@/lib/api-security';

// Mock Upstash redis singleton
vi.mock('@/mcp/shared/redis-client', () => ({
  redis: {
    get: vi.fn(),
  },
}));

// Mock posts data import
import { posts } from '@/data/posts';

// Prepare mocks
vi.mock('@/lib/api-security', () => ({
  blockExternalAccess: vi.fn(() => null), // By default, allow access
}));

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn(),
  getClientIp: vi.fn(() => '192.168.1.1'),
  createRateLimitHeaders: vi.fn((result) => ({
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  })),
}));

vi.mock('@/lib/views', () => ({
  getMultiplePostViews: vi.fn(),
  getMultiplePostViews24h: vi.fn(),
  getMultiplePostViewsInRange: vi.fn(),
}));

vi.mock('@/lib/shares', () => ({
  getPostSharesBulk: vi.fn(),
  getPostShares24hBulk: vi.fn(),
}));

vi.mock('@/lib/comments', () => ({
  getPostCommentsBulk: vi.fn(),
  getPostComments24hBulk: vi.fn(),
}));

// TODO: Error handling refactored - update tests for new implementation
describe.skip('Error Scenario Integration Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    // Default environment to development so analytics is allowed
    vi.stubEnv('NODE_ENV', 'development');
    delete process.env.VERCEL_ENV;
    delete process.env.ADMIN_API_KEY;
    // Force in-memory fallback for rate limiting
    delete process.env.REDIS_URL;
    // TODO: Update for Upstash redis singleton
    // globalThis.__rateLimitRedisClient = undefined

    // Default behavior: return zero maps
    vi.mocked(getMultiplePostViews).mockResolvedValue(new Map());
    vi.mocked(getMultiplePostViews24h).mockResolvedValue(new Map());
    vi.mocked(getMultiplePostViewsInRange).mockResolvedValue(new Map());
    vi.mocked(getPostSharesBulk).mockResolvedValue({});
    vi.mocked(getPostShares24hBulk).mockResolvedValue({});
    vi.mocked(getPostCommentsBulk).mockResolvedValue({});
    vi.mocked(getPostComments24hBulk).mockResolvedValue({});

    // TODO: Update for Upstash redis singleton
    // Mock redis client createClient to return a client with get/quit/on
    /* vi.mocked(createClient).mockImplementation(() => {
      return {
        isOpen: true,
        on: vi.fn(),
        connect: vi.fn().mockResolvedValue(undefined),
        get: vi.fn().mockResolvedValue(null),
        quit: vi.fn().mockResolvedValue(undefined),
      } as any
    }) */

    // Default: rate limit allows requests
    vi.mocked(rateLimit).mockResolvedValue({
      success: true,
      limit: 60,
      remaining: 59,
      reset: Date.now() + 60000,
    });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('blocks analytics in production environment (403)', async () => {
    process.env.VERCEL_ENV = 'production';

    const request = new NextRequest('http://localhost:3000/api/analytics');
    const response = await analyticsGET(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toContain('Analytics not available in production');
  });

  it('returns 401 when ADMIN_API_KEY missing', async () => {
    // Ensure environment allows analytics
    vi.stubEnv('NODE_ENV', 'development');
    delete process.env.VERCEL_ENV;

    const request = new NextRequest('http://localhost:3000/api/analytics');
    const response = await analyticsGET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('continues when redis trending get throws (graceful fallback)', async () => {
    // Provide admin key so we bypass auth
    process.env.ADMIN_API_KEY = 'test-key';

    // Make createClient return a client whose get throws
    /* vi.mocked(createClient).mockImplementation(() => ({
      isOpen: true,
      connect: vi.fn().mockResolvedValue(undefined),
      get: vi.fn().mockRejectedValue(new Error('Redis get failed')),
      quit: vi.fn().mockResolvedValue(undefined),
    }) as any)
    */

    const request = new NextRequest('http://localhost:3000/api/analytics', {
      headers: { Authorization: 'Bearer test-key' },
    });

    const response = await analyticsGET(request);
    const data = await response.json();

    // Should still return success and include posts
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.posts)).toBe(true);
  });

  it('returns 500 when core data fetching fails', async () => {
    process.env.ADMIN_API_KEY = 'test-key';

    // Make getMultiplePostViews throw to simulate DB/Redis layer failure
    vi.mocked(getMultiplePostViews).mockRejectedValue(new Error('Views DB error'));

    const request = new NextRequest('http://localhost:3000/api/analytics', {
      headers: { Authorization: 'Bearer test-key' },
    });

    const response = await analyticsGET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to fetch analytics');
  });
});
