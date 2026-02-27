/**
 * File-based cache for GitHub API responses.
 *
 * Writes JSON files under `.cache/github-repos/` (gitignored).
 * Each entry stores the data plus a `fetchedAt` timestamp used for TTL checks.
 */

import fs from 'fs';
import path from 'path';
import { CACHE_CONFIG } from '@/config/repos-config';
import type { RepoCacheEntry, ReadmeCacheEntry } from './types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cacheDir(): string {
  // On Vercel the project root is read-only at runtime; /tmp is writable.
  // Using a namespaced subdirectory avoids collisions with other services.
  if (process.env.VERCEL) {
    return '/tmp/dcyfr-github-repos';
  }
  return path.join(process.cwd(), CACHE_CONFIG.cacheDir);
}

function ensureCacheDir(): void {
  const dir = cacheDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function cacheFilePath(key: string): string {
  // Sanitise key so it's safe as a filename
  const safe = key.replace(/[^a-zA-Z0-9_-]/g, '_');
  return path.join(cacheDir(), `${safe}.json`);
}

// ---------------------------------------------------------------------------
// Generic read / write helpers
// ---------------------------------------------------------------------------

function writeCache<T extends { fetchedAt: string }>(key: string, data: T): void {
  ensureCacheDir();
  const file = cacheFilePath(key);
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tmp, file);
}

function readCache<T extends { fetchedAt: string }>(key: string): T | null {
  const file = cacheFilePath(key);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8')) as T;
  } catch {
    return null;
  }
}

/**
 * Same as readCache but skips the TTL check.
 * Used as a last-resort fallback when a live fetch fails.
 */
function readCacheStale<T extends { fetchedAt: string }>(key: string): T | null {
  return readCache<T>(key);
}

function isFresh(fetchedAt: string): boolean {
  return Date.now() - new Date(fetchedAt).getTime() < CACHE_CONFIG.ttlMs;
}

// ---------------------------------------------------------------------------
// Repo list cache
// ---------------------------------------------------------------------------

const REPOS_CACHE_KEY = 'repos-list';

export function writeReposCache(entry: RepoCacheEntry): void {
  writeCache(REPOS_CACHE_KEY, entry);
}

export function readReposCache(): RepoCacheEntry | null {
  const entry = readCache<RepoCacheEntry>(REPOS_CACHE_KEY);
  if (!entry || !isFresh(entry.fetchedAt)) return null;
  return entry;
}

/**
 * Return the cached repo list regardless of TTL.
 * Used as a fallback when the live GitHub API is unavailable.
 */
export function readReposCacheStale(): RepoCacheEntry | null {
  return readCacheStale<RepoCacheEntry>(REPOS_CACHE_KEY);
}

// ---------------------------------------------------------------------------
// Per-repo README cache
// ---------------------------------------------------------------------------

function readmeCacheKey(repoFullName: string): string {
  return `readme-${repoFullName}`;
}

export function writeReadmeCache(repoFullName: string, entry: ReadmeCacheEntry): void {
  writeCache(readmeCacheKey(repoFullName), entry);
}

export function readReadmeCache(repoFullName: string): ReadmeCacheEntry | null {
  const entry = readCache<ReadmeCacheEntry>(readmeCacheKey(repoFullName));
  if (!entry || !isFresh(entry.fetchedAt)) return null;
  return entry;
}

/**
 * Return the cached README regardless of TTL.
 * Used as a fallback when the live GitHub API is unavailable.
 */
export function readReadmeCacheStale(repoFullName: string): ReadmeCacheEntry | null {
  return readCacheStale<ReadmeCacheEntry>(readmeCacheKey(repoFullName));
}
