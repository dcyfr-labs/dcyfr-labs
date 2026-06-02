import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock the API guardrails seam so we can assert recordApiCall is invoked
// once per successful package advisory fetch without touching Redis.
vi.mock('@/lib/api', () => ({
  recordApiCall: vi.fn(async () => {}),
}));

import { fetchGhsaAdvisories } from '@/inngest/security-functions';
import { recordApiCall } from '@/lib/api';

describe('fetchGhsaAdvisories instrumentation', () => {
  let origFetch: typeof global.fetch;

  beforeEach(() => {
    origFetch = global.fetch;
    vi.mocked(recordApiCall).mockClear();
  });

  afterEach(() => {
    global.fetch = origFetch;
    vi.restoreAllMocks();
  });

  it('records one github API call per successful advisory fetch', async () => {
    const okBody = [{ ghsa_id: 'GHSA-test', severity: 'high' }];
    global.fetch = vi.fn(
      async () =>
        ({
          ok: true,
          status: 200,
          json: async () => okBody,
          headers: new Map<string, string>(),
        }) as unknown as Response
    ) as unknown as typeof global.fetch;

    const result = await fetchGhsaAdvisories('next');

    expect(result).toEqual(okBody);
    expect(recordApiCall).toHaveBeenCalledTimes(1);
    expect(recordApiCall).toHaveBeenCalledWith('github', expect.stringContaining('advisories'));
  });

  it('does NOT record on a 4xx response (no retry, empty result)', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    global.fetch = vi.fn(
      async () =>
        ({
          ok: false,
          status: 422,
          text: async () => 'Validation failed',
          headers: new Map<string, string>(),
        }) as unknown as Response
    ) as unknown as typeof global.fetch;

    const result = await fetchGhsaAdvisories('next');

    expect(result).toEqual([]);
    expect(recordApiCall).not.toHaveBeenCalled();
    errSpy.mockRestore();
  });

  it('records exactly once even when an earlier attempt returned a 5xx', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const okBody = [{ ghsa_id: 'GHSA-x', severity: 'critical' }];
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Server error',
        headers: new Map<string, string>(),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => okBody,
        headers: new Map<string, string>(),
      });
    global.fetch = fetchMock as unknown as typeof global.fetch;

    const result = await fetchGhsaAdvisories('react');

    expect(result).toEqual(okBody);
    expect(recordApiCall).toHaveBeenCalledTimes(1);
    warnSpy.mockRestore();
    errSpy.mockRestore();
  });
});
