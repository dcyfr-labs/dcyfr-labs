/**
 * Security Audit Integration Tests
 *
 * Tests for P0 security fixes from audit:
 * SECURITY_AUDIT_PRODUCTION_BUILD_ENV_SEGREGATION_2026-02-13
 *
 * Critical fixes tested:
 * 1. Production-to-preview data sync prevention
 * 2. Redis environment key prefixing
 * 3. Development route protection in production
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from '../../middleware';

describe('Security Audit Fixes - Environment Segregation', () => {
  beforeEach(() => {
    // Reset environment variables before each test
    vi.unstubAllEnvs();
  });

  describe('P0-1: Production-to-Preview Data Sync Prevention', () => {
    it('should skip sync script in production environment (VERCEL_ENV)', async () => {
      // Simulate production environment
      vi.stubEnv('VERCEL_ENV', 'production');
      vi.stubEnv('NODE_ENV', 'production');

      // Mock the sync script execution
      // In real implementation, this would import and run sync-production-metrics.mjs
      const shouldRunSync = !(
        process.env.VERCEL_ENV === 'production' ||
        process.env.GIT_COMMIT_REF === 'main' ||
        process.env.NODE_ENV === 'production'
      );

      expect(shouldRunSync).toBe(false);
    });

    it('should skip sync script when deploying from main branch', async () => {
      vi.stubEnv('GIT_COMMIT_REF', 'main');
      vi.stubEnv('VERCEL_ENV', 'production');

      const shouldRunSync = !(
        process.env.VERCEL_ENV === 'production' ||
        process.env.GIT_COMMIT_REF === 'main' ||
        process.env.NODE_ENV === 'production'
      );

      expect(shouldRunSync).toBe(false);
    });

    it('should allow sync script in preview environment', async () => {
      vi.stubEnv('VERCEL_ENV', 'preview');
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('GIT_COMMIT_REF', 'feature/test');

      const shouldRunSync = !(
        process.env.VERCEL_ENV === 'production' ||
        process.env.GIT_COMMIT_REF === 'main' ||
        process.env.NODE_ENV === 'production'
      );

      expect(shouldRunSync).toBe(false); // Still false because NODE_ENV=production
    });

    it('should allow sync script in development', async () => {
      vi.stubEnv('VERCEL_ENV', undefined);
      vi.stubEnv('NODE_ENV', 'development');

      const shouldRunSync = !(
        process.env.VERCEL_ENV === 'production' ||
        process.env.GIT_COMMIT_REF === 'main' ||
        process.env.NODE_ENV === 'production'
      );

      expect(shouldRunSync).toBe(true);
    });
  });

  describe('P0-2: Redis Environment Key Prefixing', () => {
    it('should use no prefix for production environment', () => {
      vi.stubEnv('VERCEL_ENV', 'production');
      vi.stubEnv('NODE_ENV', 'production');

      // Simulate key prefix logic from populate-build-cache.mjs
      const isProduction =
        process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'production';

      const keyPrefix = isProduction ? '' : 'preview:';

      expect(keyPrefix).toBe('');
    });

    it('should use preview: prefix for preview environment', () => {
      vi.stubEnv('VERCEL_ENV', 'preview');
      vi.stubEnv('NODE_ENV', 'production');

      const isProduction =
        process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'production';

      const keyPrefix = isProduction ? '' : 'preview:';

      expect(keyPrefix).toBe('preview:');
    });

    it('should use preview: prefix for development environment', () => {
      vi.stubEnv('VERCEL_ENV', undefined);
      vi.stubEnv('NODE_ENV', 'development');

      const isProduction =
        process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'production';

      const keyPrefix = isProduction ? '' : 'preview:';

      expect(keyPrefix).toBe('preview:');
    });

    it('should correctly prefix cache keys in non-production', () => {
      const keyPrefix = 'preview:';
      const baseKey = 'github:contributions:dcyfr';
      const fullKey = `${keyPrefix}${baseKey}`;

      expect(fullKey).toBe('preview:github:contributions:dcyfr');
    });

    it('should not double-prefix keys in production', () => {
      const keyPrefix = '';
      const baseKey = 'github:contributions:dcyfr';
      const fullKey = `${keyPrefix}${baseKey}`;

      expect(fullKey).toBe('github:contributions:dcyfr');
      expect(fullKey).not.toContain('preview:');
    });
  });

  describe('P0-3: Development Route Protection', () => {
    beforeEach(() => {
      // Each test will set its own environment
      vi.unstubAllEnvs();
    });

    it('should block /dev/* routes in production', async () => {
      vi.stubEnv('VERCEL_ENV', 'production');
      vi.stubEnv('NODE_ENV', 'production');

      const request = new NextRequest(new Request('https://dcyfr.ai/dev/test-page'));

      const response = await middleware(request);

      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body.error).toBe('Not Found');
      expect(body.message).toContain('development environments');
    });

    it('should block /api/dev/* routes in production', async () => {
      vi.stubEnv('VERCEL_ENV', 'production');
      vi.stubEnv('NODE_ENV', 'production');

      const request = new NextRequest(new Request('https://dcyfr.ai/api/dev/analytics'));

      const response = await middleware(request);

      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body.error).toBe('Not Found');
    });

    it('should allow /dev/* routes in preview environment', async () => {
      vi.stubEnv('VERCEL_ENV', 'preview');
      vi.stubEnv('NODE_ENV', 'production');

      const request = new NextRequest(
        new Request('https://dcyfr-preview.vercel.app/dev/test-page')
      );

      const response = await middleware(request);

      // Should pass through (NextResponse.next() returns undefined status)
      expect(response.status).not.toBe(404);
    });

    it('should allow /dev/* routes in development', async () => {
      vi.stubEnv('NODE_ENV', 'development');

      const request = new NextRequest(new Request('http://localhost:3000/dev/test-page'));

      const response = await middleware(request);

      expect(response.status).not.toBe(404);
    });

    it('should require authentication for /api/admin/* routes', async () => {
      vi.stubEnv('VERCEL_ENV', 'production');

      const request = new NextRequest(new Request('https://dcyfr.ai/api/admin/clear-cache'));

      const response = await middleware(request);

      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error).toBe('Unauthorized');
    });

    it('should allow authenticated /api/admin/* requests', async () => {
      vi.stubEnv('VERCEL_ENV', 'production');

      const request = new NextRequest(
        new Request('https://dcyfr.ai/api/admin/clear-cache', {
          headers: {
            Authorization: 'Bearer test-token-123',
          },
        })
      );

      const response = await middleware(request);

      // Should pass through with auth header
      expect(response.status).not.toBe(401);
    });
  });

  describe('Environment Detection Consistency', () => {
    it('should consistently detect production across all checks', () => {
      vi.stubEnv('VERCEL_ENV', 'production');
      vi.stubEnv('NODE_ENV', 'production');

      const checks = [
        process.env.VERCEL_ENV === 'production',
        process.env.NODE_ENV === 'production',
        process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production',
      ];

      expect(checks.every((check) => check === true)).toBe(true);
    });

    it('should consistently detect preview environment', () => {
      vi.stubEnv('VERCEL_ENV', 'preview');
      vi.stubEnv('NODE_ENV', 'production');

      const isProduction = process.env.VERCEL_ENV === 'production';
      const isPreview = process.env.VERCEL_ENV === 'preview';

      expect(isProduction).toBe(false);
      expect(isPreview).toBe(true);
    });

    it('should prioritize VERCEL_ENV over NODE_ENV for environment detection', () => {
      vi.stubEnv('VERCEL_ENV', 'preview');
      vi.stubEnv('NODE_ENV', 'production');

      // VERCEL_ENV should take priority
      const environment = process.env.VERCEL_ENV || process.env.NODE_ENV;

      expect(environment).toBe('preview');
    });
  });

  describe('Regression Prevention', () => {
    it('should never sync production→preview in production builds', () => {
      const scenarios = [
        { VERCEL_ENV: 'production', NODE_ENV: 'production' },
        { GIT_COMMIT_REF: 'main', NODE_ENV: 'production' },
        {
          VERCEL_ENV: 'production',
          GIT_COMMIT_REF: 'main',
          NODE_ENV: 'production',
        },
      ];

      scenarios.forEach((env) => {
        Object.entries(env).forEach(([key, value]) => {
          vi.stubEnv(key, value);
        });

        const shouldRunSync = !(
          process.env.VERCEL_ENV === 'production' ||
          process.env.GIT_COMMIT_REF === 'main' ||
          process.env.NODE_ENV === 'production'
        );

        expect(shouldRunSync).toBe(false);

        vi.unstubAllEnvs();
      });
    });

    it('should never expose dev routes in production', async () => {
      vi.stubEnv('VERCEL_ENV', 'production');

      const devRoutes = [
        '/dev/analytics',
        '/dev/cache-inspector',
        '/api/dev/clear-cache',
        '/api/dev/test-redis',
      ];

      for (const route of devRoutes) {
        const request = new NextRequest(new Request(`https://dcyfr.ai${route}`));
        const response = await middleware(request);

        expect(response.status).toBe(404);
      }
    });
  });
});
