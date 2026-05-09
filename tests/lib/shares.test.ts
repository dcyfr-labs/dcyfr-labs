import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

// Mock the Upstash redis singleton
vi.mock('@/lib/redis-client', () => ({
  redis: {
    get: vi.fn(),
    incr: vi.fn(),
    zAdd: vi.fn(),
    zCount: vi.fn(),
  },
}));

describe('Shares Utilities', () => {
  let mockRedis: any;

  beforeEach(async () => {
    vi.resetModules();

    // Get mock redis singleton
    const { redis } = await import('@/lib/redis-client');
    mockRedis = redis;

    // Reset all mock functions
    vi.mocked(mockRedis.get).mockReset();
    vi.mocked(mockRedis.incr).mockReset();
    vi.mocked(mockRedis.zAdd).mockReset();
    vi.mocked(mockRedis.zCount).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('incrementPostShares', () => {
    it('increments share count and returns new value', async () => {
      mockRedis.incr.mockResolvedValue(5);
      mockRedis.zAdd.mockResolvedValue(1);

      const { incrementPostShares } = await import('@/lib/shares');
      const result = await incrementPostShares('test-post-id');

      expect(result).toBe(5);
      expect(mockRedis.incr).toHaveBeenCalledWith('shares:post:test-post-id');
    });

    it('records share in history with timestamp', async () => {
      mockRedis.incr.mockResolvedValue(1);
      mockRedis.zAdd.mockResolvedValue(1);

      const { incrementPostShares } = await import('@/lib/shares');
      await incrementPostShares('test-post-id');

      expect(mockRedis.zAdd).toHaveBeenCalledWith(
        'shares:history:post:test-post-id',
        expect.objectContaining({
          score: expect.any(Number),
          value: expect.any(String),
        })
      );
    });

    it('returns null on Redis error', async () => {
      mockRedis.incr.mockRejectedValue(new Error('Redis error'));

      const { incrementPostShares } = await import('@/lib/shares');
      const result = await incrementPostShares('test-post-id');

      expect(result).toBeNull();
    });

    it('handles different post IDs', async () => {
      mockRedis.incr.mockResolvedValue(1);
      mockRedis.zAdd.mockResolvedValue(1);

      const { incrementPostShares } = await import('@/lib/shares');

      await incrementPostShares('post-1');
      expect(mockRedis.incr).toHaveBeenCalledWith('shares:post:post-1');

      await incrementPostShares('post-2');
      expect(mockRedis.incr).toHaveBeenCalledWith('shares:post:post-2');
    });
  });

  describe('getPostShares', () => {
    it('returns share count for existing post', async () => {
      mockRedis.get.mockResolvedValue('42');

      const { getPostShares } = await import('@/lib/shares');
      const result = await getPostShares('test-post-id');

      expect(result).toBe(42);
      expect(mockRedis.get).toHaveBeenCalledWith('shares:post:test-post-id');
    });

    it('returns null for non-existent post', async () => {
      mockRedis.get.mockResolvedValue(null);

      const { getPostShares } = await import('@/lib/shares');
      const result = await getPostShares('non-existent');

      expect(result).toBeNull();
    });

    it('returns null for invalid number values', async () => {
      mockRedis.get.mockResolvedValue('not-a-number');

      const { getPostShares } = await import('@/lib/shares');
      const result = await getPostShares('test-post-id');

      expect(result).toBeNull();
    });

    it('handles zero shares', async () => {
      mockRedis.get.mockResolvedValue('0');

      const { getPostShares } = await import('@/lib/shares');
      const result = await getPostShares('test-post-id');

      expect(result).toBe(0);
    });

    it('returns null on Redis error', async () => {
      mockRedis.get.mockRejectedValue(new Error('Redis error'));

      const { getPostShares } = await import('@/lib/shares');
      const result = await getPostShares('test-post-id');

      expect(result).toBeNull();
    });
  });

  describe('getPostShares24h', () => {
    it('returns share count for last 24 hours', async () => {
      mockRedis.zCount.mockResolvedValue(15);

      const { getPostShares24h } = await import('@/lib/shares');
      const result = await getPostShares24h('test-post-id');

      expect(result).toBe(15);
    });

    it('queries correct time range', async () => {
      mockRedis.zCount.mockResolvedValue(10);

      const now = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(now);

      const { getPostShares24h } = await import('@/lib/shares');
      await getPostShares24h('test-post-id');

      const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

      expect(mockRedis.zCount).toHaveBeenCalledWith(
        'shares:history:post:test-post-id',
        twentyFourHoursAgo,
        now
      );
    });

    it('returns 0 for posts with no recent shares', async () => {
      mockRedis.zCount.mockResolvedValue(0);

      const { getPostShares24h } = await import('@/lib/shares');
      const result = await getPostShares24h('test-post-id');

      expect(result).toBe(0);
    });

    it('returns null on Redis error', async () => {
      mockRedis.zCount.mockRejectedValue(new Error('Redis error'));

      const { getPostShares24h } = await import('@/lib/shares');
      const result = await getPostShares24h('test-post-id');

      expect(result).toBeNull();
    });
  });

  describe('Key Formatting', () => {
    it('uses correct key prefix for share counts', async () => {
      mockRedis.get.mockResolvedValue('1');

      const { getPostShares } = await import('@/lib/shares');
      await getPostShares('my-post-id');

      expect(mockRedis.get).toHaveBeenCalledWith('shares:post:my-post-id');
    });

    it('uses correct key prefix for share history', async () => {
      mockRedis.zCount.mockResolvedValue(1);

      const { getPostShares24h } = await import('@/lib/shares');
      await getPostShares24h('my-post-id');

      expect(mockRedis.zCount).toHaveBeenCalledWith(
        'shares:history:post:my-post-id',
        expect.any(Number),
        expect.any(Number)
      );
    });
  });
});
