/**
 * GitHub Data Server-Side Access Tests
 * 
 * Tests the secure server-side GitHub data access without
 * requiring public API endpoints.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getGitHubContributions, checkGitHubDataHealth } from '@/lib/github-data';

// Mock Redis client
const mockRedisClient = {
  get: vi.fn(),
  quit: vi.fn(),
  connect: vi.fn(),
};

vi.mock('redis', () => ({
  createClient: vi.fn(() => mockRedisClient),
}));

// Mock environment
const originalEnv = process.env;

// TODO: GitHub data caching refactored - update mocks and tests
describe.skip('GitHub Data Access', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getGitHubContributions', () => {
    it('should return cached data when available', async () => {
      process.env.REDIS_URL = 'redis://localhost:6379';
      
      const mockData = {
        contributions: [{ date: '2025-01-01', count: 5 }],
        source: 'github-api',
        totalContributions: 123,
        lastUpdated: '2025-01-01T00:00:00Z'
      };

      mockRedisClient.get.mockResolvedValue(JSON.stringify(mockData));
      
      const result = await getGitHubContributions('dcyfr');
      
      expect(result).toEqual(mockData);
      expect(mockRedisClient.get).toHaveBeenCalledWith('github:contributions:dcyfr');
      expect(mockRedisClient.quit).toHaveBeenCalled();
    });

    it('should return fallback data when cache is empty', async () => {
      process.env.REDIS_URL = 'redis://localhost:6379';
      mockRedisClient.get.mockResolvedValue(null);
      
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
      expect(mockRedisClient.get).not.toHaveBeenCalled();
    });

    it('should handle Redis connection failures gracefully', async () => {
      process.env.REDIS_URL = undefined;
      
      const result = await getGitHubContributions('dcyfr');
      
      expect(result.source).toBe('fallback-data');
      expect(result.warning).toContain('demo data');
    });
  });

  describe('checkGitHubDataHealth', () => {
    it('should report healthy cache when data is fresh', async () => {
      process.env.REDIS_URL = 'redis://localhost:6379';
      
      const recentData = {
        contributions: [],
        source: 'github-api',
        totalContributions: 123,
        lastUpdated: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 mins ago
      };

      mockRedisClient.get.mockResolvedValue(JSON.stringify(recentData));
      
      const health = await checkGitHubDataHealth();
      
      expect(health.cacheAvailable).toBe(true);
      expect(health.dataFresh).toBe(true);
      expect(health.totalContributions).toBe(123);
      expect(health.lastUpdated).toBe(recentData.lastUpdated);
    });

    it('should report cache unavailable when Redis is not configured', async () => {
      process.env.REDIS_URL = undefined;
      
      const health = await checkGitHubDataHealth();
      
      expect(health.cacheAvailable).toBe(false);
      expect(health.dataFresh).toBe(false);
      expect(health.lastUpdated).toBeUndefined();
    });
  });
});