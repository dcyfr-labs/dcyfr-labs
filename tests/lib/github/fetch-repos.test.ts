/**
 * Tests for fetchOrgRepos() — GitHub org repo fetching with cache and pagination.
 *
 * Global `fetch` is mocked to avoid real network calls.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks (must be hoisted before imports)
// ---------------------------------------------------------------------------

vi.mock('@/config/repos-config', () => ({
  GITHUB_ORG: 'dcyfr',
  GITHUB_API_CONFIG: {
    baseUrl: 'https://api.github.com',
    timeoutMs: 5000,
    perPage: 3, // small page size so pagination is easy to test
  },
  ENV_VARS: { token: 'GITHUB_TOKEN', enabled: 'ENABLE_AUTOMATED_REPOS' },
  CACHE_CONFIG: { cacheDir: '/tmp/test-cache', ttlMs: 60_000 },
  REPO_DEFAULTS: { category: 'code', status: 'active', maxHeuristicsLines: 50 },
  REPO_EXCLUDE_LIST: [],
  REPO_INCLUDE_LIST: [],
}));

vi.mock('@/lib/github/cache', () => ({
  readReposCache: vi.fn(() => null), // null = no cache by default
  writeReposCache: vi.fn(),
  readReposCacheStale: vi.fn(() => null), // null = no stale cache by default
}));

import { fetchOrgRepos } from '@/lib/github/fetch-repos';
import { readReposCache, writeReposCache, readReposCacheStale } from '@/lib/github/cache';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRepo(name: string) {
  return {
    name,
    full_name: `dcyfr/${name}`,
    description: `${name} description`,
    private: false,
    archived: false,
    fork: false,
    html_url: `https://github.com/dcyfr/${name}`,
    homepage: null,
    language: 'TypeScript',
    topics: [],
    stargazers_count: 0,
    forks_count: 0,
    open_issues_count: 0,
    pushed_at: '2024-01-01T00:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    default_branch: 'main',
    contents_url: `https://api.github.com/repos/dcyfr/${name}/contents/{+path}`,
  };
}

function mockFetchOk(body: unknown): Response {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => body,
  } as unknown as Response;
}

function mockFetchError(status: number, statusText = 'Error'): Response {
  return {
    ok: false,
    status,
    statusText,
    json: async () => ({}),
  } as unknown as Response;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('fetchOrgRepos', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(readReposCache).mockReturnValue(null);
    delete process.env.GITHUB_TOKEN;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('returns cached repos when cache is fresh', async () => {
    const cachedRepos = [makeRepo('cached-repo')];
    vi.mocked(readReposCache).mockReturnValue({
      fetchedAt: new Date().toISOString(),
      repos: cachedRepos,
    });
    global.fetch = vi.fn();

    const result = await fetchOrgRepos();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('cached-repo');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('fetches from API when cache is empty', async () => {
    const repos = [makeRepo('repo-a'), makeRepo('repo-b')];
    let callCount = 0;
    global.fetch = vi.fn(async (url: string | URL | Request) => {
      callCount++;
      const urlStr = url.toString();
      if (urlStr.includes('/rate_limit'))
        return mockFetchOk({ resources: { core: { remaining: 100 } } });
      if (urlStr.includes('/repos')) {
        // First page returns 2 repos (< perPage=3 → last page)
        return mockFetchOk(repos);
      }
      return mockFetchError(404);
    });

    const result = await fetchOrgRepos();
    expect(result).toHaveLength(2);
    expect(vi.mocked(writeReposCache)).toHaveBeenCalledOnce();
  });

  it('paginates until fewer than perPage repos are returned', async () => {
    // perPage=3 in config above; page 1 returns 3 (full), page 2 returns 1 (last)
    const page1 = [makeRepo('a'), makeRepo('b'), makeRepo('c')];
    const page2 = [makeRepo('d')];
    let pageCallCount = 0;
    global.fetch = vi.fn(async (url: string | URL | Request) => {
      const urlStr = url.toString();
      if (urlStr.includes('/rate_limit'))
        return mockFetchOk({ resources: { core: { remaining: 100 } } });
      if (urlStr.includes('page=2')) return mockFetchOk(page2);
      if (urlStr.includes('/repos')) {
        pageCallCount++;
        return mockFetchOk(page1);
      }
      return mockFetchError(404);
    });

    const result = await fetchOrgRepos();
    expect(result).toHaveLength(4);
    expect(result.map((r) => r.name)).toEqual(['a', 'b', 'c', 'd']);
  });

  it('returns empty array when rate limited and no stale cache', async () => {
    // GitHub returns 403 when rate limited on the actual API endpoint
    vi.mocked(readReposCache).mockReturnValue(null);
    global.fetch = vi.fn(
      async () => ({ ok: false, status: 403, statusText: 'Forbidden' }) as Response
    );

    const result = await fetchOrgRepos();
    expect(result).toHaveLength(0);
  });

  it('retries without auth header when token is invalid (401)', async () => {
    process.env.GITHUB_TOKEN = 'expired-or-invalid-token';
    const repos = [makeRepo('public-repo')];
    vi.mocked(readReposCache).mockReturnValue(null);
    let callCount = 0;

    global.fetch = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      callCount++;
      const authHeader = (init?.headers as Record<string, string>)?.['Authorization'];
      if (authHeader) {
        // First call with bad token → 401
        return { ok: false, status: 401, statusText: 'Unauthorized' } as Response;
      }
      // Second call without token → succeeds
      return mockFetchOk(repos);
    });

    const result = await fetchOrgRepos();
    expect(callCount).toBe(2);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('public-repo');
  });

  it('falls back to stale cache on network error', async () => {
    const staleRepos = [makeRepo('stale-repo')];
    // readReposCache returns null (no fresh data); readReposCacheStale returns stale
    vi.mocked(readReposCache).mockReturnValue(null);
    vi.mocked(readReposCacheStale).mockReturnValue({
      fetchedAt: '2000-01-01T00:00:00Z',
      repos: staleRepos,
    });

    global.fetch = vi.fn(async (url: string | URL | Request) => {
      const urlStr = url.toString();
      if (urlStr.includes('/rate_limit'))
        return mockFetchOk({ resources: { core: { remaining: 100 } } });
      throw new Error('Network error');
    });

    const result = await fetchOrgRepos();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('stale-repo');
  });

  it('returns empty array on network error when no stale cache exists', async () => {
    vi.mocked(readReposCache).mockReturnValue(null);
    vi.mocked(readReposCacheStale).mockReturnValue(null);

    global.fetch = vi.fn(async (url: string | URL | Request) => {
      const urlStr = url.toString();
      if (urlStr.includes('/rate_limit'))
        return mockFetchOk({ resources: { core: { remaining: 100 } } });
      throw new Error('Network error');
    });

    const result = await fetchOrgRepos();
    expect(result).toHaveLength(0);
  });

  it('adds Authorization header when GITHUB_TOKEN is set', async () => {
    process.env.GITHUB_TOKEN = 'test-token-xyz';
    const repos = [makeRepo('authed-repo')];
    const capturedHeaders: Record<string, string>[] = [];

    global.fetch = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
      capturedHeaders.push((init?.headers as Record<string, string>) ?? {});
      const urlStr = url.toString();
      if (urlStr.includes('/rate_limit'))
        return mockFetchOk({ resources: { core: { remaining: 100 } } });
      return mockFetchOk(repos);
    });

    await fetchOrgRepos();
    // At least one request should have the Authorization header
    const authHeader = capturedHeaders.find((h) => h['Authorization']);
    expect(authHeader?.['Authorization']).toBe('Bearer test-token-xyz');

    delete process.env.GITHUB_TOKEN;
  });
});
