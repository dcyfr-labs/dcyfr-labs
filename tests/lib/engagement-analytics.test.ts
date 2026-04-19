import { describe, it, expect, beforeEach, vi } from 'vitest';
import { redis } from '@/lib/redis-client';
import {
  checkIpDeduplication,
  incrementLikes,
  decrementLikes,
  getLikes,
  getLikes24h,
} from '@/lib/engagement-analytics';

// Add missing mock methods to the global redis mock
beforeEach(() => {
  vi.clearAllMocks();
  // Ensure redis mock methods return defaults
  vi.mocked(redis.get).mockResolvedValue(null);
  vi.mocked(redis.set).mockResolvedValue('OK');
  vi.mocked(redis.incr).mockResolvedValue(1);
});

describe('checkIpDeduplication', () => {
  it('returns false for first action (no duplicate)', async () => {
    vi.mocked(redis.get).mockResolvedValueOnce(null);
    const result = await checkIpDeduplication('like', 'test-slug', '1.2.3.4');
    expect(result).toBe(false);
    expect(redis.set).toHaveBeenCalledWith('engagement:dedup:like:test-slug:1.2.3.4', '1', {
      ex: 86400,
    });
  });

  it('returns true for duplicate action', async () => {
    vi.mocked(redis.get).mockResolvedValueOnce('1');
    const result = await checkIpDeduplication('like', 'test-slug', '1.2.3.4');
    expect(result).toBe(true);
  });

  it('returns false for empty IP', async () => {
    const result = await checkIpDeduplication('like', 'test-slug', '');
    expect(result).toBe(false);
    expect(redis.get).not.toHaveBeenCalled();
  });

  it('returns false for unknown IP', async () => {
    const result = await checkIpDeduplication('like', 'test-slug', 'unknown');
    expect(result).toBe(false);
  });

  it('accepts custom TTL', async () => {
    vi.mocked(redis.get).mockResolvedValueOnce(null);
    await checkIpDeduplication('bookmark', 'slug', '5.6.7.8', 3600);
    expect(redis.set).toHaveBeenCalledWith(expect.any(String), '1', { ex: 3600 });
  });

  it('returns false on Redis error (fail-open)', async () => {
    vi.mocked(redis.get).mockRejectedValueOnce(new Error('conn'));
    const result = await checkIpDeduplication('like', 'slug', '1.1.1.1');
    expect(result).toBe(false);
  });
});

describe('incrementLikes', () => {
  it('increments and records history', async () => {
    vi.mocked(redis.incr).mockResolvedValueOnce(5);
    (redis as any).zAdd = vi.fn().mockResolvedValue(1);
    (redis as any).zRemRangeByScore = vi.fn().mockResolvedValue(0);

    const count = await incrementLikes('post', 'my-post');
    expect(count).toBe(5);
    expect(redis.incr).toHaveBeenCalledWith('likes:post:my-post');
  });

  it('returns null on error', async () => {
    vi.mocked(redis.incr).mockRejectedValueOnce(new Error('fail'));
    const count = await incrementLikes('post', 'err');
    expect(count).toBeNull();
  });
});

describe('decrementLikes', () => {
  it('decrements like count', async () => {
    (redis as any).decr = vi.fn().mockResolvedValue(3);
    const count = await decrementLikes('post', 'my-post');
    expect(count).toBe(3);
  });

  it('floors at zero', async () => {
    (redis as any).decr = vi.fn().mockResolvedValue(-1);
    vi.mocked(redis.set).mockResolvedValue('OK');
    const count = await decrementLikes('post', 'neg');
    expect(count).toBe(0);
  });

  it('returns null on error', async () => {
    (redis as any).decr = vi.fn().mockRejectedValue(new Error('fail'));
    const count = await decrementLikes('post', 'err');
    expect(count).toBeNull();
  });
});

describe('getLikes', () => {
  it('returns parsed count', async () => {
    vi.mocked(redis.get).mockResolvedValueOnce('42');
    expect(await getLikes('post', 'slug')).toBe(42);
  });

  it('returns 0 for null', async () => {
    vi.mocked(redis.get).mockResolvedValueOnce(null);
    expect(await getLikes('post', 'slug')).toBe(0);
  });

  it('returns null on error', async () => {
    vi.mocked(redis.get).mockRejectedValueOnce(new Error('fail'));
    expect(await getLikes('post', 'slug')).toBeNull();
  });
});

describe('getLikes24h', () => {
  it('returns count from sorted set', async () => {
    (redis as any).zCount = vi.fn().mockResolvedValue(7);
    expect(await getLikes24h('post', 'slug')).toBe(7);
  });

  it('returns null on error', async () => {
    (redis as any).zCount = vi.fn().mockRejectedValue(new Error('fail'));
    expect(await getLikes24h('post', 'err')).toBeNull();
  });
});
