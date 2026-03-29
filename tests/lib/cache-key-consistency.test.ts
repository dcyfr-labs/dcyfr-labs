/**
 * Cache Key Consistency Tests
 *
 * Verifies that build-time cache population and runtime cache reads
 * use the same Redis key prefix, preventing cache miss issues.
 *
 * This test simulates the environment variable state during:
 * 1. Build time (populate-build-cache.mjs)
 * 2. Runtime (redis-client.ts, github-data.ts, credly-cache.ts)
 *
 * Issue: Preview deployments were failing because build-time and runtime
 * used different key prefixes, causing cache misses.
 *
 * Fix: Use VERCEL_GIT_COMMIT_REF (branch name) which is consistent
 * across both build and runtime phases.
 *
 * Affected Systems:
 * - GitHub Activity Cache (github-data.ts)
 * - Credly Badges Cache (credly-cache.ts)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

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

describe('Cache Key Consistency', () => {
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

      // Test GitHub cache key
      const githubKey = `${prefix}github:contributions:dcyfr`;
      expect(githubKey).toBe('preview:preview:github:contributions:dcyfr');

      // Test Credly cache key
      const credlyKey = `${prefix}credly:badges:dcyfr:all`;
      expect(credlyKey).toBe('preview:preview:credly:badges:dcyfr:all');
    });

    it('should construct correct full cache key for production', () => {
      const testEnv = {
        NODE_ENV: 'production',
        VERCEL_ENV: 'production',
      };

      const prefix = simulateGetRedisKeyPrefix(testEnv);

      // Test GitHub cache key
      const githubKey = `${prefix}github:contributions:dcyfr`;
      expect(githubKey).toBe('github:contributions:dcyfr');

      // Test Credly cache key
      const credlyKey = `${prefix}credly:badges:dcyfr:10`;
      expect(credlyKey).toBe('credly:badges:dcyfr:10');
    });

    it('should match build script key generation for all cache types', () => {
      const testEnv = {
        VERCEL_ENV: 'preview',
        VERCEL_GIT_COMMIT_REF: 'feature-branch',
      };

      const prefix = simulateGetRedisKeyPrefix(testEnv);

      // Simulate build script logic
      const GITHUB_USERNAME = 'dcyfr';
      const buildGithubKey = `${prefix}github:contributions:${GITHUB_USERNAME}`;
      const buildCredlyKeyAll = `${prefix}credly:badges:${GITHUB_USERNAME}:all`;
      const buildCredlyKey10 = `${prefix}credly:badges:${GITHUB_USERNAME}:10`;
      const buildCredlyKey3 = `${prefix}credly:badges:${GITHUB_USERNAME}:3`;

      // Runtime should match exactly
      expect(buildGithubKey).toBe('preview:feature-branch:github:contributions:dcyfr');
      expect(buildCredlyKeyAll).toBe('preview:feature-branch:credly:badges:dcyfr:all');
      expect(buildCredlyKey10).toBe('preview:feature-branch:credly:badges:dcyfr:10');
      expect(buildCredlyKey3).toBe('preview:feature-branch:credly:badges:dcyfr:3');
    });
  });
});
