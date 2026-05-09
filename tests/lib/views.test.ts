import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

// Mock the Upstash redis singleton
vi.mock('@/lib/redis-client', () => ({
  redis: {
    get: vi.fn(),
    incr: vi.fn(),
    zAdd: vi.fn(),
    zCount: vi.fn(),
    zRemRangeByScore: vi.fn(),
  },
}));

describe('Views Utilities', () => {
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
    vi.mocked(mockRedis.zRemRangeByScore).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('incrementPostViews', () => {
    it('increments view count and returns new value', async () => {
      mockRedis.incr.mockResolvedValue(10);
      mockRedis.zAdd.mockResolvedValue(1);
      mockRedis.zRemRangeByScore.mockResolvedValue(0);

      const { incrementPostViews } = await import('@/lib/views');
      const result = await incrementPostViews('test-post-id');

      expect(result).toBe(10);
      expect(mockRedis.incr).toHaveBeenCalledWith('views:post:test-post-id');
    });

    it('records view in history with timestamp', async () => {
      mockRedis.incr.mockResolvedValue(1);
      mockRedis.zAdd.mockResolvedValue(1);
      mockRedis.zRemRangeByScore.mockResolvedValue(0);

      const { incrementPostViews } = await import('@/lib/views');
      await incrementPostViews('test-post-id');

      expect(mockRedis.zAdd).toHaveBeenCalledWith(
        'views:history:post:test-post-id',
        expect.objectContaining({
          score: expect.any(Number),
          value: expect.any(String),
        })
      );
    });

    it('cleans up old views beyond 90 days', async () => {
      mockRedis.incr.mockResolvedValue(1);
      mockRedis.zAdd.mockResolvedValue(1);
      mockRedis.zRemRangeByScore.mockResolvedValue(5);

      const now = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(now);

      const { incrementPostViews } = await import('@/lib/views');
      await incrementPostViews('test-post-id');

      const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000;

      expect(mockRedis.zRemRangeByScore).toHaveBeenCalledWith(
        'views:history:post:test-post-id',
        '-inf',
        ninetyDaysAgo
      );
    });

    it('returns null on Redis error', async () => {
      mockRedis.incr.mockRejectedValue(new Error('Redis error'));

      const { incrementPostViews } = await import('@/lib/views');
      const result = await incrementPostViews('test-post-id');

      expect(result).toBeNull();
    });

    it('handles different post IDs', async () => {
      mockRedis.incr.mockResolvedValue(1);
      mockRedis.zAdd.mockResolvedValue(1);
      mockRedis.zRemRangeByScore.mockResolvedValue(0);

      const { incrementPostViews } = await import('@/lib/views');

      await incrementPostViews('post-1');
      expect(mockRedis.incr).toHaveBeenCalledWith('views:post:post-1');

      await incrementPostViews('post-2');
      expect(mockRedis.incr).toHaveBeenCalledWith('views:post:post-2');
    });
  });

  describe('getPostViews', () => {
    it('returns view count for existing post', async () => {
      mockRedis.get.mockResolvedValue('1337');

      const { getPostViews } = await import('@/lib/views');
      const result = await getPostViews('test-post-id');

      expect(result).toBe(1337);
      expect(mockRedis.get).toHaveBeenCalledWith('views:post:test-post-id');
    });

    it('returns null for non-existent post', async () => {
      mockRedis.get.mockResolvedValue(null);

      const { getPostViews } = await import('@/lib/views');
      const result = await getPostViews('non-existent');

      expect(result).toBeNull();
    });

    it('returns null for invalid number values', async () => {
      mockRedis.get.mockResolvedValue('not-a-number');

      const { getPostViews } = await import('@/lib/views');
      const result = await getPostViews('test-post-id');

      expect(result).toBeNull();
    });

    it('handles zero views', async () => {
      mockRedis.get.mockResolvedValue('0');

      const { getPostViews } = await import('@/lib/views');
      const result = await getPostViews('test-post-id');

      expect(result).toBe(0);
    });

    it('returns null on Redis error', async () => {
      mockRedis.get.mockRejectedValue(new Error('Redis error'));

      const { getPostViews } = await import('@/lib/views');
      const result = await getPostViews('test-post-id');

      expect(result).toBeNull();
    });

    it('handles large view counts', async () => {
      mockRedis.get.mockResolvedValue('999999');

      const { getPostViews } = await import('@/lib/views');
      const result = await getPostViews('popular-post');

      expect(result).toBe(999999);
    });
  });

  describe('getPostViews24h', () => {
    it('returns view count for last 24 hours', async () => {
      mockRedis.zCount.mockResolvedValue(42);

      const { getPostViews24h } = await import('@/lib/views');
      const result = await getPostViews24h('test-post-id');

      expect(result).toBe(42);
    });

    it('queries correct time range', async () => {
      mockRedis.zCount.mockResolvedValue(10);

      const now = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(now);

      const { getPostViews24h } = await import('@/lib/views');
      await getPostViews24h('test-post-id');

      const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

      expect(mockRedis.zCount).toHaveBeenCalledWith(
        'views:history:post:test-post-id',
        twentyFourHoursAgo,
        now
      );
    });

    it('returns 0 for posts with no recent views', async () => {
      mockRedis.zCount.mockResolvedValue(0);

      const { getPostViews24h } = await import('@/lib/views');
      const result = await getPostViews24h('test-post-id');

      expect(result).toBe(0);
    });

    it('returns null on Redis error', async () => {
      mockRedis.zCount.mockRejectedValue(new Error('Redis error'));

      const { getPostViews24h } = await import('@/lib/views');
      const result = await getPostViews24h('test-post-id');

      expect(result).toBeNull();
    });
  });

  describe('Key Formatting', () => {
    it('uses correct key prefix for view counts', async () => {
      mockRedis.get.mockResolvedValue('1');

      const { getPostViews } = await import('@/lib/views');
      await getPostViews('my-post-id');

      expect(mockRedis.get).toHaveBeenCalledWith('views:post:my-post-id');
    });

    it('uses correct key prefix for view history', async () => {
      mockRedis.zCount.mockResolvedValue(1);

      const { getPostViews24h } = await import('@/lib/views');
      await getPostViews24h('my-post-id');

      expect(mockRedis.zCount).toHaveBeenCalledWith(
        'views:history:post:my-post-id',
        expect.any(Number),
        expect.any(Number)
      );
    });
  });

  describe('Time Calculations', () => {
    it('correctly calculates 24-hour window', async () => {
      mockRedis.zCount.mockResolvedValue(5);

      const fixedTime = 1700000000000; // Fixed timestamp
      vi.spyOn(Date, 'now').mockReturnValue(fixedTime);

      const { getPostViews24h } = await import('@/lib/views');
      await getPostViews24h('test-post-id');

      const expectedStart = fixedTime - 24 * 60 * 60 * 1000;

      expect(mockRedis.zCount).toHaveBeenCalledWith(
        'views:history:post:test-post-id',
        expectedStart,
        fixedTime
      );
    });

    it('cleanup removes views older than 90 days', async () => {
      mockRedis.incr.mockResolvedValue(1);
      mockRedis.zAdd.mockResolvedValue(1);
      mockRedis.zRemRangeByScore.mockResolvedValue(3);

      const fixedTime = 1700000000000;
      vi.spyOn(Date, 'now').mockReturnValue(fixedTime);

      const { incrementPostViews } = await import('@/lib/views');
      await incrementPostViews('test-post-id');

      const expectedCutoff = fixedTime - 90 * 24 * 60 * 60 * 1000;

      expect(mockRedis.zRemRangeByScore).toHaveBeenCalledWith(
        'views:history:post:test-post-id',
        '-inf',
        expectedCutoff
      );
    });
  });
});
