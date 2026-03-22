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

interface FetchState {
  useUserEndpoint: boolean;
  useUnauthenticated: boolean;
  page: number;
}

type FetchPageResult =
  | { kind: 'append'; repos: GitHubRepo[]; done: boolean; nextState: FetchState }
  | { kind: 'retry'; nextState: FetchState }
  | { kind: 'return'; repos: GitHubRepo[] };

function getStaleReposOrEmpty(): GitHubRepo[] {
  const stale = readReposCacheStale();
  return stale ? stale.repos : [];
}

function buildReposUrl(state: FetchState): string {
  const baseEndpoint = state.useUserEndpoint
    ? `${GITHUB_API_CONFIG.baseUrl}/users/${GITHUB_ORG}/repos`
    : `${GITHUB_API_CONFIG.baseUrl}/orgs/${GITHUB_ORG}/repos`;
  return `${baseEndpoint}?per_page=${GITHUB_API_CONFIG.perPage}&page=${state.page}&type=public&sort=updated`;
}

function requestHeadersForState(
  state: FetchState,
  headers: Record<string, string>
): Record<string, string> {
  return state.useUnauthenticated ? {} : headers;
}

function handleErrorStatus(state: FetchState, res: Response): FetchPageResult {
  if (res.status === 404 && !state.useUserEndpoint && state.page === 1) {
    return {
      kind: 'retry',
      nextState: { ...state, useUserEndpoint: true },
    };
  }

  if (res.status === 401 && !state.useUnauthenticated) {
    return {
      kind: 'retry',
      nextState: { ...state, useUnauthenticated: true },
    };
  }

  if (res.status === 403) {
    return { kind: 'return', repos: getStaleReposOrEmpty() };
  }

  const staleRepos = getStaleReposOrEmpty();
  if (staleRepos.length > 0) {
    return { kind: 'return', repos: staleRepos };
  }

  throw new Error(
    `GitHub API error fetching repos for ${GITHUB_ORG}: ${res.status} ${res.statusText}`
  );
}

async function fetchReposPage(
  state: FetchState,
  headers: Record<string, string>
): Promise<FetchPageResult> {
  const url = buildReposUrl(state);
  const reqHeaders = requestHeadersForState(state, headers);

  let res: Response;
  try {
    res = await fetchWithTimeout(url, reqHeaders);
  } catch {
    return { kind: 'return', repos: getStaleReposOrEmpty() };
  }

  if (!res.ok) {
    return handleErrorStatus(state, res);
  }

  const pageRepos = (await res.json()) as GitHubRepo[];
  const done = pageRepos.length < GITHUB_API_CONFIG.perPage;

  return {
    kind: 'append',
    repos: pageRepos,
    done,
    nextState: { ...state, page: state.page + 1 },
  };
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

  const allRepos: GitHubRepo[] = [];
  let state: FetchState = {
    useUserEndpoint: false,
    useUnauthenticated: false,
    page: 1,
  };

  while (true) {
    const pageResult = await fetchReposPage(state, headers);

    if (pageResult.kind === 'retry') {
      state = pageResult.nextState;
      continue;
    }

    if (pageResult.kind === 'return') {
      return pageResult.repos;
    }

    allRepos.push(...pageResult.repos);
    state = pageResult.nextState;
    if (pageResult.done) break;
  }

  // 4. Write cache (best-effort — skip on read-only filesystems such as Vercel)
  try {
    writeReposCache({ fetchedAt: new Date().toISOString(), repos: allRepos });
  } catch {
    // Non-fatal: cache write failed (e.g. read-only deployment filesystem)
  }

  return allRepos;
}
