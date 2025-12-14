import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { fetchGhsaAdvisories } from '../security-functions';

describe('fetchGhsaAdvisories', () => {
  let origFetch: typeof global.fetch;

  beforeEach(() => {
    origFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = origFetch;
    vi.restoreAllMocks();
  });

  it('returns empty array and logs on 422', async () => {
    const res = {
      ok: false,
      status: 422,
      text: async () => 'Validation failed',
      headers: new Map<string, string>(),
    } as unknown as Response;

    global.fetch = vi.fn(async () => res) as unknown as typeof global.fetch;

    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await fetchGhsaAdvisories('next');

    expect(result).toEqual([]);
    expect(errSpy).toHaveBeenCalled();
  });

  it('retries on 500 and succeeds', async () => {
    const okBody = [{ ghsa_id: 'GHSA-test', severity: 'high' }];

    const res500 = {
      ok: false,
      status: 500,
      text: async () => 'Server error',
      headers: new Map<string, string>(),
    } as unknown as Response;

    const res200 = {
      ok: true,
      status: 200,
      json: async () => okBody,
      headers: new Map<string, string>(),
    } as unknown as Response;

    const fetchMock = vi.fn()
      .mockResolvedValueOnce(res500)
      .mockResolvedValueOnce(res200);

    global.fetch = fetchMock as unknown as typeof global.fetch;

    const result = await fetchGhsaAdvisories('react');

    expect(result).toEqual(okBody);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
