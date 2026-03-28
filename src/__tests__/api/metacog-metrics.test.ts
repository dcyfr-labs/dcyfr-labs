/**
 * GET /api/metacog/metrics — dashboard integration hook tests
 * TLP:AMBER - Internal Use Only
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { GET, registerMetacogMetrics } from '@/app/api/metacog/metrics/route';
import { NextRequest } from 'next/server';

vi.mock('@/lib/api/api-security', () => ({
  blockExternalAccess: () => null, // allow all in tests
}));

function makeRequest(url = 'http://localhost:3000/api/metacog/metrics') {
  return new NextRequest(url, { method: 'GET' });
}

afterEach(() => {
  // Reset env var
  delete process.env['ENABLE_METACOG_RUNTIME'];
});

describe('GET /api/metacog/metrics', () => {
  it('returns enabled=false and metrics=null when feature flag is off', async () => {
    delete process.env['ENABLE_METACOG_RUNTIME'];
    const res = await GET(makeRequest());
    const body = (await res.json()) as { enabled: boolean; metrics: null; timestamp: string };
    expect(res.status).toBe(200);
    expect(body.enabled).toBe(false);
    expect(body.metrics).toBeNull();
    expect(body.timestamp).toMatch(/^\d{4}-/);
  });

  it('returns enabled=true when ENABLE_METACOG_RUNTIME=true', async () => {
    process.env['ENABLE_METACOG_RUNTIME'] = 'true';
    const res = await GET(makeRequest());
    const body = (await res.json()) as { enabled: boolean; metrics: unknown };
    expect(body.enabled).toBe(true);
  });

  it('returns registered metrics snapshot when enabled and metrics registered', async () => {
    process.env['ENABLE_METACOG_RUNTIME'] = 'true';
    registerMetacogMetrics({
      proposals_submitted: 5,
      proposals_evaluated_pass: 4,
      proposals_evaluated_fail: 1,
      proposals_approved: 3,
      proposals_applied: 2,
      proposals_rolled_back: 1,
      approval_ratio: 0.6,
      rollback_rate: 0.5,
    });

    const res = await GET(makeRequest());
    const body = (await res.json()) as {
      metrics: { proposals_submitted: number; rollback_rate: number };
    };
    expect(body.metrics?.proposals_submitted).toBe(5);
    expect(body.metrics?.rollback_rate).toBe(0.5);
  });

  it('sets X-Metacog-Enabled header', async () => {
    process.env['ENABLE_METACOG_RUNTIME'] = 'true';
    const res = await GET(makeRequest());
    expect(res.headers.get('X-Metacog-Enabled')).toBe('true');
  });

  it('sets Cache-Control: no-store', async () => {
    const res = await GET(makeRequest());
    expect(res.headers.get('Cache-Control')).toBe('no-store');
  });
});
