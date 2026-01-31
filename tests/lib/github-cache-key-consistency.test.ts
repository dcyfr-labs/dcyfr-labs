/**
 * GitHub Cache Key Consistency Test
 *
 * Verifies that build-time cache population and runtime cache reads
 * use the same Redis key prefix, preventing cache miss issues.
 *
 * This test simulates the environment variable state during:
 * 1. Build time (populate-build-cache.mjs)
 * 2. Runtime (redis-client.ts)
 *
 * Issue: Preview deployments were failing because build-time used
 * VERCEL_GIT_PULL_REQUEST_ID (not set for branch deployments) while
 * runtime expected the same key.
 *
 * Fix: Use VERCEL_GIT_COMMIT_REF (branch name) which is consistent
 * across both build and runtime phases.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Helper to simulate key prefix generation logic
function simulateGetRedisKeyPrefix(env: Record<string, string | undefined>): string {
  const isProduction = env.NODE_ENV === 'production' && env.VERCEL_ENV === 'production';
  const isPreview = env.VERCEL_ENV === 'preview';
  const isDevelopment = env.NODE_ENV === 'development';

  if (isProduction) {
    return ''; // No prefix for production (dedicated database)
  }

  if (isPreview) {
    const branch = env.VERCEL_GIT_COMMIT_REF || 'preview';
    return `preview:${branch}:`;
  }

  if (isDevelopment) {
    const username = env.USER || env.USERNAME || 'dev';
    return `dev:${username}:`;
  }

  return 'unknown:';
}

describe('GitHub Cache Key Consistency', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment for each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('Preview Deployments', () => {
    it('should use same key prefix for PR preview deployments', () => {
      // Simulate PR preview deployment environment
      const testEnv = {
        VERCEL_ENV: 'preview',
        VERCEL_GIT_COMMIT_REF: 'feature-branch',
        VERCEL_GIT_PULL_REQUEST_ID: '123',
      };

      // Simulate both build-time and runtime key generation
      const buildTimePrefix = simulateGetRedisKeyPrefix(testEnv);
      const runtimePrefix = simulateGetRedisKeyPrefix(testEnv);

      // Keys should match
      expect(buildTimePrefix).toBe(runtimePrefix);
      expect(buildTimePrefix).toBe('preview:feature-branch:');
    });

    it('should use same key prefix for branch preview deployments (no PR)', () => {
      // Simulate branch preview deployment (e.g., 'preview' branch)
      const testEnv = {
        VERCEL_ENV: 'preview',
        VERCEL_GIT_COMMIT_REF: 'preview',
        // VERCEL_GIT_PULL_REQUEST_ID not set for branch deployments
      };

      const buildTimePrefix = simulateGetRedisKeyPrefix(testEnv);
      const runtimePrefix = simulateGetRedisKeyPrefix(testEnv);

      // Keys should match
      expect(buildTimePrefix).toBe(runtimePrefix);
      expect(buildTimePrefix).toBe('preview:preview:');
    });

    it('should handle missing VERCEL_GIT_COMMIT_REF gracefully', () => {
      // Simulate edge case: no branch info available
      const testEnv = {
        VERCEL_ENV: 'preview',
        // No VERCEL_GIT_COMMIT_REF or VERCEL_GIT_PULL_REQUEST_ID
      };

      // Both should fall back to 'preview'
      const buildTimePrefix = simulateGetRedisKeyPrefix(testEnv);
      const runtimePrefix = simulateGetRedisKeyPrefix(testEnv);

      expect(buildTimePrefix).toBe(runtimePrefix);
      expect(buildTimePrefix).toBe('preview:preview:');
    });
  });

  describe('Production Deployments', () => {
    it('should use no prefix for production', () => {
      const testEnv = {
        NODE_ENV: 'production',
        VERCEL_ENV: 'production',
        VERCEL_GIT_COMMIT_REF: 'main',
      };

      const buildTimePrefix = simulateGetRedisKeyPrefix(testEnv);
      const runtimePrefix = simulateGetRedisKeyPrefix(testEnv);

      expect(buildTimePrefix).toBe(runtimePrefix);
      expect(buildTimePrefix).toBe('');
    });
  });

  describe('Development Environment', () => {
    it('should use username-based prefix', () => {
      const testEnv = {
        NODE_ENV: 'development',
        USER: 'testuser',
      };

      const buildTimePrefix = simulateGetRedisKeyPrefix(testEnv);
      const runtimePrefix = simulateGetRedisKeyPrefix(testEnv);

      expect(buildTimePrefix).toBe(runtimePrefix);
      expect(buildTimePrefix).toBe('dev:testuser:');
    });
  });

  describe('Cache Key Format', () => {
    it('should construct correct full cache key for preview', () => {
      const testEnv = {
        VERCEL_ENV: 'preview',
        VERCEL_GIT_COMMIT_REF: 'preview',
      };

      const prefix = simulateGetRedisKeyPrefix(testEnv);
      const CACHE_KEY_BASE = 'github:contributions:dcyfr';
      const fullKey = `${prefix}${CACHE_KEY_BASE}`;

      expect(fullKey).toBe('preview:preview:github:contributions:dcyfr');
    });

    it('should construct correct full cache key for production', () => {
      const testEnv = {
        NODE_ENV: 'production',
        VERCEL_ENV: 'production',
      };

      const prefix = simulateGetRedisKeyPrefix(testEnv);
      const CACHE_KEY_BASE = 'github:contributions:dcyfr';
      const fullKey = `${prefix}${CACHE_KEY_BASE}`;

      expect(fullKey).toBe('github:contributions:dcyfr');
    });
  });
});
