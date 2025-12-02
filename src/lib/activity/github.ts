/**
 * GitHub Activity Transformer
 *
 * Fetches and transforms GitHub activity (commits, releases) into ActivityItems.
 * Uses server-side fetching with caching for performance.
 */

import type { ActivityItem } from "./types";

// ============================================================================
// TYPES
// ============================================================================

export interface GitHubCommit {
  sha: string;
  message: string;
  date: string;
  url: string;
  author: string;
}

export interface GitHubRelease {
  id: number;
  tagName: string;
  name: string;
  body: string;
  publishedAt: string;
  url: string;
}

export interface GitHubActivity {
  commits: GitHubCommit[];
  releases: GitHubRelease[];
}

// ============================================================================
// CONFIG
// ============================================================================

const GITHUB_OWNER = "dcyfr";
const GITHUB_REPO = "dcyfr-labs";
const GITHUB_API_BASE = "https://api.github.com";

// Cache for GitHub data (5 minute TTL)
let cachedActivity: { data: GitHubActivity; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ============================================================================
// FETCHERS
// ============================================================================

/**
 * Fetch recent commits from GitHub API
 */
async function fetchCommits(limit = 10): Promise<GitHubCommit[]> {
  try {
    const token = process.env.GITHUB_TOKEN;
    const headers: HeadersInit = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "dcyfr-labs",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/commits?per_page=${limit}`,
      { headers, next: { revalidate: 300 } } // 5 min cache
    );

    if (!response.ok) {
      console.warn(`GitHub API returned ${response.status}`);
      return [];
    }

    const data = await response.json();

    return data.map((commit: any) => ({
      sha: commit.sha,
      message: commit.commit.message.split("\n")[0], // First line only
      date: commit.commit.author.date,
      url: commit.html_url,
      author: commit.commit.author.name,
    }));
  } catch (error) {
    console.error("Failed to fetch GitHub commits:", error);
    return [];
  }
}

/**
 * Fetch recent releases from GitHub API
 */
async function fetchReleases(limit = 5): Promise<GitHubRelease[]> {
  try {
    const token = process.env.GITHUB_TOKEN;
    const headers: HeadersInit = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "dcyfr-labs",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases?per_page=${limit}`,
      { headers, next: { revalidate: 300 } }
    );

    if (!response.ok) {
      console.warn(`GitHub API returned ${response.status}`);
      return [];
    }

    const data = await response.json();

    return data.map((release: any) => ({
      id: release.id,
      tagName: release.tag_name,
      name: release.name || release.tag_name,
      body: release.body || "",
      publishedAt: release.published_at,
      url: release.html_url,
    }));
  } catch (error) {
    console.error("Failed to fetch GitHub releases:", error);
    return [];
  }
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Fetch all GitHub activity with caching
 */
export async function fetchGitHubActivity(): Promise<GitHubActivity> {
  // Check cache
  if (cachedActivity && Date.now() - cachedActivity.timestamp < CACHE_TTL) {
    return cachedActivity.data;
  }

  // Fetch fresh data
  const [commits, releases] = await Promise.all([
    fetchCommits(10),
    fetchReleases(5),
  ]);

  const activity: GitHubActivity = { commits, releases };

  // Update cache
  cachedActivity = { data: activity, timestamp: Date.now() };

  return activity;
}

/**
 * Transform GitHub commits into activity items
 * Filters out bot commits (e.g., dependabot)
 */
export function transformCommits(commits: GitHubCommit[]): ActivityItem[] {
  return commits
    .filter((commit) => !commit.author.toLowerCase().includes("dependabot"))
    .map((commit) => ({
      id: `github-commit-${commit.sha.substring(0, 7)}`,
      source: "github" as const,
      verb: "committed" as const,
      title: commit.message,
      description: `Commit by ${commit.author}`,
      timestamp: new Date(commit.date),
      href: commit.url,
      meta: {
        category: "Code",
      },
    }));
}

/**
 * Transform GitHub releases into activity items
 */
export function transformReleases(releases: GitHubRelease[]): ActivityItem[] {
  return releases.map((release) => ({
    id: `github-release-${release.id}`,
    source: "github" as const,
    verb: "released" as const,
    title: `Released ${release.name}`,
    description: release.body
      ? release.body.substring(0, 150) + (release.body.length > 150 ? "..." : "")
      : undefined,
    timestamp: new Date(release.publishedAt),
    href: release.url,
    meta: {
      category: "Release",
      version: release.tagName,
    },
  }));
}

/**
 * Fetch and transform all GitHub activity into ActivityItems
 */
export async function getGitHubActivities(): Promise<ActivityItem[]> {
  const { commits, releases } = await fetchGitHubActivity();

  return [
    ...transformCommits(commits),
    ...transformReleases(releases),
  ];
}
