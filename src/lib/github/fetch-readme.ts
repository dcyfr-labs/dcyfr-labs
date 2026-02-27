/**
 * Fetch the README for a single repository from the GitHub REST API.
 *
 * Returns the decoded (UTF-8) markdown string, or an empty string if the
 * repo has no README or the fetch fails.  Results are file-cached.
 */

import { GITHUB_API_CONFIG, ENV_VARS } from '@/config/repos-config';
import { writeReadmeCache, readReadmeCache, readReadmeCacheStale } from './cache';
import type { GitHubReadmeResponse } from './types';

// ---------------------------------------------------------------------------
// Helpers (kept local to avoid circular imports with fetch-repos)
// ---------------------------------------------------------------------------

function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'dcyfr-labs-repo-showcase/1.0',
  };
  const token = process.env[ENV_VARS.token];
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function fetchWithTimeout(url: string, headers: Record<string, string>): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GITHUB_API_CONFIG.timeoutMs);
  try {
    return await fetch(url, { headers, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch raw README markdown for `repoFullName` (e.g. `"dcyfr/dcyfr-ai"`).
 *
 * Returns the decoded content string.  Returns `""` when:
 *  - The repo has no README (404)
 *  - The request fails (network / rate limit)
 */
export async function fetchRepoReadme(repoFullName: string): Promise<string> {
  // Fresh cache hit
  const cached = readReadmeCache(repoFullName);
  if (cached) return cached.content;

  const url = `${GITHUB_API_CONFIG.baseUrl}/repos/${repoFullName}/readme`;
  const headers = buildHeaders();

  let res: Response;
  try {
    res = await fetchWithTimeout(url, headers);
  } catch {
    // Network error — fall back to stale README cache (ignores TTL)
    const stale = readReadmeCacheStale(repoFullName);
    return stale ? stale.content : '';
  }

  if (res.status === 404) {
    // Repo has no README — cache empty result so we don't re-fetch
    try {
      writeReadmeCache(repoFullName, { fetchedAt: new Date().toISOString(), content: '' });
    } catch {
      /* non-fatal: read-only filesystem (e.g. Vercel) */
    }
    return '';
  }

  if (!res.ok) {
    // Rate limit or server error — try stale cache before returning empty
    const stale = readReadmeCacheStale(repoFullName);
    return stale ? stale.content : '';
  }

  let data: GitHubReadmeResponse;
  try {
    data = (await res.json()) as GitHubReadmeResponse;
  } catch {
    return '';
  }

  // GitHub returns base64-encoded content (may include newlines)
  let content = '';
  try {
    const cleaned = data.content.replace(/\n/g, '');
    content = Buffer.from(cleaned, 'base64').toString('utf-8');
  } catch {
    content = '';
  }

  try {
    writeReadmeCache(repoFullName, { fetchedAt: new Date().toISOString(), content });
  } catch {
    /* non-fatal: read-only filesystem (e.g. Vercel) */
  }
  return content;
}
