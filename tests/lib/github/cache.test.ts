/**
 * Tests for file-based GitHub API cache.
 *
 * Uses a real temp directory (no fs mock needed) — repos-config is mocked
 * to point to that temp directory so no real project files are touched.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import os from 'os';
import path from 'path';
import fs from 'fs';

// ---------------------------------------------------------------------------
// Use vi.hoisted() so tmpCacheDir is available inside the vi.mock() factory
// (vi.mock factories are hoisted to the top of the file before variable decls)
// ---------------------------------------------------------------------------

const tmpCacheDir = vi.hoisted(() => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const _path = require('path') as typeof import('path');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const _os = require('os') as typeof import('os');
  return _path.join(_os.tmpdir(), 'dcyfr-labs-github-cache-test');
});

vi.mock('@/config/repos-config', () => ({
  CACHE_CONFIG: {
    cacheDir: tmpCacheDir,
    ttlMs: 1000, // short TTL for tests (1 second)
  },
  GITHUB_ORG: 'dcyfr',
  GITHUB_API_CONFIG: { baseUrl: 'https://api.github.com', timeoutMs: 10000, perPage: 100 },
  REPO_DEFAULTS: { category: 'code', status: 'active', maxHeuristicsLines: 50 },
  REPO_EXCLUDE_LIST: [],
  REPO_INCLUDE_LIST: [],
  ENV_VARS: { token: 'GITHUB_TOKEN', enabled: 'ENABLE_AUTOMATED_REPOS' },
}));

// Override process.cwd() so path.join(cwd, cacheDir) resolves correctly.
// path.join('/', '/absolute/path') → '/absolute/path' on POSIX.
vi.spyOn(process, 'cwd').mockReturnValue('/');

import {
  writeReposCache,
  readReposCache,
  writeReadmeCache,
  readReadmeCache,
} from '@/lib/github/cache';
import type { RepoCacheEntry, ReadmeCacheEntry } from '@/lib/github/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MINIMAL_REPO = {
  name: 'test-repo',
  full_name: 'dcyfr/test-repo',
  description: 'A test repo',
  html_url: 'https://github.com/dcyfr/test-repo',
  homepage: null,
  private: false,
  fork: false,
  archived: false,
  topics: ['typescript'],
  stargazers_count: 5,
  forks_count: 0,
  open_issues_count: 0,
  language: 'TypeScript',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  pushed_at: '2024-01-01T00:00:00Z',
  default_branch: 'main',
  contents_url: 'https://api.github.com/repos/dcyfr/test-repo/contents/{+path}',
};

function makeRepoEntry(fetchedAt: string): RepoCacheEntry {
  return { fetchedAt, repos: [MINIMAL_REPO] };
}

function makeReadmeEntry(fetchedAt: string): ReadmeCacheEntry {
  return { fetchedAt, content: '# Test README\n\nHello world.' };
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  // Ensure a clean temp dir before each test
  if (fs.existsSync(tmpCacheDir)) {
    fs.rmSync(tmpCacheDir, { recursive: true, force: true });
  }
  fs.mkdirSync(tmpCacheDir, { recursive: true });
});

afterEach(() => {
  if (fs.existsSync(tmpCacheDir)) {
    fs.rmSync(tmpCacheDir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// Repos cache
// ---------------------------------------------------------------------------

describe('writeReposCache / readReposCache', () => {
  it('returns null when no cache file exists', () => {
    expect(readReposCache()).toBeNull();
  });

  it('round-trips a repos entry', () => {
    const now = new Date().toISOString();
    writeReposCache(makeRepoEntry(now));
    const result = readReposCache();
    expect(result).not.toBeNull();
    expect(result!.repos).toHaveLength(1);
    expect(result!.repos[0].name).toBe('test-repo');
  });

  it('returns null for an expired entry (beyond TTL of 1 second)', () => {
    const old = new Date(Date.now() - 2000).toISOString();
    writeReposCache(makeRepoEntry(old));
    expect(readReposCache()).toBeNull();
  });

  it('returns data for a fresh entry (just now)', () => {
    const now = new Date().toISOString();
    writeReposCache(makeRepoEntry(now));
    const result = readReposCache();
    expect(result).not.toBeNull();
    expect(result!.fetchedAt).toBe(now);
  });

  it('uses atomic write (tmp+rename) — file is not partially written', () => {
    const now = new Date().toISOString();
    writeReposCache(makeRepoEntry(now));
    // No tmp file should remain
    const tmpFiles = fs.readdirSync(tmpCacheDir).filter((f) => f.endsWith('.tmp'));
    expect(tmpFiles).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// README cache
// ---------------------------------------------------------------------------

describe('writeReadmeCache / readReadmeCache', () => {
  it('returns null when no readme cache exists', () => {
    expect(readReadmeCache('dcyfr/some-repo')).toBeNull();
  });

  it('round-trips a readme entry', () => {
    const now = new Date().toISOString();
    writeReadmeCache('dcyfr/test-repo', makeReadmeEntry(now));
    const result = readReadmeCache('dcyfr/test-repo');
    expect(result).not.toBeNull();
    expect(result!.content).toContain('Hello world');
  });

  it('returns null for an expired readme entry', () => {
    const old = new Date(Date.now() - 2000).toISOString();
    writeReadmeCache('dcyfr/test-repo', makeReadmeEntry(old));
    expect(readReadmeCache('dcyfr/test-repo')).toBeNull();
  });

  it('isolates different repos in separate cache keys', () => {
    const now = new Date().toISOString();
    writeReadmeCache('dcyfr/repo-a', { fetchedAt: now, content: '# Repo A' });
    writeReadmeCache('dcyfr/repo-b', { fetchedAt: now, content: '# Repo B' });
    expect(readReadmeCache('dcyfr/repo-a')?.content).toBe('# Repo A');
    expect(readReadmeCache('dcyfr/repo-b')?.content).toBe('# Repo B');
  });

  it('sanitises slashes in repo name for safe filenames', () => {
    const now = new Date().toISOString();
    writeReadmeCache('org/repo-with/slashes', { fetchedAt: now, content: 'ok' });
    const result = readReadmeCache('org/repo-with/slashes');
    expect(result?.content).toBe('ok');
  });
});
