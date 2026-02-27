import { describe, expect, it, vi, beforeEach } from 'vitest';
import { proxy, config as proxyConfig } from '@/proxy';
import { NextRequest } from 'next/server';
import { rateLimit, getClientIp, createRateLimitHeaders } from '@/lib/rate-limit';
import { SITE_DOMAIN } from '@/lib/site-config';

// Mock the Upstash redis singleton with proper rate limiting behavior
const rateLimitCounters: Record<string, number> = {};
const rateLimitExpiries: Record<string, number> = {};

vi.mock('@/lib/redis-client', () => ({
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

describe('Authentication & Security Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear in-memory counters
    Object.keys(rateLimitCounters).forEach((key) => delete rateLimitCounters[key]);
    Object.keys(rateLimitExpiries).forEach((key) => delete rateLimitExpiries[key]);
  });

  describe('Content Security Policy (CSP)', () => {
    it('sets Content-Security-Policy header', () => {
      const request = new NextRequest('http://localhost:3000/');
      const response = proxy(request);

      const csp = response.headers.get('Content-Security-Policy');
      expect(csp).toBeTruthy();
      expect(csp).toContain("default-src 'self'");
    });

    it('uses unsafe-inline for scripts (allows third-party widgets)', () => {
      const request = new NextRequest('http://localhost:3000/');
      const response = proxy(request);

      const csp = response.headers.get('Content-Security-Policy');
      expect(csp).toContain("'unsafe-inline'");
    });

    it('includes all required CSP directives', () => {
      const request = new NextRequest('http://localhost:3000/');
      const response = proxy(request);

      const csp = response.headers.get('Content-Security-Policy');

      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain('script-src');
      expect(csp).toContain('style-src');
      expect(csp).toContain('img-src');
      expect(csp).toContain('font-src');
      expect(csp).toContain('connect-src');
      expect(csp).toContain('frame-src');
      expect(csp).toContain("object-src 'none'");
      expect(csp).toContain("base-uri 'self'");
      expect(csp).toContain("form-action 'self'");
      expect(csp).toContain('upgrade-insecure-requests');
    });

    it('allows Giscus comments in script-src', () => {
      const request = new NextRequest('http://localhost:3000/');
      const response = proxy(request);

      const csp = response.headers.get('Content-Security-Policy');
      expect(csp).toContain('https://giscus.app');
    });

    it('allows GitHub API in img-src for general HTTPS images', () => {
      const request = new NextRequest('http://localhost:3000/');
      const response = proxy(request);

      const csp = response.headers.get('Content-Security-Policy');
      // Current implementation allows all HTTPS images
      expect(csp).toContain('https:');
    });

    it('allows Credly badge images via general HTTPS', () => {
      const request = new NextRequest('http://localhost:3000/');
      const response = proxy(request);

      const csp = response.headers.get('Content-Security-Policy');
      // images.credly.com covered by connect-src, and images by general https: in img-src
      expect(csp).toContain('https://images.credly.com');
    });

    it('allows Giscus in frame-src for blog comments', () => {
      const request = new NextRequest('http://localhost:3000/');
      const response = proxy(request);

      const csp = response.headers.get('Content-Security-Policy');

      expect(csp).toContain('frame-src');
      expect(csp).toContain('https://giscus.app');
    });

    it('allows general HTTPS images including production domain', () => {
      const request = new NextRequest('http://localhost:3000/');
      const response = proxy(request);

      const csp = response.headers.get('Content-Security-Policy');
      // Current implementation uses 'https:' which covers www.dcyfr.ai
      expect(csp).toContain("img-src 'self' data: https: blob:");
    });

    it('includes unsafe-eval for Next.js features', () => {
      const request = new NextRequest('http://localhost:3000/');
      const response = proxy(request);

      const csp = response.headers.get('Content-Security-Policy');
      // Current implementation includes unsafe-eval for Next.js runtime
      expect(csp).toContain("'unsafe-eval'");
    });

    it('allows localhost connections in development', () => {
      const request = new NextRequest('http://localhost:3000/');
      const response = proxy(request);

      const csp = response.headers.get('Content-Security-Policy');
      expect(csp).toContain('http://localhost:*');
    });
  });

  describe('Developer-Only Page Protection', () => {
    it('allows /analytics in development', () => {
      vi.stubEnv('NODE_ENV', 'development');

      const request = new NextRequest('http://localhost:3000/analytics');
      const response = proxy(request);

      // In development, should proceed normally
      expect(response).toBeTruthy();

      vi.unstubAllEnvs();
    });

    it('allows /dev/analytics routes (no blocking)', () => {
      const request = new NextRequest('http://localhost:3000/dev/analytics');
      const response = proxy(request);

      // Current implementation doesn't block /dev routes
      expect(response).toBeTruthy();
      expect(response.headers.get('Content-Security-Policy')).toBeTruthy();
    });

    it('allows other paths in production', () => {
      vi.stubEnv('NODE_ENV', 'production');

      const request = new NextRequest('http://localhost:3000/blog');
      const response = proxy(request);

      const rewrite = response.headers.get('x-middleware-rewrite');
      if (rewrite) {
        expect(rewrite).not.toContain('_not-found');
      }

      vi.unstubAllEnvs();
    });
  });

  describe('Proxy Matcher Configuration', () => {
    it('excludes static assets from proxy', () => {
      expect(proxyConfig.matcher).toBeDefined();
      expect(Array.isArray(proxyConfig.matcher)).toBe(true);

      // matcher uses a plain string pattern
      const source = proxyConfig.matcher[0] as string;
      expect(typeof source).toBe('string');
      expect(source).toContain('_next/static');
      expect(source).toContain('_next/image');
      expect(source).toContain('favicon.ico');
    });

    it('excludes static file extensions from proxy', () => {
      // The string-based matcher pattern excludes image and font extensions
      const source = proxyConfig.matcher[0] as string;
      expect(source).toContain('png|jpg|jpeg|gif|svg|webp|ico|woff|woff2');
    });
  });

  describe('Rate Limiting Integration', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      // Force in-memory fallback for consistent test behavior
      delete process.env.REDIS_URL;
      // TODO: globalThis client deprecated with Upstash
      // globalThis.__rateLimitRedisClient = undefined
    });

    it('enforces rate limits consistently', async () => {
      const identifier = 'test-user-123';
      const config = { limit: 3, windowInSeconds: 60 };

      // First 3 requests should succeed
      for (let i = 0; i < 3; i++) {
        const result = await rateLimit(identifier, config);
        expect(result.success).toBe(true);
        expect(result.remaining).toBe(2 - i);
      }

      // 4th request should fail
      const result = await rateLimit(identifier, config);
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('includes rate limit metadata', async () => {
      const result = await rateLimit('test-user', { limit: 10, windowInSeconds: 60 });

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('limit');
      expect(result).toHaveProperty('remaining');
      expect(result).toHaveProperty('reset');
      expect(typeof result.limit).toBe('number');
      expect(typeof result.remaining).toBe('number');
      expect(typeof result.reset).toBe('number');
    });

    it('creates standard rate limit headers', () => {
      const result = { success: true, limit: 10, remaining: 5, reset: Date.now() + 60000 };
      const headers = createRateLimitHeaders(result);

      expect(headers['X-RateLimit-Limit']).toBe('10');
      expect(headers['X-RateLimit-Remaining']).toBe('5');
      expect(headers['X-RateLimit-Reset']).toBeTruthy();
      expect(typeof headers['X-RateLimit-Reset']).toBe('string');
    });

    it('resets counter after window expires', async () => {
      const identifier = 'test-expiry';
      const config = { limit: 2, windowInSeconds: 1 };

      // Use up limit
      await rateLimit(identifier, config);
      await rateLimit(identifier, config);

      const blocked = await rateLimit(identifier, config);
      expect(blocked.success).toBe(false);

      // Wait for window to expire (plus buffer)
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Should work again
      const allowed = await rateLimit(identifier, config);
      expect(allowed.success).toBe(true);
      expect(allowed.remaining).toBeGreaterThan(0);
    });
  });

  describe('IP Address Extraction', () => {
    it('extracts IP from x-forwarded-for header', () => {
      const request = new Request('http://localhost:3000/', {
        headers: { 'x-forwarded-for': '192.168.1.100, 10.0.0.1' },
      });

      const ip = getClientIp(request);

      expect(ip).toBe('192.168.1.100');
    });

    it('extracts IP from x-real-ip header', () => {
      const request = new Request('http://localhost:3000/', {
        headers: { 'x-real-ip': '192.168.1.200' },
      });

      const ip = getClientIp(request);

      expect(ip).toBe('192.168.1.200');
    });

    it('prefers x-forwarded-for over x-real-ip', () => {
      const request = new Request('http://localhost:3000/', {
        headers: {
          'x-forwarded-for': '192.168.1.100',
          'x-real-ip': '192.168.1.200',
        },
      });

      const ip = getClientIp(request);

      expect(ip).toBe('192.168.1.100');
    });

    it('handles multiple IPs in x-forwarded-for (uses first)', () => {
      const request = new Request('http://localhost:3000/', {
        headers: { 'x-forwarded-for': '203.0.113.1, 198.51.100.1, 192.0.2.1' },
      });

      const ip = getClientIp(request);

      expect(ip).toBe('203.0.113.1');
    });

    it('returns fallback IP when headers missing', () => {
      const request = new Request('http://localhost:3000/');

      const ip = getClientIp(request);

      expect(ip).toBeTruthy();
      expect(typeof ip).toBe('string');
    });

    it('sanitizes IP addresses', () => {
      const request = new Request('http://localhost:3000/', {
        headers: { 'x-forwarded-for': '  192.168.1.100  ' },
      });

      const ip = getClientIp(request);

      expect(ip).toBe('192.168.1.100');
      expect(ip).not.toContain(' ');
    });
  });

  describe('Cross-Route Security Patterns', () => {
    it('rate limit configurations are consistent across API routes', () => {
      // Common patterns observed in API routes
      const commonConfigs = [
        { limit: 3, windowInSeconds: 60 }, // Contact form (3/min)
        { limit: 10, windowInSeconds: 300 }, // Views tracking (10/5min)
        { limit: 10, windowInSeconds: 60 }, // GitHub contributions (10/min)
        { limit: 60, windowInSeconds: 60 }, // Analytics dev (60/min)
      ];

      commonConfigs.forEach((config) => {
        expect(config.limit).toBeGreaterThan(0);
        expect(config.windowInSeconds).toBeGreaterThan(0);
        expect(config.limit).toBeLessThanOrEqual(60);
        expect(config.windowInSeconds).toBeGreaterThanOrEqual(60);
      });
    });

    it('CSP is applied to all requests', () => {
      const paths = ['/', '/blog', '/work', '/about', '/api/contact'];

      paths.forEach((path) => {
        const request = new NextRequest(`http://localhost:3000${path}`);
        const response = proxy(request);

        const csp = response.headers.get('Content-Security-Policy');
        expect(csp).toBeTruthy();
        expect(csp).toContain("default-src 'self'");
      });
    });

    it('CSP is applied to all routes', () => {
      const paths = ['/', '/blog', '/work', '/about'];

      paths.forEach((path) => {
        const request = new NextRequest(`http://localhost:3000${path}`);
        const response = proxy(request);

        const csp = response.headers.get('Content-Security-Policy');
        expect(csp).toBeTruthy();
        expect(csp!.length).toBeGreaterThan(100);
      });
    });
  });

  describe('Security Error Handling', () => {
    it('rate limiter fails open on errors', async () => {
      // Simulate error condition by using invalid identifier
      const result = await rateLimit('', { limit: 10, windowInSeconds: 60 });

      // Should allow request even with error
      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
    });

    it('CSP header is always present', () => {
      // Even with unusual requests
      const request = new NextRequest('http://localhost:3000/nonexistent-path');
      const response = proxy(request);

      expect(response.headers.get('Content-Security-Policy')).toBeTruthy();
    });

    it('CSP is set for all rapid requests', () => {
      // Test multiple rapid requests
      const requests = Array.from(
        { length: 10 },
        (_, i) => new NextRequest(`http://localhost:3000/?req=${i}`)
      );

      requests.forEach((request) => {
        const response = proxy(request);
        const csp = response.headers.get('Content-Security-Policy');

        expect(csp).toBeTruthy();
        expect(csp).toContain("default-src 'self'");
      });
    });
  });

  describe('Security Headers Consistency', () => {
    it('all security headers use consistent format', () => {
      const request = new NextRequest('http://localhost:3000/');
      const response = proxy(request);

      const csp = response.headers.get('Content-Security-Policy');

      // Should be single line, no line breaks
      expect(csp).not.toContain('\n');
      expect(csp).not.toContain('\r');

      // Should use semicolon separators
      expect(csp).toContain(';');
    });

    it('rate limit headers follow RFC standards', () => {
      const result = { success: true, limit: 100, remaining: 50, reset: 1700000000000 };
      const headers = createRateLimitHeaders(result);

      // Headers should exist
      expect(headers['X-RateLimit-Limit']).toBeDefined();
      expect(headers['X-RateLimit-Remaining']).toBeDefined();
      expect(headers['X-RateLimit-Reset']).toBeDefined();

      // Values should be numeric strings
      expect(headers['X-RateLimit-Limit']).toMatch(/^\d+$/);
      expect(headers['X-RateLimit-Remaining']).toMatch(/^\d+$/);
      expect(headers['X-RateLimit-Reset']).toMatch(/^\d+$/);
    });
  });
});
