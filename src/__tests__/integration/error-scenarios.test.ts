import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Use vi.hoisted() to ensure mocks are properly initialized before module imports
const mocks = vi.hoisted(() => ({
  redisGet: vi.fn().mockResolvedValue(null),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  addBreadcrumb: vi.fn(),
  blockExternalAccess: vi.fn(() => null),
  rateLimit: vi.fn(),
  getClientIp: vi.fn(() => '192.168.1.1'),
  createRateLimitHeaders: vi.fn((result) => ({
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  })),
  getMultiplePostViews: vi.fn(),
  getMultiplePostViews24h: vi.fn(),
  getMultiplePostViewsInRange: vi.fn(),
  getPostSharesBulk: vi.fn(),
  getPostShares24hBulk: vi.fn(),
  getPostCommentsBulk: vi.fn(),
  getPostComments24hBulk: vi.fn(),
}));

// Mock Upstash redis singleton
vi.mock('@/lib/redis-client', () => ({
  redis: {
    get: mocks.redisGet,
  },
}));

// Mock Sentry
vi.mock('@sentry/nextjs', () => ({
  captureException: mocks.captureException,
  captureMessage: mocks.captureMessage,
  addBreadcrumb: mocks.addBreadcrumb,
}));

// Prepare mocks
vi.mock('@/lib/api/api-security', () => ({
  blockExternalAccess: mocks.blockExternalAccess,
}));

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: mocks.rateLimit,
  getClientIp: mocks.getClientIp,
  createRateLimitHeaders: mocks.createRateLimitHeaders,
}));

vi.mock('@/lib/views.server', () => ({
  getMultiplePostViews: mocks.getMultiplePostViews,
  getMultiplePostViews24h: mocks.getMultiplePostViews24h,
  getMultiplePostViewsInRange: mocks.getMultiplePostViewsInRange,
}));

vi.mock('@/lib/shares', () => ({
  getPostSharesBulk: mocks.getPostSharesBulk,
  getPostShares24hBulk: mocks.getPostShares24hBulk,
}));

vi.mock('@/lib/comments', () => ({
  getPostCommentsBulk: mocks.getPostCommentsBulk,
  getPostComments24hBulk: mocks.getPostComments24hBulk,
}));

// Import after mocks are set up
import { GET as analyticsGET } from '@/app/api/analytics/route';
import {
  getMultiplePostViews,
  getMultiplePostViews24h,
  getMultiplePostViewsInRange,
} from '@/lib/views.server';
import { getPostSharesBulk, getPostShares24hBulk } from '@/lib/shares';
import { getPostCommentsBulk, getPostComments24hBulk } from '@/lib/comments';
import { rateLimit } from '@/lib/rate-limit';
import { blockExternalAccess } from '@/lib/api/api-security';
import { posts } from '@/data/posts';

describe('Error Scenario Integration Tests', () => {
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

    // Default behavior: return zero maps
    mocks.getMultiplePostViews.mockResolvedValue(new Map());
    mocks.getMultiplePostViews24h.mockResolvedValue(new Map());
    mocks.getMultiplePostViewsInRange.mockResolvedValue(new Map());
    mocks.getPostSharesBulk.mockResolvedValue({});
    mocks.getPostShares24hBulk.mockResolvedValue({});
    mocks.getPostCommentsBulk.mockResolvedValue({});
    mocks.getPostComments24hBulk.mockResolvedValue({});

    // Default: rate limit allows requests
    mocks.rateLimit.mockResolvedValue({
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

    // Make redis.get throw to simulate Redis failure
    const { redis } = await import('@/lib/redis-client');
    vi.mocked(redis.get).mockRejectedValue(new Error('Redis get failed'));

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
    mocks.getMultiplePostViews.mockRejectedValue(new Error('Views DB error'));

    const request = new NextRequest('http://localhost:3000/api/analytics', {
      headers: { Authorization: 'Bearer test-key' },
    });

    const response = await analyticsGET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to fetch analytics');
  });
});
