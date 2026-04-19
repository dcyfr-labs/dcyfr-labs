import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock dev-logger before import
vi.mock('@/lib/dev-logger', () => ({
  devLogger: {
    api: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    trackAsync: vi.fn((_id: string, fn: () => Promise<unknown>) => fn()),
  },
}));

import { withApiMonitoring, monitorAsync, apiMetrics } from '@/lib/api/api-monitor';

describe('apiMetrics', () => {
  beforeEach(() => {
    apiMetrics.clear();
  });

  it('records and retrieves metrics for a route', () => {
    apiMetrics.recordRequest('/api/test', 200, false, false);
    apiMetrics.recordRequest('/api/test', 500, true, true);

    const metrics = apiMetrics.getMetrics('/api/test') as Record<string, unknown>;
    expect(metrics.count).toBe(2);
    expect(metrics.errors).toBe(1);
    expect(metrics.slowRequests).toBe(1);
    expect(metrics.avgDuration).toBe(350);
    expect(metrics.errorRate).toBe(50);
    expect(metrics.slowRate).toBe(50);
  });

  it('returns empty for unknown route', () => {
    expect(apiMetrics.getMetrics('/unknown')).toEqual({});
  });

  it('returns all metrics when no route specified', () => {
    apiMetrics.recordRequest('/api/a', 100, false, false);
    apiMetrics.recordRequest('/api/b', 200, true, false);

    const all = apiMetrics.getMetrics();
    expect(all).toHaveProperty('/api/a');
    expect(all).toHaveProperty('/api/b');
  });

  it('clears all metrics', () => {
    apiMetrics.recordRequest('/api/test', 100, false, false);
    apiMetrics.clear();
    expect(apiMetrics.getMetrics()).toEqual({});
  });
});

describe('withApiMonitoring', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns the handler directly in non-dev mode', () => {
    vi.stubEnv('NODE_ENV', 'production');
    // Need to re-import to pick up the new env, but since isDev is captured at module load,
    // we test the behavior through the function
    const handler = async (req: Request) => new Response('ok');
    const wrapped = withApiMonitoring(handler, 'test');
    // In production, withApiMonitoring returns the handler as-is
    // Since isDev is set at module level, and test env isn't 'development',
    // it should return handler directly
    expect(wrapped).toBe(handler);
  });
});

describe('monitorAsync', () => {
  it('returns the operation result', async () => {
    const result = await monitorAsync(async () => 42, 'test-op');
    expect(result).toBe(42);
  });

  it('propagates errors', async () => {
    await expect(
      monitorAsync(async () => {
        throw new Error('fail');
      }, 'test-op')
    ).rejects.toThrow('fail');
  });
});
