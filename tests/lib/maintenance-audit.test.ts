/**
 * Tests for the maintenance audit snapshot store — persistence, retrieval,
 * and graceful handling of missing / malformed Redis data.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/redis-client', () => ({
  redis: { get: vi.fn(), set: vi.fn() },
}));

import { redis } from '@/lib/redis-client';
import {
  persistDependencyAudit,
  getDependencyAudit,
  getDesignTokenAudit,
  type DependencyAuditSnapshot,
} from '@/lib/maintenance-audit';

const sampleSnapshot: DependencyAuditSnapshot = {
  timestamp: '2026-05-22T00:00:00.000Z',
  branch: 'main',
  vulnerabilities: { critical: 1, high: 2, moderate: 3, low: 4, info: 0, total: 10 },
  totalDependencies: 500,
};

describe('maintenance audit store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('persists a snapshot as JSON with a TTL', async () => {
    vi.mocked(redis.set).mockResolvedValue('OK');

    await persistDependencyAudit(sampleSnapshot);

    expect(redis.set).toHaveBeenCalledTimes(1);
    const [key, value, opts] = vi.mocked(redis.set).mock.calls[0];
    expect(key).toBe('maintenance:audit:dependencies');
    expect(JSON.parse(value as string)).toEqual(sampleSnapshot);
    expect(opts).toMatchObject({ ex: expect.any(Number) });
  });

  it('reads back a snapshot stored as a JSON string', async () => {
    vi.mocked(redis.get).mockResolvedValue(JSON.stringify(sampleSnapshot));

    expect(await getDependencyAudit()).toEqual(sampleSnapshot);
  });

  it('reads back a snapshot already deserialized by the Redis client', async () => {
    // Upstash auto-parses JSON-shaped values — handle the object form too.
    vi.mocked(redis.get).mockResolvedValue(sampleSnapshot);

    expect(await getDependencyAudit()).toEqual(sampleSnapshot);
  });

  it('returns null when no snapshot has been stored', async () => {
    vi.mocked(redis.get).mockResolvedValue(null);

    expect(await getDesignTokenAudit()).toBeNull();
  });

  it('returns null when the stored value is unparseable', async () => {
    vi.mocked(redis.get).mockResolvedValue('{not valid json');

    expect(await getDependencyAudit()).toBeNull();
  });

  it('does not throw when Redis rejects a write', async () => {
    vi.mocked(redis.set).mockRejectedValue(new Error('redis down'));

    await expect(persistDependencyAudit(sampleSnapshot)).resolves.toBeUndefined();
  });
});
