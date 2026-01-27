/**
 * Test Suite: lib/rate-limit.ts
 *
 * Tests distributed rate limiting with Redis and in-memory fallback.
 * Critical for API security and preventing abuse.
 *
 * Coverage: rateLimit, getClientIp, createRateLimitHeaders
 *
 * Note: Redis integration tests verify the logic flow but use in-memory fallback
 * since Redis client creation is complex to mock in this environment.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  rateLimit,
  getClientIp,
  createRateLimitHeaders,
  type RateLimitConfig,
  type RateLimitResult,
} from '@/lib/rate-limit';

// Mock the Upstash redis singleton with proper rate limiting behavior
const rateLimitCounters: Record<string, number> = {};
const rateLimitExpiries: Record<string, number> = {};

vi.mock('@/mcp/shared/redis-client', () => ({
  redis: {
    incr: vi.fn(async (key: string) => {
      // Check if key has expired
      const expiry = rateLimitExpiries[key];
      if (expiry && expiry <= Date.now()) {
        // Key expired - reset counter
        delete rateLimitCounters[key];
        delete rateLimitExpiries[key];
      }

      rateLimitCounters[key] = (rateLimitCounters[key] || 0) + 1;
      return rateLimitCounters[key];
    }),
    pexpireat: vi.fn(async (key: string, timestamp: number) => {
      rateLimitExpiries[key] = timestamp;
      return 1;
    }),
    pttl: vi.fn(async (key: string) => {
      const expiry = rateLimitExpiries[key];
      if (!expiry) return -2; // Key doesn't exist
      const ttl = expiry - Date.now();
      if (ttl <= 0) {
        // Key expired - clean up
        delete rateLimitCounters[key];
        delete rateLimitExpiries[key];
        return -2; // Return -2 (key doesn't exist) instead of -1
      }
      return ttl;
    }),
  },
}));

describe('rate-limit.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear in-memory counters
    Object.keys(rateLimitCounters).forEach((key) => delete rateLimitCounters[key]);
    Object.keys(rateLimitExpiries).forEach((key) => delete rateLimitExpiries[key]);
  });

  describe('rateLimit - in-memory fallback', () => {
    it('should allow first request', async () => {
      const config: RateLimitConfig = {
        limit: 10,
        windowInSeconds: 60,
      };

      const result = await rateLimit('test-user-1', config);

      expect(result.success).toBe(true);
      expect(result.limit).toBe(10);
      expect(result.remaining).toBe(9);
      expect(result.reset).toBeGreaterThan(Date.now());
    });

    it('should track multiple requests from same identifier', async () => {
      const config: RateLimitConfig = {
        limit: 3,
        windowInSeconds: 60,
      };

      const result1 = await rateLimit('test-user-2', config);
      expect(result1.success).toBe(true);
      expect(result1.remaining).toBe(2);

      const result2 = await rateLimit('test-user-2', config);
      expect(result2.success).toBe(true);
      expect(result2.remaining).toBe(1);

      const result3 = await rateLimit('test-user-2', config);
      expect(result3.success).toBe(true);
      expect(result3.remaining).toBe(0);
    });

    it('should block requests after limit is exceeded', async () => {
      const config: RateLimitConfig = {
        limit: 2,
        windowInSeconds: 60,
      };

      await rateLimit('test-user-3', config);
      await rateLimit('test-user-3', config);
      const result = await rateLimit('test-user-3', config);

      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should isolate different identifiers', async () => {
      const config: RateLimitConfig = {
        limit: 2,
        windowInSeconds: 60,
      };

      await rateLimit('user-a', config);
      await rateLimit('user-a', config);
      const blockedResult = await rateLimit('user-a', config);
      expect(blockedResult.success).toBe(false);

      // Different user should have their own limit
      const allowedResult = await rateLimit('user-b', config);
      expect(allowedResult.success).toBe(true);
      expect(allowedResult.remaining).toBe(1);
    });

    it('should reset after window expires', async () => {
      const config: RateLimitConfig = {
        limit: 1,
        windowInSeconds: 0.001, // 1ms window for testing
      };

      const result1 = await rateLimit('test-user-4', config);
      expect(result1.success).toBe(true);

      const result2 = await rateLimit('test-user-4', config);
      expect(result2.success).toBe(false);

      // Wait for window to expire
      await new Promise((resolve) => setTimeout(resolve, 5));

      const result3 = await rateLimit('test-user-4', config);
      expect(result3.success).toBe(true);
      expect(result3.remaining).toBe(0);
    });

    it('should handle concurrent requests from same identifier', async () => {
      const config: RateLimitConfig = {
        limit: 5,
        windowInSeconds: 60,
      };

      const promises = Array.from({ length: 7 }, () => rateLimit('concurrent-user', config));

      const results = await Promise.all(promises);
      const successCount = results.filter((r) => r.success).length;
      const failCount = results.filter((r) => !r.success).length;

      expect(successCount).toBe(5);
      expect(failCount).toBe(2);
    });

    it('should maintain accurate remaining count', async () => {
      const config: RateLimitConfig = {
        limit: 5,
        windowInSeconds: 60,
      };

      for (let i = 0; i < 5; i++) {
        const result = await rateLimit('countdown-user', config);
        expect(result.remaining).toBe(4 - i);
      }
    });

    it('should set consistent reset time within window', async () => {
      const config: RateLimitConfig = {
        limit: 5,
        windowInSeconds: 60,
      };

      const result1 = await rateLimit('reset-time-user', config);
      const result2 = await rateLimit('reset-time-user', config);

      // Reset times should be the same for requests in the same window
      expect(result1.reset).toBe(result2.reset);
    });
  });

  describe('getClientIp', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const request = new Request('https://example.com', {
        headers: {
          'x-forwarded-for': '203.0.113.195',
        },
      });

      const ip = getClientIp(request);
      expect(ip).toBe('203.0.113.195');
    });

    it('should use first IP from x-forwarded-for chain', () => {
      const request = new Request('https://example.com', {
        headers: {
          'x-forwarded-for': '203.0.113.195, 198.51.100.178, 192.0.2.146',
        },
      });

      const ip = getClientIp(request);
      expect(ip).toBe('203.0.113.195');
    });

    it('should trim whitespace from x-forwarded-for', () => {
      const request = new Request('https://example.com', {
        headers: {
          'x-forwarded-for': '  203.0.113.195  ',
        },
      });

      const ip = getClientIp(request);
      expect(ip).toBe('203.0.113.195');
    });

    it('should use x-real-ip when x-forwarded-for is not present', () => {
      const request = new Request('https://example.com', {
        headers: {
          'x-real-ip': '198.51.100.178',
        },
      });

      const ip = getClientIp(request);
      expect(ip).toBe('198.51.100.178');
    });

    it('should prioritize x-forwarded-for over x-real-ip', () => {
      const request = new Request('https://example.com', {
        headers: {
          'x-forwarded-for': '203.0.113.195',
          'x-real-ip': '198.51.100.178',
        },
      });

      const ip = getClientIp(request);
      expect(ip).toBe('203.0.113.195');
    });

    it('should return "unknown" when no IP headers present', () => {
      const request = new Request('https://example.com');

      const ip = getClientIp(request);
      expect(ip).toBe('unknown');
    });

    it('should handle empty x-forwarded-for header', () => {
      const request = new Request('https://example.com', {
        headers: {
          'x-forwarded-for': '',
        },
      });

      const ip = getClientIp(request);
      // Empty string is falsy, so it falls through to 'unknown'
      expect(ip).toBe('unknown');
    });
  });

  describe('createRateLimitHeaders', () => {
    it('should create standard rate limit headers', () => {
      const result: RateLimitResult = {
        success: true,
        limit: 100,
        remaining: 75,
        reset: 1234567890000,
      };

      const headers = createRateLimitHeaders(result);

      expect(headers).toEqual({
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '75',
        'X-RateLimit-Reset': '1234567890000',
      });
    });

    it('should handle zero remaining', () => {
      const result: RateLimitResult = {
        success: false,
        limit: 50,
        remaining: 0,
        reset: 1234567890000,
      };

      const headers = createRateLimitHeaders(result);

      expect(headers['X-RateLimit-Remaining']).toBe('0');
    });

    it('should handle maximum remaining', () => {
      const result: RateLimitResult = {
        success: true,
        limit: 1000,
        remaining: 1000,
        reset: 1234567890000,
      };

      const headers = createRateLimitHeaders(result);

      expect(headers['X-RateLimit-Remaining']).toBe('1000');
    });

    it('should convert numbers to strings', () => {
      const result: RateLimitResult = {
        success: true,
        limit: 10,
        remaining: 5,
        reset: 9999999999999,
      };

      const headers = createRateLimitHeaders(result);

      expect(typeof headers['X-RateLimit-Limit']).toBe('string');
      expect(typeof headers['X-RateLimit-Remaining']).toBe('string');
      expect(typeof headers['X-RateLimit-Reset']).toBe('string');
    });
  });
});
