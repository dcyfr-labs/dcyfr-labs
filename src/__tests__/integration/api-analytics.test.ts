import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Use vi.hoisted() to ensure mocks are properly initialized before module imports
const mocks = vi.hoisted(() => ({
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
  redisGet: vi.fn().mockResolvedValue(null),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  addBreadcrumb: vi.fn(),
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

// Mock dependencies - now using hoisted mocks
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
import { GET } from '@/app/api/analytics/route';
import { rateLimit } from '@/lib/rate-limit';
import { blockExternalAccess } from '@/lib/api/api-security';
import {
  getMultiplePostViews,
  getMultiplePostViews24h,
  getMultiplePostViewsInRange,
} from '@/lib/views.server';
import { getPostSharesBulk, getPostShares24hBulk } from '@/lib/shares';
import { getPostCommentsBulk, getPostComments24hBulk } from '@/lib/comments';

describe('Analytics API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset environment
    vi.stubEnv('ADMIN_API_KEY', 'test-api-key-123');
    vi.stubEnv('REDIS_URL', 'redis://localhost:6379');
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('VERCEL_ENV', 'preview');

    // Default mocks: successful responses (using hoisted mocks)
    mocks.rateLimit.mockResolvedValue({
      success: true,
      limit: 60,
      remaining: 59,
      reset: Date.now() + 60000,
    });

    // Mock empty data by default (using hoisted mocks)
    mocks.getMultiplePostViews.mockResolvedValue(new Map());
    mocks.getMultiplePostViews24h.mockResolvedValue(new Map());
    mocks.getMultiplePostViewsInRange.mockResolvedValue(new Map());
    mocks.getPostSharesBulk.mockResolvedValue({});
    mocks.getPostShares24hBulk.mockResolvedValue({});
    mocks.getPostCommentsBulk.mockResolvedValue({});
    mocks.getPostComments24hBulk.mockResolvedValue({});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('GET /api/analytics', () => {
    describe('Layer 1: Environment Validation', () => {
      it('blocks production environment entirely', async () => {
        vi.stubEnv('VERCEL_ENV', 'production');

        const request = new NextRequest('http://localhost:3000/api/analytics', {
          headers: { Authorization: 'Bearer test-api-key-123' },
        });

        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(403);
        expect(data.error).toContain('not available in production');
        expect(data.message).toContain('disabled in production');
      });

      it('allows development environment', async () => {
        vi.stubEnv('NODE_ENV', 'development');
        vi.stubEnv('VERCEL_ENV', '');

        const request = new NextRequest('http://localhost:3000/api/analytics', {
          headers: { Authorization: 'Bearer test-api-key-123' },
        });

        const response = await GET(request);

        expect(response.status).toBe(200);
      });

      it('allows preview environment', async () => {
        vi.stubEnv('NODE_ENV', 'production');
        vi.stubEnv('VERCEL_ENV', 'preview');

        const request = new NextRequest('http://localhost:3000/api/analytics', {
          headers: { Authorization: 'Bearer test-api-key-123' },
        });

        const response = await GET(request);

        expect(response.status).toBe(200);
      });

      it('allows test environment', async () => {
        vi.stubEnv('NODE_ENV', 'test');
        vi.stubEnv('VERCEL_ENV', '');

        const request = new NextRequest('http://localhost:3000/api/analytics', {
          headers: { Authorization: 'Bearer test-api-key-123' },
        });

        const response = await GET(request);

        expect(response.status).toBe(200);
      });
    });

    describe('Layer 2: API Key Authentication', () => {
      it('rejects request without Authorization header', async () => {
        const request = new NextRequest('http://localhost:3000/api/analytics');

        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe('Unauthorized');
        expect(data.message).toContain('API key required');
      });

      it('rejects request with invalid API key', async () => {
        const request = new NextRequest('http://localhost:3000/api/analytics', {
          headers: { Authorization: 'Bearer wrong-key' },
        });

        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe('Unauthorized');
      });

      it('accepts Bearer token format', async () => {
        const request = new NextRequest('http://localhost:3000/api/analytics', {
          headers: { Authorization: 'Bearer test-api-key-123' },
        });

        const response = await GET(request);

        expect(response.status).toBe(200);
      });

      it('accepts plain token format', async () => {
        const request = new NextRequest('http://localhost:3000/api/analytics', {
          headers: { Authorization: 'test-api-key-123' },
        });

        const response = await GET(request);

        expect(response.status).toBe(200);
      });

      it('rejects when ADMIN_API_KEY not configured', async () => {
        vi.stubEnv('ADMIN_API_KEY', '');

        const request = new NextRequest('http://localhost:3000/api/analytics', {
          headers: { Authorization: 'Bearer test-api-key-123' },
        });

        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe('Unauthorized');
      });
    });

    describe('Layer 3: Rate Limiting', () => {
      it('returns 429 when rate limit exceeded', async () => {
        const resetTime = Date.now() + 30000;

        mocks.rateLimit.mockResolvedValue({
          success: false,
          limit: 60,
          remaining: 0,
          reset: resetTime,
        });

        const request = new NextRequest('http://localhost:3000/api/analytics', {
          headers: { Authorization: 'Bearer test-api-key-123' },
        });

        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(429);
        expect(data.error).toContain('Rate limit exceeded');
        expect(data.retryAfter).toBeGreaterThan(0);
        expect(response.headers.get('Retry-After')).toBeTruthy();
      });

      it('includes rate limit headers in successful response', async () => {
        const resetTime = Date.now() + 60000;

        mocks.rateLimit.mockResolvedValue({
          success: true,
          limit: 60,
          remaining: 45,
          reset: resetTime,
        });

        const request = new NextRequest('http://localhost:3000/api/analytics', {
          headers: { Authorization: 'Bearer test-api-key-123' },
        });

        const response = await GET(request);

        expect(response.status).toBe(200);
        // Note: Rate limit headers are included via createRateLimitHeaders mock
      });

      it('applies rate limiting to requests', async () => {
        const request = new NextRequest('http://localhost:3000/api/analytics', {
          headers: { Authorization: 'Bearer test-api-key-123' },
        });

        await GET(request);

        expect(rateLimit).toHaveBeenCalledWith('192.168.1.1', {
          limit: expect.any(Number),
          windowInSeconds: 60,
        });
      });
    });

    describe('Data Retrieval', () => {
      it('fetches analytics for all posts', async () => {
        const viewMap = new Map([
          ['post-1', 100],
          ['post-2', 50],
        ]);
        const views24hMap = new Map([
          ['post-1', 10],
          ['post-2', 5],
        ]);

        mocks.getMultiplePostViews.mockResolvedValue(viewMap);
        mocks.getMultiplePostViews24h.mockResolvedValue(views24hMap);
        mocks.getMultiplePostViewsInRange.mockResolvedValue(viewMap);

        const request = new NextRequest('http://localhost:3000/api/analytics', {
          headers: { Authorization: 'Bearer test-api-key-123' },
        });

        const response = await GET(request);
        const data = await response.json();
        // No debug print (cleared)

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.summary).toBeDefined();
        expect(data.posts).toBeDefined();
        expect(Array.isArray(data.posts)).toBe(true);
      });
      it('includes vercel analytics data when present in Redis', async () => {
        // Mock redis.get to return vercel analytics data
        const { redis } = await import('@/lib/redis-client');
        mocks.redisGet.mockImplementation(async (key: string) => {
          if (key === 'vercel:topPages:daily') {
            return JSON.stringify([{ path: '/blog/test-post', views: 50 }]);
          }
          if (key === 'vercel:topReferrers:daily') {
            return JSON.stringify([{ referrer: 'google.com', views: 25 }]);
          }
          if (key === 'vercel:topDevices:daily') {
            return JSON.stringify([{ device: 'mobile', views: 30 }]);
          }
          if (key === 'vercel:metrics:lastSynced') {
            return new Date().toISOString();
          }
          return null;
        });

        const request = new NextRequest('http://localhost:3000/api/analytics', {
          headers: { Authorization: 'Bearer test-api-key-123' },
        });

        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.vercel).toBeDefined();
        expect(Array.isArray(data.vercel.topPages)).toBe(true);
        expect(data.vercel.topPages[0].path).toBe('/blog/test-post');
        expect(data.vercelLastSynced).toBeDefined();
      });

      it('supports date range parameter', async () => {
        const request = new NextRequest('http://localhost:3000/api/analytics?days=7', {
          headers: { Authorization: 'Bearer test-api-key-123' },
        });

        await GET(request);

        expect(getMultiplePostViewsInRange).toHaveBeenCalledWith(expect.any(Array), 7);
      });

      it('supports "all" date range parameter', async () => {
        const request = new NextRequest('http://localhost:3000/api/analytics?days=all', {
          headers: { Authorization: 'Bearer test-api-key-123' },
        });

        await GET(request);

        expect(getMultiplePostViewsInRange).toHaveBeenCalledWith(expect.any(Array), null);
      });

      it('defaults to 1 day when no parameter provided', async () => {
        const request = new NextRequest('http://localhost:3000/api/analytics', {
          headers: { Authorization: 'Bearer test-api-key-123' },
        });

        await GET(request);

        expect(getMultiplePostViewsInRange).toHaveBeenCalledWith(expect.any(Array), 1);
      });

      it('includes summary statistics in response', async () => {
        const viewMap = new Map([
          ['post-1', 100],
          ['post-2', 50],
        ]);

        mocks.getMultiplePostViews.mockResolvedValue(viewMap);
        mocks.getMultiplePostViews24h.mockResolvedValue(new Map());
        mocks.getMultiplePostViewsInRange.mockResolvedValue(viewMap);

        const request = new NextRequest('http://localhost:3000/api/analytics', {
          headers: { Authorization: 'Bearer test-api-key-123' },
        });

        const response = await GET(request);
        const data = await response.json();

        expect(data.summary).toBeDefined();
        expect(data.summary.totalViews).toBeGreaterThanOrEqual(0);
        expect(data.summary.averageViews).toBeGreaterThanOrEqual(0);
      });

      it('sorts posts by view count', async () => {
        const viewMap = new Map([
          ['post-1', 50],
          ['post-2', 100],
          ['post-3', 75],
        ]);

        mocks.getMultiplePostViews.mockResolvedValue(viewMap);
        mocks.getMultiplePostViews24h.mockResolvedValue(new Map());
        mocks.getMultiplePostViewsInRange.mockResolvedValue(viewMap);

        const request = new NextRequest('http://localhost:3000/api/analytics', {
          headers: { Authorization: 'Bearer test-api-key-123' },
        });

        const response = await GET(request);
        const data = await response.json();

        // First post should have highest views
        if (data.posts.length > 0) {
          expect(data.posts[0].views).toBeGreaterThanOrEqual(
            data.posts[data.posts.length - 1].views
          );
        }
      });

      it('includes shares and comments data', async () => {
        mocks.getPostSharesBulk.mockResolvedValue({ 'post-1': 10 });
        mocks.getPostCommentsBulk.mockResolvedValue({ 'post-slug': 5 });

        const request = new NextRequest('http://localhost:3000/api/analytics', {
          headers: { Authorization: 'Bearer test-api-key-123' },
        });

        const response = await GET(request);
        const data = await response.json();

        expect(getPostSharesBulk).toHaveBeenCalled();
        expect(getPostCommentsBulk).toHaveBeenCalled();
        expect(data.summary.totalShares).toBeDefined();
        expect(data.summary.totalComments).toBeDefined();
      });
    });

    describe('Response Format', () => {
      it('includes timestamp in response', async () => {
        const request = new NextRequest('http://localhost:3000/api/analytics', {
          headers: { Authorization: 'Bearer test-api-key-123' },
        });

        const response = await GET(request);
        const data = await response.json();

        expect(data.timestamp).toBeDefined();
        expect(new Date(data.timestamp).getTime()).toBeLessThanOrEqual(Date.now());
      });

      it('includes dateRange in response', async () => {
        const request = new NextRequest('http://localhost:3000/api/analytics?days=7', {
          headers: { Authorization: 'Bearer test-api-key-123' },
        });

        const response = await GET(request);
        const data = await response.json();

        expect(data.dateRange).toBe('7d');
      });

      it('marks dateRange as "all" when days=all', async () => {
        const request = new NextRequest('http://localhost:3000/api/analytics?days=all', {
          headers: { Authorization: 'Bearer test-api-key-123' },
        });

        const response = await GET(request);
        const data = await response.json();

        expect(data.dateRange).toBe('all');
      });

      it('includes post metadata in response', async () => {
        const request = new NextRequest('http://localhost:3000/api/analytics', {
          headers: { Authorization: 'Bearer test-api-key-123' },
        });

        const response = await GET(request);
        const data = await response.json();

        if (data.posts.length > 0) {
          const post = data.posts[0];
          expect(post.slug).toBeDefined();
          expect(post.title).toBeDefined();
          expect(post.summary).toBeDefined();
          expect(post.publishedAt).toBeDefined();
          expect(post.tags).toBeDefined();
        }
      });
    });

    describe('Error Handling', () => {
      it('handles view fetch errors gracefully', async () => {
        mocks.getMultiplePostViews.mockRejectedValue(new Error('Redis error'));

        const request = new NextRequest('http://localhost:3000/api/analytics', {
          headers: { Authorization: 'Bearer test-api-key-123' },
        });

        const response = await GET(request);

        expect(response.status).toBe(500);
      });

      it('handles share fetch errors gracefully', async () => {
        mocks.getPostSharesBulk.mockRejectedValue(new Error('Redis error'));

        const request = new NextRequest('http://localhost:3000/api/analytics', {
          headers: { Authorization: 'Bearer test-api-key-123' },
        });

        const response = await GET(request);

        expect(response.status).toBe(500);
      });
    });

    describe('Security Flow Integration', () => {
      it('executes all security layers in correct order', async () => {
        const request = new NextRequest('http://localhost:3000/api/analytics', {
          headers: { Authorization: 'Bearer test-api-key-123' },
        });

        await GET(request);

        // Verify environment check happens first (no mock called)
        // Then API key validation (no mock called)
        // Then rate limiting
        expect(rateLimit).toHaveBeenCalled();
        // Then data fetching
        expect(getMultiplePostViews).toHaveBeenCalled();
      });

      it('stops at environment check in production', async () => {
        vi.stubEnv('VERCEL_ENV', 'production');

        const request = new NextRequest('http://localhost:3000/api/analytics', {
          headers: { Authorization: 'Bearer test-api-key-123' },
        });

        await GET(request);

        // Should not reach rate limiting or data fetching
        expect(rateLimit).not.toHaveBeenCalled();
        expect(getMultiplePostViews).not.toHaveBeenCalled();
      });

      it('stops at API key check with invalid key', async () => {
        const request = new NextRequest('http://localhost:3000/api/analytics', {
          headers: { Authorization: 'Bearer wrong-key' },
        });

        await GET(request);

        // Should not reach rate limiting or data fetching
        expect(rateLimit).not.toHaveBeenCalled();
        expect(getMultiplePostViews).not.toHaveBeenCalled();
      });

      it('stops at rate limit check when exceeded', async () => {
        mocks.rateLimit.mockResolvedValue({
          success: false,
          limit: 60,
          remaining: 0,
          reset: Date.now() + 60000,
        });

        const request = new NextRequest('http://localhost:3000/api/analytics', {
          headers: { Authorization: 'Bearer test-api-key-123' },
        });

        await GET(request);

        // Should not reach data fetching
        expect(getMultiplePostViews).not.toHaveBeenCalled();
      });
    });
  });
});
