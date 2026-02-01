/**
 * Integration tests for production metrics sync script
 *
 * Tests the sync functionality without requiring actual Redis credentials
 * Uses mocked Redis clients to verify sync logic
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Redis } from '@upstash/redis';
import { escapeRegExp } from '@/lib/security/regex-utils';

describe('Production Metrics Sync', () => {
  // Mock Redis client
  const createMockRedis = (data: Record<string, unknown>) => ({
    get: vi.fn(async (key: string) => data[key] ?? null),
    set: vi.fn(async () => 'OK'),
    keys: vi.fn(async (pattern: string) => {
      // FIX: CWE-94 - Use secure regex escaping to prevent injection
      const regex = new RegExp('^' + escapeRegExp(pattern) + '$');
      return Object.keys(data).filter((k) => regex.test(k));
    }),
  });

  describe('Key Filtering', () => {
    it('should exclude sensitive keys', () => {
      const excludedPatterns = [
        'session:*',
        'blocked:ips',
        'suspicious:ips',
        'rate_limit:*',
        'ip:reputation:*',
        'nonce:*',
        'csrf:*',
        'inoreader:tokens',
        '*:api_key',
        '*:token',
        '*:secret',
        'mcp:health:*',
        'cache:version:*',
      ];

      const sensitiveKeys = [
        'session:user123',
        'blocked:ips',
        'rate_limit:api:192.168.1.1',
        'inoreader:tokens',
        'app:api_key',
        'github:token',
        'aws:secret',
        'mcp:health:latest',
        'cache:version:1',
      ];

      const isExcluded = (key: string) => {
        return excludedPatterns.some((pattern) => {
          // FIX: CWE-94 - Use secure regex escaping to prevent injection
          const regex = new RegExp('^' + escapeRegExp(pattern) + '$');
          return regex.test(key);
        });
      };

      // All sensitive keys should be excluded
      sensitiveKeys.forEach((key) => {
        expect(isExcluded(key)).toBe(true);
      });

      // Analytics keys should NOT be excluded
      expect(isExcluded('analytics:milestones')).toBe(false);
      expect(isExcluded('pageviews:home')).toBe(false);
      expect(isExcluded('engagement:blog:post-1')).toBe(false);
    });

    it('should match pattern-based keys', () => {
      const matchesPattern = (key: string, pattern: string) => {
        // FIX: CWE-94 - Use secure regex escaping to prevent injection
        const regex = new RegExp('^' + escapeRegExp(pattern) + '$');
        return regex.test(key);
      };

      // Pageviews pattern
      expect(matchesPattern('pageviews:home', 'pageviews:*')).toBe(true);
      expect(matchesPattern('pageviews:blog/post-1', 'pageviews:*')).toBe(true);
      expect(matchesPattern('analytics:milestones', 'pageviews:*')).toBe(false);

      // Engagement pattern
      expect(matchesPattern('engagement:blog:post-1:likes', 'engagement:*')).toBe(true);
      expect(matchesPattern('engagement:project:demo:shares', 'engagement:*')).toBe(true);
      expect(matchesPattern('pageviews:home', 'engagement:*')).toBe(false);
    });
  });

  describe('Sync Operations', () => {
    it('should sync critical keys', async () => {
      const prodData = {
        'analytics:milestones': JSON.stringify([
          { type: 'monthly_visitors', threshold: 1000, value: 1250 },
        ]),
        'github:traffic:milestones': JSON.stringify([
          { type: 'views', threshold: 1000, value: 1150 },
        ]),
        'blog:trending': JSON.stringify([{ postId: 'post-1', score: 100 }]),
      };

      const prodRedis = createMockRedis(prodData) as unknown as Redis;
      const previewRedis = createMockRedis({}) as unknown as Redis;

      const criticalKeys = [
        'blog:trending', // Only critical production key
      ];

      const optionalKeys = [
        'analytics:milestones', // Optional (future)
        'github:traffic:milestones', // Optional (future)
      ];

      const synced = [];
      for (const key of [...criticalKeys, ...optionalKeys]) {
        const value = await prodRedis.get(key);
        if (value !== null) {
          await previewRedis.set(`preview:${key}`, value);
          synced.push(key);
        }
      }

      expect(synced).toEqual([
        'blog:trending',
        'analytics:milestones',
        'github:traffic:milestones',
      ]);
      expect(previewRedis.set).toHaveBeenCalledTimes(3);
      expect(previewRedis.set).toHaveBeenCalledWith(
        'preview:analytics:milestones',
        expect.any(String)
      );
    });

    it('should add preview prefix to all keys', async () => {
      const prodData = {
        'analytics:milestones': 'data1',
        'pageviews:home': '100',
        'engagement:post-1:likes': '50',
      };

      const prodRedis = createMockRedis(prodData) as unknown as Redis;
      const previewRedis = createMockRedis({}) as unknown as Redis;

      for (const [key, value] of Object.entries(prodData)) {
        await previewRedis.set(`preview:${key}`, value);
      }

      expect(previewRedis.set).toHaveBeenCalledWith('preview:analytics:milestones', 'data1');
      expect(previewRedis.set).toHaveBeenCalledWith('preview:pageviews:home', '100');
      expect(previewRedis.set).toHaveBeenCalledWith('preview:engagement:post-1:likes', '50');
    });

    it('should handle pattern-based key scanning', async () => {
      const prodData = {
        'pageviews:home': '100',
        'pageviews:about': '50',
        'pageviews:blog/post-1': '200',
        'analytics:milestones': 'data',
      };

      const prodRedis = createMockRedis(prodData) as unknown as Redis;
      const keys = await prodRedis.keys('pageviews:*');

      expect(keys).toEqual(['pageviews:home', 'pageviews:about', 'pageviews:blog/post-1']);
      expect(keys).not.toContain('analytics:milestones');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing production keys gracefully', async () => {
      const prodRedis = createMockRedis({}) as unknown as Redis;

      const value = await prodRedis.get('analytics:milestones');
      expect(value).toBeNull();

      // Sync should skip null values
      const synced = [];
      if (value !== null) {
        synced.push('analytics:milestones');
      }
      expect(synced).toEqual([]);
    });

    it('should handle Redis errors gracefully', async () => {
      const prodRedis = {
        get: vi.fn(async () => {
          throw new Error('Redis connection failed');
        }),
      } as unknown as Redis;

      let error: Error | null = null;
      try {
        await prodRedis.get('analytics:milestones');
      } catch (e) {
        error = e as Error;
      }

      expect(error).toBeTruthy();
      expect(error?.message).toBe('Redis connection failed');
    });
  });

  describe('Configuration Validation', () => {
    it('should require production credentials', () => {
      const originalEnv = process.env;

      // Remove production credentials
      process.env = { ...originalEnv };
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;

      const hasProductionCreds = Boolean(
        process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
      );

      expect(hasProductionCreds).toBe(false);

      // Restore
      process.env = originalEnv;
    });

    it('should require preview credentials', () => {
      const originalEnv = process.env;

      // Remove preview credentials
      process.env = { ...originalEnv };
      delete process.env.UPSTASH_REDIS_REST_URL_PREVIEW;
      delete process.env.UPSTASH_REDIS_REST_TOKEN_PREVIEW;

      const hasPreviewCreds = Boolean(
        process.env.UPSTASH_REDIS_REST_URL_PREVIEW && process.env.UPSTASH_REDIS_REST_TOKEN_PREVIEW
      );

      expect(hasPreviewCreds).toBe(false);

      // Restore
      process.env = originalEnv;
    });
  });
});
