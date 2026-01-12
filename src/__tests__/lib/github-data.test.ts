/**
 * GitHub Data Server-Side Access Tests
 * 
 * Tests the secure server-side GitHub data access without
 * requiring public API endpoints.
 * 
 * NOTE: These tests validate fallback behavior since Redis module
 * uses dynamic imports that cannot be mocked in Vitest test environment.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getGitHubContributions, checkGitHubDataHealth } from '@/lib/github-data';

// Mock environment
const originalEnv = process.env;

describe('GitHub Data Access', () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getGitHubContributions', () => {
    it('should return fallback data when Redis is unavailable in test environment', async () => {
      // In test environment, Redis dynamic import returns null
      process.env.REDIS_URL = 'redis://localhost:6379';
      
      const result = await getGitHubContributions('dcyfr');
      
      // Expect fallback behavior (Redis not available in test env)
      expect(result.source).toBe('fallback-data');
      expect(result.contributions).toHaveLength(366); // 365 days + today
      expect(result.totalContributions).toBeGreaterThan(0);
      expect(result.warning).toContain('demo data');
    });

    it('should return fallback data when Redis URL is not configured', async () => {
      process.env.REDIS_URL = undefined;
      
      const result = await getGitHubContributions('dcyfr');
      
      expect(result.source).toBe('fallback-data');
      expect(result.contributions).toHaveLength(366); // 365 days + today
      expect(result.totalContributions).toBeGreaterThan(0);
      expect(result.warning).toContain('demo data');
    });

    it('should return fallback data for unsupported usernames', async () => {
      const result = await getGitHubContributions('unknown-user');
      
      expect(result.source).toBe('fallback-data');
      expect(result.warning).toContain('demo data');
    });

    it('should include required response fields', async () => {
      const result = await getGitHubContributions('dcyfr');
      
      // Verify structure of fallback response
      expect(result).toHaveProperty('contributions');
      expect(result).toHaveProperty('source');
      expect(result).toHaveProperty('totalContributions');
      expect(result).toHaveProperty('lastUpdated');
      expect(result).toHaveProperty('warning');
      
      // Verify data types
      expect(Array.isArray(result.contributions)).toBe(true);
      expect(typeof result.source).toBe('string');
      expect(typeof result.totalContributions).toBe('number');
      expect(typeof result.lastUpdated).toBe('string');
      
      // Verify contribution day structure
      if (result.contributions.length > 0) {
        const day = result.contributions[0];
        expect(day).toHaveProperty('date');
        expect(day).toHaveProperty('count');
        expect(typeof day.date).toBe('string');
        expect(typeof day.count).toBe('number');
      }
    });
  });

  describe('checkGitHubDataHealth', () => {
    it('should report cache unavailable in test environment', async () => {
      // In test environment, Redis dynamic import returns null
      process.env.REDIS_URL = 'redis://localhost:6379';
      
      const health = await checkGitHubDataHealth();
      
      // Expect cache unavailable (Redis not available in test env)
      expect(health.cacheAvailable).toBe(false);
      expect(health.dataFresh).toBe(false);
      expect(health.lastUpdated).toBeUndefined();
    });

    it('should report cache unavailable when Redis is not configured', async () => {
      process.env.REDIS_URL = undefined;
      
      const health = await checkGitHubDataHealth();
      
      expect(health.cacheAvailable).toBe(false);
      expect(health.dataFresh).toBe(false);
      expect(health.lastUpdated).toBeUndefined();
    });

    it('should return expected health check structure', async () => {
      const health = await checkGitHubDataHealth();
      
      // Verify structure
      expect(health).toHaveProperty('cacheAvailable');
      expect(health).toHaveProperty('dataFresh');
      
      // Verify types
      expect(typeof health.cacheAvailable).toBe('boolean');
      expect(typeof health.dataFresh).toBe('boolean');
    });
  });
});
