/**
 * Fetch organisation repositories from the GitHub REST API.
 *
 * Falls back to the file-based cache when:
 *  - The API is rate-limited (remaining === 0)
 *  - The network request fails
 *
 * Authentication is optional but recommended (60 → 5000 req/hour with token).
 */

import { GITHUB_API_CONFIG, GITHUB_ORG, ENV_VARS } from '@/config/repos-config';
import { writeReposCache, readReposCache, readReposCacheStale } from './cache';
import type { GitHubRepo } from './types';

// ---------------------------------------------------------------------------
// Helpers
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
 * Return all public repositories for the configured GitHub organisation.
 *
 * Strategy:
 *  1. Return fresh cache if available.
 *  2. Fetch from GitHub API (pagination) and populate cache.
 *  3. On any error, fall back to stale cache (or empty array).
 *  4. HTTP 403 (rate limit) falls back to stale cache or empty array.
 */
export async function fetchOrgRepos(): Promise<GitHubRepo[]> {
  const headers = buildHeaders();

  // 1. Fresh cache hit
  const cached = readReposCache();
  if (cached) return cached.repos;

  // NOTE: The previous rate-limit preflight (GET /rate_limit) was removed — it
  // added up to 10 s of latency on every cold request. Rate-limit responses
  // (HTTP 403) are handled inline in the fetch loop below.

  // Determine whether GITHUB_ORG is an organisation or a user account.
  // The /orgs/ endpoint returns 404 for plain user accounts; fall back to /users/.
  let useUserEndpoint = false;
  let useUnauthenticated = false; // fallback when token is invalid

  const allRepos: GitHubRepo[] = [];
  let page = 1;

  while (true) {
    // Re-build headers each iteration so unauthenticated fallback takes effect
    const reqHeaders = useUnauthenticated ? {} : headers;

    const baseEndpoint = useUserEndpoint
      ? `${GITHUB_API_CONFIG.baseUrl}/users/${GITHUB_ORG}/repos`
      : `${GITHUB_API_CONFIG.baseUrl}/orgs/${GITHUB_ORG}/repos`;
    const url = `${baseEndpoint}?per_page=${GITHUB_API_CONFIG.perPage}&page=${page}&type=public&sort=updated`;

    let res: Response;
    try {
      res = await fetchWithTimeout(url, reqHeaders);
    } catch (err) {
      // Network error — fall back to stale cache (ignores TTL)
      const stale = readReposCacheStale();
      return stale ? stale.repos : [];
    }

    if (!res.ok) {
      if (res.status === 404 && !useUserEndpoint && page === 1) {
        // GITHUB_ORG is a user account, not an org — retry with /users/ endpoint
        useUserEndpoint = true;
        continue;
      }
      if (res.status === 401 && !useUnauthenticated) {
        // Token is invalid or expired — retry without auth for public data
        useUnauthenticated = true;
        continue;
      }
      if (res.status === 403) {
        // Rate limited — use stale cache (ignores TTL)
        const stale = readReposCacheStale();
        return stale ? stale.repos : [];
      }
      // Other non-OK status — try stale cache before surfacing error
      const stale = readReposCacheStale();
      if (stale) return stale.repos;
      throw new Error(
        `GitHub API error fetching repos for ${GITHUB_ORG}: ${res.status} ${res.statusText}`
      );
    }

    const page_repos = (await res.json()) as GitHubRepo[];
    allRepos.push(...page_repos);

    // Last page reached when fewer than perPage items are returned
    if (page_repos.length < GITHUB_API_CONFIG.perPage) break;
    page++;
  }

  // 4. Write cache (best-effort — skip on read-only filesystems such as Vercel)
  try {
    writeReposCache({ fetchedAt: new Date().toISOString(), repos: allRepos });
  } catch {
    // Non-fatal: cache write failed (e.g. read-only deployment filesystem)
  }

  return allRepos;
}
