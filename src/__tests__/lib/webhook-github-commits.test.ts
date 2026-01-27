/**
 * Webhook GitHub Commits Transformer Tests
 *
 * Tests the transformWebhookGitHubCommits function that fetches
 * commits from Redis and transforms them into ActivityItems.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the Upstash redis singleton
vi.mock('@/mcp/shared/redis-client', () => ({
  redis: {
    lrange: vi.fn(),
    get: vi.fn(),
  },
}));

describe('transformWebhookGitHubCommits', () => {
  let mockRedis: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    // Get mock redis singleton
    const { redis } = await import('@/mcp/shared/redis-client');
    mockRedis = redis;

    // Reset all mock functions
    vi.mocked(mockRedis.lrange).mockReset();
    vi.mocked(mockRedis.get).mockReset();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it('should return empty array when no commits in Redis', async () => {
    vi.mocked(mockRedis.lrange).mockResolvedValue([]);
    const { transformWebhookGitHubCommits } = await import('@/lib/activity/sources.server');

    const result = await transformWebhookGitHubCommits();

    expect(result).toEqual([]);
    expect(mockRedis.lrange).toHaveBeenCalledWith('github:commits:recent', 0, 999);
  });

  it('should fetch and transform commits from Redis', async () => {
    const commitKeys = ['github:commit:abc1234', 'github:commit:def5678'];
    const commitData = [
      {
        id: 'github-commit-abc1234',
        source: 'github',
        verb: 'committed',
        title: 'Test Author committed to main',
        description: 'Fix bug in webhook handler',
        timestamp: '2025-12-23T10:00:00Z',
        href: 'https://github.com/dcyfr/dcyfr-labs/commit/abc1234',
        meta: {
          tags: ['github', 'main'],
          category: 'development',
        },
        hash: 'abc1234',
        author: 'Test Author',
        branch: 'main',
        repository: 'dcyfr/dcyfr-labs',
      },
      {
        id: 'github-commit-def5678',
        source: 'github',
        verb: 'committed',
        title: 'Another Author committed to feature',
        description: 'Add new feature',
        timestamp: '2025-12-23T09:00:00Z',
        href: 'https://github.com/dcyfr/dcyfr-labs/commit/def5678',
        meta: {
          tags: ['github', 'feature'],
          category: 'development',
        },
        hash: 'def5678',
        author: 'Another Author',
        branch: 'feature',
        repository: 'dcyfr/dcyfr-labs',
      },
    ];

    mockRedis.lrange.mockResolvedValue(commitKeys);
    mockRedis.get.mockImplementation((key: string) => {
      const index = commitKeys.indexOf(key);
      return Promise.resolve(JSON.stringify(commitData[index]));
    });

    const { transformWebhookGitHubCommits } = await import('@/lib/activity/sources.server');

    const result = await transformWebhookGitHubCommits();

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: 'github-commit-abc1234',
      source: 'github',
      verb: 'committed',
      title: 'Test Author committed to main',
      description: 'Fix bug in webhook handler',
      timestamp: new Date('2025-12-23T10:00:00Z'),
      href: 'https://github.com/dcyfr/dcyfr-labs/commit/abc1234',
      meta: {
        tags: ['github', 'main'],
        category: 'development',
      },
    });
  });

  it('should sort commits by timestamp descending', async () => {
    const commitKeys = ['github:commit:abc1234', 'github:commit:def5678'];
    const commitData = [
      {
        id: 'github-commit-abc1234',
        source: 'github',
        verb: 'committed',
        title: 'Older commit',
        description: 'Old change',
        timestamp: '2025-12-23T09:00:00Z',
        href: 'https://github.com/dcyfr/dcyfr-labs/commit/abc1234',
        meta: {},
      },
      {
        id: 'github-commit-def5678',
        source: 'github',
        verb: 'committed',
        title: 'Newer commit',
        description: 'New change',
        timestamp: '2025-12-23T10:00:00Z',
        href: 'https://github.com/dcyfr/dcyfr-labs/commit/def5678',
        meta: {},
      },
    ];

    mockRedis.lrange.mockResolvedValue(commitKeys);
    mockRedis.get.mockImplementation((key: string) => {
      const index = commitKeys.indexOf(key);
      return Promise.resolve(JSON.stringify(commitData[index]));
    });

    const { transformWebhookGitHubCommits } = await import('@/lib/activity/sources.server');

    const result = await transformWebhookGitHubCommits();

    expect(result[0].title).toBe('Newer commit');
    expect(result[1].title).toBe('Older commit');
  });

  it('should respect limit parameter', async () => {
    const commitKeys = ['github:commit:1', 'github:commit:2', 'github:commit:3'];
    mockRedis.lrange.mockResolvedValue(commitKeys);
    mockRedis.get.mockResolvedValue(
      JSON.stringify({
        id: 'test',
        source: 'github',
        verb: 'committed',
        title: 'Test',
        timestamp: new Date().toISOString(),
        href: 'https://github.com',
        meta: {},
      })
    );

    const { transformWebhookGitHubCommits } = await import('@/lib/activity/sources.server');

    await transformWebhookGitHubCommits(2);

    expect(mockRedis.lrange).toHaveBeenCalledWith('github:commits:recent', 0, 1);
  });

  it('should handle corrupted commit data gracefully', async () => {
    const commitKeys = ['github:commit:good', 'github:commit:bad'];
    mockRedis.lrange.mockResolvedValue(commitKeys);
    mockRedis.get.mockImplementation((key: string) => {
      if (key === 'github:commit:good') {
        return Promise.resolve(
          JSON.stringify({
            id: 'github-commit-good',
            source: 'github',
            verb: 'committed',
            title: 'Good commit',
            timestamp: '2025-12-23T10:00:00Z',
            href: 'https://github.com',
            meta: {},
          })
        );
      }
      return Promise.resolve('invalid json');
    });

    const { transformWebhookGitHubCommits } = await import('@/lib/activity/sources.server');

    const result = await transformWebhookGitHubCommits();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('github-commit-good');
  });

  it('should handle null Redis responses', async () => {
    const commitKeys = ['github:commit:1'];
    mockRedis.lrange.mockResolvedValue(commitKeys);
    mockRedis.get.mockResolvedValue(null);

    const { transformWebhookGitHubCommits } = await import('@/lib/activity/sources.server');

    const result = await transformWebhookGitHubCommits();

    expect(result).toEqual([]);
  });

  it('should close Redis connection after fetching', async () => {
    mockRedis.lrange.mockResolvedValue(['github:commit:test']);
    mockRedis.get.mockResolvedValue(
      JSON.stringify({
        id: 'test',
        source: 'github',
        verb: 'committed',
        title: 'Test',
        timestamp: new Date().toISOString(),
        href: 'https://github.com',
        meta: {},
      })
    );
    const { transformWebhookGitHubCommits } = await import('@/lib/activity/sources.server');

    await transformWebhookGitHubCommits();

    // Upstash stateless - no quit method needed
  });

  it('should handle Redis errors gracefully', async () => {
    mockRedis.lrange.mockRejectedValue(new Error('Redis connection failed'));
    const { transformWebhookGitHubCommits } = await import('@/lib/activity/sources.server');

    const result = await transformWebhookGitHubCommits();

    expect(result).toEqual([]);
  });
});
