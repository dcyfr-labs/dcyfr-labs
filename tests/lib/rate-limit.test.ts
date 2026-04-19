import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/lib/redis-client', () => ({
  redis: {
    incr: vi.fn(),
    pExpireAt: vi.fn(),
    pTTL: vi.fn(),
  },
}));

import {
  rateLimit,
  getClientIp,
  createRateLimitHeaders,
  type RateLimitConfig,
} from '@/lib/rate-limit';
import { redis } from '@/lib/redis-client';

const { incr, pExpireAt, pTTL } = vi.mocked(redis);

describe('rate-limit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rateLimit (Redis path)', () => {
    const config: RateLimitConfig = { limit: 10, windowInSeconds: 60 };

    it('allows first request', async () => {
      incr.mockResolvedValue(1);
      pExpireAt.mockResolvedValue(true as any);
      pTTL.mockResolvedValue(60000);

      const result = await rateLimit('user-1', config);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(9);
      expect(result.limit).toBe(10);
    });

    it('sets expiration on first request only', async () => {
      incr.mockResolvedValue(1);
      pExpireAt.mockResolvedValue(true as any);
      pTTL.mockResolvedValue(60000);

      await rateLimit('user-1', config);
      expect(pExpireAt).toHaveBeenCalledTimes(1);

      incr.mockResolvedValue(2);
      pTTL.mockResolvedValue(55000);
      await rateLimit('user-1', config);
      expect(pExpireAt).toHaveBeenCalledTimes(1); // not called again
    });

    it('allows requests within limit', async () => {
      incr.mockResolvedValue(5);
      pTTL.mockResolvedValue(30000);

      const result = await rateLimit('user-1', config);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(5);
    });

    it('blocks requests exceeding limit', async () => {
      incr.mockResolvedValue(11);
      pTTL.mockResolvedValue(30000);

      const result = await rateLimit('user-1', config);
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('blocks at exactly limit + 1', async () => {
      incr.mockResolvedValue(11);
      pTTL.mockResolvedValue(30000);

      const result = await rateLimit('user-1', config);
      expect(result.success).toBe(false);
    });

    it('allows at exactly the limit', async () => {
      incr.mockResolvedValue(10);
      pTTL.mockResolvedValue(30000);

      const result = await rateLimit('user-1', config);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(0);
    });

    it('uses window duration when pTTL returns -1', async () => {
      incr.mockResolvedValue(1);
      pExpireAt.mockResolvedValue(true as any);
      pTTL.mockResolvedValue(-1);

      const before = Date.now();
      const result = await rateLimit('user-1', config);
      expect(result.reset).toBeGreaterThanOrEqual(before + 60000);
    });

    it('uses window duration when pTTL throws', async () => {
      incr.mockResolvedValue(1);
      pExpireAt.mockResolvedValue(true as any);
      pTTL.mockRejectedValue(new Error('redis down'));
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await rateLimit('user-1', config);
      expect(result.success).toBe(true);
      spy.mockRestore();
    });
  });

  describe('rateLimit (Redis error fallback)', () => {
    it('fails open by default on Redis error', async () => {
      incr.mockRejectedValue(new Error('Redis connection refused'));
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await rateLimit('user-1', { limit: 10, windowInSeconds: 60 });
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(9);
      spy.mockRestore();
    });

    it('fails closed when configured', async () => {
      incr.mockRejectedValue(new Error('Redis connection refused'));
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await rateLimit('user-1', {
        limit: 10,
        windowInSeconds: 60,
        failClosed: true,
      });
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
      spy.mockRestore();
    });
  });

  describe('getClientIp', () => {
    it('extracts IP from x-forwarded-for', () => {
      const req = new Request('http://localhost', {
        headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
      });
      expect(getClientIp(req)).toBe('1.2.3.4');
    });

    it('extracts IP from x-real-ip', () => {
      const req = new Request('http://localhost', {
        headers: { 'x-real-ip': '9.8.7.6' },
      });
      expect(getClientIp(req)).toBe('9.8.7.6');
    });

    it('returns "unknown" when no IP headers', () => {
      const req = new Request('http://localhost');
      expect(getClientIp(req)).toBe('unknown');
    });

    it('prefers x-forwarded-for over x-real-ip', () => {
      const req = new Request('http://localhost', {
        headers: {
          'x-forwarded-for': '1.1.1.1',
          'x-real-ip': '2.2.2.2',
        },
      });
      expect(getClientIp(req)).toBe('1.1.1.1');
    });

    it('trims whitespace from forwarded IP', () => {
      const req = new Request('http://localhost', {
        headers: { 'x-forwarded-for': '  3.3.3.3  , 4.4.4.4' },
      });
      expect(getClientIp(req)).toBe('3.3.3.3');
    });
  });

  describe('createRateLimitHeaders', () => {
    it('returns standard rate limit headers', () => {
      const headers = createRateLimitHeaders({
        success: true,
        limit: 100,
        remaining: 95,
        reset: 1700000000,
      });
      expect(headers['X-RateLimit-Limit']).toBe('100');
      expect(headers['X-RateLimit-Remaining']).toBe('95');
      expect(headers['X-RateLimit-Reset']).toBe('1700000000');
    });

    it('returns zero remaining for blocked requests', () => {
      const headers = createRateLimitHeaders({
        success: false,
        limit: 10,
        remaining: 0,
        reset: 1700000000,
      });
      expect(headers['X-RateLimit-Remaining']).toBe('0');
    });
  });
});
