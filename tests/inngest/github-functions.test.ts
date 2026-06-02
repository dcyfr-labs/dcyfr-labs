import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock the API guardrails seam so we can assert recordApiCall is invoked
// on a successful GitHub fetch without touching Redis.
vi.mock('@/lib/api', () => ({
  recordApiCall: vi.fn(async () => {}),
}));

import { fetchGitHubContributions } from '@/inngest/github-functions';
import { recordApiCall } from '@/lib/api';

function makeOkResponse(totalContributions = 42): Response {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      data: {
        user: {
          contributionsCollection: {
            contributionCalendar: {
              totalContributions,
              weeks: [
                {
                  contributionDays: [
                    { date: '2026-05-01', contributionCount: 1 },
                    { date: '2026-05-02', contributionCount: 2 },
                  ],
                },
              ],
            },
          },
        },
      },
    }),
    headers: new Map<string, string>(),
  } as unknown as Response;
}

describe('fetchGitHubContributions instrumentation', () => {
  let origFetch: typeof global.fetch;

  beforeEach(() => {
    origFetch = global.fetch;
    vi.mocked(recordApiCall).mockClear();
  });

  afterEach(() => {
    global.fetch = origFetch;
    vi.restoreAllMocks();
  });

  it('records a github API call after a successful contributions fetch', async () => {
    global.fetch = vi.fn(async () => makeOkResponse(99)) as unknown as typeof global.fetch;

    const result = await fetchGitHubContributions();

    expect(result).not.toBeNull();
    expect(result?.totalContributions).toBe(99);
    expect(recordApiCall).toHaveBeenCalledTimes(1);
    expect(recordApiCall).toHaveBeenCalledWith('github', expect.stringContaining('contributions'));
  });

  it('does NOT record a github API call when the fetch fails', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    global.fetch = vi.fn(async () => {
      throw new Error('network down');
    }) as unknown as typeof global.fetch;

    const result = await fetchGitHubContributions();

    expect(result).toBeNull();
    expect(recordApiCall).not.toHaveBeenCalled();
    errSpy.mockRestore();
  });

  it('does NOT record a github API call on a non-ok HTTP response', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    global.fetch = vi.fn(
      async () =>
        ({
          ok: false,
          status: 401,
          json: async () => ({}),
          headers: new Map<string, string>(),
        }) as unknown as Response
    ) as unknown as typeof global.fetch;

    const result = await fetchGitHubContributions();

    expect(result).toBeNull();
    expect(recordApiCall).not.toHaveBeenCalled();
    errSpy.mockRestore();
  });
});
