/**
 * Tests for fetchRepoReadme() — README fetching with caching and 404 handling.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/config/repos-config', () => ({
  GITHUB_API_CONFIG: {
    baseUrl: 'https://api.github.com',
    timeoutMs: 5000,
    perPage: 100,
  },
  ENV_VARS: { token: 'GITHUB_TOKEN', enabled: 'ENABLE_AUTOMATED_REPOS' },
  CACHE_CONFIG: { cacheDir: '/tmp/test-cache', ttlMs: 60_000 },
}));

vi.mock('@/lib/github/cache', () => ({
  readReadmeCache: vi.fn(() => null),
  writeReadmeCache: vi.fn(),
  readReadmeCacheStale: vi.fn(() => null), // null = no stale cache by default
}));

import { fetchRepoReadme } from '@/lib/github/fetch-readme';
import { readReadmeCache, writeReadmeCache, readReadmeCacheStale } from '@/lib/github/cache';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function base64Encode(str: string): string {
  return Buffer.from(str, 'utf-8').toString('base64');
}

function mockFetchOk(body: unknown): Response {
  return { ok: true, status: 200, json: async () => body } as unknown as Response;
}

function stubFetch(impl: typeof fetch) {
  global.fetch = impl as unknown as typeof global.fetch;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('fetchRepoReadme', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(readReadmeCache).mockReturnValue(null);
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('returns cached content when cache is fresh', async () => {
    vi.mocked(readReadmeCache).mockReturnValue({
      fetchedAt: new Date().toISOString(),
      content: '# Cached README',
    });
    global.fetch = vi.fn();

    const result = await fetchRepoReadme('dcyfr/test-repo');
    expect(result).toBe('# Cached README');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('decodes base64 readme content from API response', async () => {
    const content = '# Hello\n\nThis is a test README.';
    stubFetch(async () =>
      mockFetchOk({
        name: 'README.md',
        path: 'README.md',
        content: base64Encode(content),
        encoding: 'base64',
        size: content.length,
        sha: 'abc123',
        download_url: null,
      })
    );

    const result = await fetchRepoReadme('dcyfr/test-repo');
    expect(result).toBe(content);
    expect(vi.mocked(writeReadmeCache)).toHaveBeenCalledOnce();
  });

  it('handles base64 with newlines (GitHub API line-wraps at 60 chars)', async () => {
    const content = 'x'.repeat(200);
    const rawB64 = base64Encode(content);
    // GitHub wraps base64 with \n every 60 chars
    const wrapped = rawB64.replace(/.{60}/g, '$&\n');
    stubFetch(async () =>
      mockFetchOk({
        content: wrapped,
        encoding: 'base64',
        name: 'README.md',
        path: 'README.md',
        size: 200,
        sha: 'x',
        download_url: null,
      })
    );

    const result = await fetchRepoReadme('dcyfr/test-repo');
    expect(result).toBe(content);
  });

  it('returns empty string and caches it for 404', async () => {
    global.fetch = vi.fn(
      async () => ({ ok: false, status: 404, json: async () => ({}) }) as unknown as Response
    );

    const result = await fetchRepoReadme('dcyfr/no-readme');
    expect(result).toBe('');
    expect(vi.mocked(writeReadmeCache)).toHaveBeenCalledWith(
      'dcyfr/no-readme',
      expect.objectContaining({ content: '' })
    );
  });

  it('returns empty string without caching on other HTTP errors', async () => {
    global.fetch = vi.fn(
      async () => ({ ok: false, status: 403, json: async () => ({}) }) as unknown as Response
    );

    const result = await fetchRepoReadme('dcyfr/some-repo');
    expect(result).toBe('');
    expect(vi.mocked(writeReadmeCache)).not.toHaveBeenCalled();
  });

  it('returns empty string on network error', async () => {
    global.fetch = vi.fn(async () => {
      throw new Error('Network error');
    });

    const result = await fetchRepoReadme('dcyfr/flaky-repo');
    expect(result).toBe('');
  });
});
