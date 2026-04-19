import { describe, it, expect, beforeEach, vi } from 'vitest';
import { redis } from '@/lib/redis-client';

// Mock Sentry
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  addBreadcrumb: vi.fn(),
}));

import {
  storeHealthReport,
  getLatestHealthReport,
  getServerHistory,
  calculateUptime,
  getRecentIncidents,
  type McpHealthReport,
  type McpServerStatus,
} from '@/lib/mcp-health-tracker';

beforeEach(() => {
  vi.clearAllMocks();
  // Set up zAdd and zRangeByScore on redis mock
  (redis as any).zAdd = vi.fn().mockResolvedValue(1);
  (redis as any).zRemRangeByScore = vi.fn().mockResolvedValue(0);
  (redis as any).zRangeByScore = vi.fn().mockResolvedValue([]);
});

const makeReport = (servers: Partial<McpServerStatus>[] = []): McpHealthReport => ({
  timestamp: new Date().toISOString(),
  servers: servers.map((s) => ({
    name: s.name ?? 'TestServer',
    status: s.status ?? 'ok',
    responseTimeMs: s.responseTimeMs ?? 100,
    timestamp: s.timestamp ?? new Date().toISOString(),
    ...s,
  })) as McpServerStatus[],
  summary: {
    total: servers.length,
    ok: servers.filter((s) => (s.status ?? 'ok') === 'ok').length,
    degraded: servers.filter((s) => s.status === 'degraded').length,
    down: servers.filter((s) => s.status === 'down').length,
  },
});

describe('storeHealthReport', () => {
  it('stores report in Redis', async () => {
    vi.mocked(redis.set).mockResolvedValueOnce('OK');
    vi.mocked(redis.expire).mockResolvedValue(1);

    const report = makeReport([{ name: 'Server1' }]);
    await storeHealthReport(report);

    expect(redis.set).toHaveBeenCalledWith(
      'mcp:health:latest',
      expect.stringContaining('Server1'),
      expect.any(Object)
    );
  });

  it('stores per-server history', async () => {
    vi.mocked(redis.set).mockResolvedValueOnce('OK');
    vi.mocked(redis.expire).mockResolvedValue(1);

    const report = makeReport([{ name: 'A' }, { name: 'B' }]);
    await storeHealthReport(report);

    expect((redis as any).zAdd).toHaveBeenCalledTimes(2);
    expect((redis as any).zRemRangeByScore).toHaveBeenCalledTimes(2);
  });

  it('throws on Redis failure', async () => {
    vi.mocked(redis.set).mockRejectedValueOnce(new Error('conn'));
    const report = makeReport([{ name: 'X' }]);
    await expect(storeHealthReport(report)).rejects.toThrow('conn');
  });
});

describe('getLatestHealthReport', () => {
  it('returns parsed report', async () => {
    const report = makeReport([{ name: 'S1' }]);
    vi.mocked(redis.get).mockResolvedValueOnce(JSON.stringify(report));
    const result = await getLatestHealthReport();
    expect(result?.servers[0].name).toBe('S1');
  });

  it('returns null on miss', async () => {
    vi.mocked(redis.get).mockResolvedValueOnce(null);
    expect(await getLatestHealthReport()).toBeNull();
  });

  it('returns null on error', async () => {
    vi.mocked(redis.get).mockRejectedValueOnce(new Error('fail'));
    expect(await getLatestHealthReport()).toBeNull();
  });
});

describe('getServerHistory', () => {
  it('returns parsed server statuses', async () => {
    const status: McpServerStatus = {
      name: 'S1',
      status: 'ok',
      responseTimeMs: 50,
      timestamp: new Date().toISOString(),
    };
    (redis as any).zRangeByScore.mockResolvedValueOnce([JSON.stringify(status)]);
    const result = await getServerHistory('S1', 7);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('S1');
  });

  it('returns empty array on error', async () => {
    (redis as any).zRangeByScore.mockRejectedValueOnce(new Error('fail'));
    expect(await getServerHistory('X')).toEqual([]);
  });

  it('returns empty for null result', async () => {
    (redis as any).zRangeByScore.mockResolvedValueOnce(null);
    expect(await getServerHistory('Y')).toEqual([]);
  });
});

describe('calculateUptime', () => {
  it('returns 100% when no history', async () => {
    (redis as any).zRangeByScore.mockResolvedValueOnce([]);
    const metrics = await calculateUptime('S1');
    expect(metrics.percentage).toBe(100);
    expect(metrics.totalChecks).toBe(0);
  });

  it('calculates correct percentage', async () => {
    const statuses = [
      { name: 'S', status: 'ok', responseTimeMs: 50, timestamp: new Date().toISOString() },
      { name: 'S', status: 'ok', responseTimeMs: 60, timestamp: new Date().toISOString() },
      {
        name: 'S',
        status: 'down',
        responseTimeMs: 5000,
        timestamp: new Date().toISOString(),
        error: 'timeout',
      },
    ];
    (redis as any).zRangeByScore.mockResolvedValueOnce(statuses.map((s) => JSON.stringify(s)));
    const metrics = await calculateUptime('S');
    expect(metrics.percentage).toBeCloseTo(66.67, 1);
    expect(metrics.totalChecks).toBe(3);
    expect(metrics.okChecks).toBe(2);
    expect(metrics.lastIncident).not.toBeNull();
  });
});

describe('getRecentIncidents', () => {
  it('returns empty when no latest report', async () => {
    vi.mocked(redis.get).mockResolvedValueOnce(null);
    expect(await getRecentIncidents()).toEqual([]);
  });

  it('collects incidents from server histories', async () => {
    const report = makeReport([{ name: 'S1' }]);
    vi.mocked(redis.get).mockResolvedValueOnce(JSON.stringify(report));

    const failure = {
      name: 'S1',
      status: 'down',
      responseTimeMs: 0,
      timestamp: new Date().toISOString(),
      error: 'Connection refused',
    };
    (redis as any).zRangeByScore.mockResolvedValueOnce([JSON.stringify(failure)]);

    const incidents = await getRecentIncidents(7, 10);
    expect(incidents).toHaveLength(1);
    expect(incidents[0].error).toBe('Connection refused');
  });
});
