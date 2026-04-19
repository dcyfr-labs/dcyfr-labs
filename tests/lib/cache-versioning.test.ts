import { describe, it, expect, beforeEach, vi } from 'vitest';
import { redis } from '@/lib/redis-client';
import { VersionedCache } from '@/lib/cache-versioning';

describe('VersionedCache', () => {
  let cache: VersionedCache<string[]>;

  beforeEach(() => {
    vi.clearAllMocks();
    cache = new VersionedCache({
      namespace: 'test',
      version: 1,
      ttl: 3600,
      description: 'test cache',
    });
  });

  describe('set', () => {
    it('stores versioned data with metadata', async () => {
      vi.mocked(redis.setEx).mockResolvedValueOnce('OK');
      const result = await cache.set('key1', ['a', 'b']);
      expect(result).toBe(true);
      expect(redis.setEx).toHaveBeenCalledWith(
        'test:v1:key1',
        3600,
        expect.stringContaining('"version":1')
      );
    });

    it('uses custom TTL when provided', async () => {
      vi.mocked(redis.setEx).mockResolvedValueOnce('OK');
      await cache.set('key1', ['x'], 600);
      expect(redis.setEx).toHaveBeenCalledWith('test:v1:key1', 600, expect.any(String));
    });

    it('returns false on Redis error', async () => {
      vi.mocked(redis.setEx).mockRejectedValueOnce(new Error('fail'));
      const result = await cache.set('key1', ['a']);
      expect(result).toBe(false);
    });
  });

  describe('get', () => {
    it('returns null on cache miss', async () => {
      vi.mocked(redis.get).mockResolvedValueOnce(null);
      expect(await cache.get('missing')).toBeNull();
    });

    it('returns data on cache hit with matching version', async () => {
      const cached = {
        metadata: {
          version: 1,
          cachedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 3600000).toISOString(),
          namespace: 'test',
        },
        data: ['cached'],
      };
      vi.mocked(redis.get).mockResolvedValueOnce(JSON.stringify(cached));
      expect(await cache.get('hit')).toEqual(['cached']);
    });

    it('returns data when Redis returns object directly', async () => {
      const cached = {
        metadata: {
          version: 1,
          cachedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 3600000).toISOString(),
          namespace: 'test',
        },
        data: ['obj'],
      };
      vi.mocked(redis.get).mockResolvedValueOnce(cached as any);
      expect(await cache.get('obj')).toEqual(['obj']);
    });

    it('returns null and deletes on version mismatch', async () => {
      const cached = {
        metadata: {
          version: 99,
          cachedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 3600000).toISOString(),
          namespace: 'test',
        },
        data: ['old'],
      };
      vi.mocked(redis.get).mockResolvedValueOnce(JSON.stringify(cached));
      vi.mocked(redis.del).mockResolvedValueOnce(1);
      expect(await cache.get('old')).toBeNull();
      expect(redis.del).toHaveBeenCalledWith('test:v1:old');
    });

    it('returns null and deletes on invalid JSON', async () => {
      vi.mocked(redis.get).mockResolvedValueOnce('{bad json');
      vi.mocked(redis.del).mockResolvedValueOnce(1);
      expect(await cache.get('corrupt')).toBeNull();
      expect(redis.del).toHaveBeenCalled();
    });

    it('returns null and deletes on invalid data type', async () => {
      vi.mocked(redis.get).mockResolvedValueOnce(42 as any);
      vi.mocked(redis.del).mockResolvedValueOnce(1);
      expect(await cache.get('bad')).toBeNull();
    });

    it('returns null when validation fails', async () => {
      const validatingCache = new VersionedCache<string[]>({
        namespace: 'test',
        version: 1,
        ttl: 3600,
        validate: (data): data is string[] => Array.isArray(data) && data.length > 0,
      });
      const cached = {
        metadata: {
          version: 1,
          cachedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 3600000).toISOString(),
          namespace: 'test',
        },
        data: [],
      };
      vi.mocked(redis.get).mockResolvedValueOnce(JSON.stringify(cached));
      vi.mocked(redis.del).mockResolvedValueOnce(1);
      expect(await validatingCache.get('empty')).toBeNull();
    });

    it('returns null on Redis error', async () => {
      vi.mocked(redis.get).mockRejectedValueOnce(new Error('conn'));
      expect(await cache.get('err')).toBeNull();
    });
  });

  describe('delete', () => {
    it('deletes key and returns true', async () => {
      vi.mocked(redis.del).mockResolvedValueOnce(1);
      expect(await cache.delete('key1')).toBe(true);
      expect(redis.del).toHaveBeenCalledWith('test:v1:key1');
    });

    it('returns false when key not found', async () => {
      vi.mocked(redis.del).mockResolvedValueOnce(0);
      expect(await cache.delete('missing')).toBe(false);
    });

    it('returns false on error', async () => {
      vi.mocked(redis.del).mockRejectedValueOnce(new Error('fail'));
      expect(await cache.delete('err')).toBe(false);
    });
  });

  describe('deleteAllVersions', () => {
    beforeEach(() => {
      // Add keys mock since it's not in the global redis mock
      (redis as any).keys = vi.fn();
    });

    it('deletes all matching keys', async () => {
      (redis as any).keys.mockResolvedValueOnce(['test:v1:k', 'test:v2:k']);
      vi.mocked(redis.del).mockResolvedValueOnce(2);
      expect(await cache.deleteAllVersions('k')).toBe(2);
    });

    it('returns 0 when no keys found', async () => {
      (redis as any).keys.mockResolvedValueOnce([]);
      expect(await cache.deleteAllVersions('none')).toBe(0);
    });

    it('returns 0 on error', async () => {
      (redis as any).keys.mockRejectedValueOnce(new Error('fail'));
      expect(await cache.deleteAllVersions('err')).toBe(0);
    });
  });
});
