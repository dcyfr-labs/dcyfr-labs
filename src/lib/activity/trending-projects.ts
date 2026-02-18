/**
 * Trending Projects Calculation
 *
 * Calculate trending scores for projects based on GitHub activity.
 * Scoring formula prioritizes:
 * - Recent star growth (recency bias)
 * - Total star count (popularity)
 * - Fork count (engagement indicator)
 * - Project recency (newer projects get boost)
 *
 * @module lib/activity/trending-projects
 */

import type { Project } from "@/data/projects";
import type { TrendingProject, TrendingVelocity } from "@/components/home";

// ============================================================================
// TYPES
// ============================================================================

interface GitHubRepoStats {
  /** Total star count */
  stars: number;
  /** Stars gained in recent period (e.g., last 7 days) */
  recentStars: number;
  /** Total fork count */
  forks: number;
  /** Last updated timestamp */
  lastUpdated: Date;
}

interface TrendingCalculationOptions {
  /** Number of top projects to return */
  limit?: number;
  /** Weight for recent star growth (default: 5) */
  recentStarsWeight?: number;
  /** Weight for total stars (default: 1) */
  totalStarsWeight?: number;
  /** Weight for forks (default: 2) */
  forksWeight?: number;
  /** Weight for recency bonus (default: 1.5) */
  recencyWeight?: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_OPTIONS: Required<TrendingCalculationOptions> = {
  limit: 5,
  recentStarsWeight: 5,   // Recent activity is 5x more important
  totalStarsWeight: 1,    // Base popularity metric
  forksWeight: 2,         // Forks indicate real usage (2x stars)
  recencyWeight: 1.5,     // Newer projects get 1.5x boost
};

// ============================================================================
// GITHUB DATA FETCHING
// ============================================================================

/**
 * Configuration for recent stars calculation
 * Set USE_ACCURATE_RECENT_STARS=false to use 10% approximation (faster, fewer API calls)
 */
const USE_ACCURATE_RECENT_STARS = process.env.USE_ACCURATE_RECENT_STARS !== "false";

/**
 * Maximum number of stargazers pages to fetch (100 stars per page)
 * Prevents excessive API calls for very popular repositories
 */
const MAX_STARGAZER_PAGES = 10; // Max 1000 stars checked

/**
 * Count how many entries in a stargazers page are newer than a cutoff date.
 * Returns { count, done } where done=true means we passed the cutoff and can stop paging.
 */
function countRecentStarsInPage(
  stargazers: Array<{ starred_at: string }>,
  cutoff: Date
): { count: number; done: boolean } {
  let count = 0;
  for (const stargazer of stargazers) {
    if (new Date(stargazer.starred_at) > cutoff) {
      count++;
    } else {
      return { count, done: true };
    }
  }
  return { count, done: false };
}

/**
 * Fetch accurate recent stars using Stargazers API with timestamps
 *
 * @param octokit - Octokit instance with auth
 * @param repoOwner - Repository owner
 * @param repoName - Repository name
 * @param totalStars - Total star count (from repo data)
 * @returns Number of stars gained in last 7 days, or null if unavailable
 */
async function fetchAccurateRecentStars(
  octokit: any,
  repoOwner: string,
  repoName: string,
  totalStars: number
): Promise<number | null> {
  try {
    // Skip if repo has too many stars (would require too many API calls)
    const maxStarsToCheck = MAX_STARGAZER_PAGES * 100;
    if (totalStars > maxStarsToCheck) {
      console.warn(
        `[TrendingProjects] ${repoOwner}/${repoName} has ${totalStars} stars (>${maxStarsToCheck}), using approximation`
      );
      return null; // Fall back to approximation
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    let recentStarCount = 0;
    let page = 1;

    // Fetch stargazers with timestamps (newest first)
    while (page <= MAX_STARGAZER_PAGES) {
      const { data: stargazers } = await octokit.activity.listStargazersForRepo({
        owner: repoOwner,
        repo: repoName,
        headers: {
          Accept: "application/vnd.github.star+json", // Include starred_at timestamp
        },
        per_page: 100,
        page,
      });

      if (stargazers.length === 0) break;

      const { count, done } = countRecentStarsInPage(stargazers, sevenDaysAgo);
      recentStarCount += count;
      if (done || stargazers.length < 100) break;

      page++;
    }

    console.warn(
      `[TrendingProjects] ${repoOwner}/${repoName}: ${recentStarCount} stars in last 7 days (${page - 1} pages fetched)`
    );

    return recentStarCount;
  } catch (error) {
    console.error(
      `[TrendingProjects] Failed to fetch accurate recent stars for ${repoOwner}/${repoName}:`,
      error instanceof Error ? error.message : error
    );
    return null; // Fall back to approximation
  }
}

/**
 * Fetch GitHub stats for a repository
 * Uses Octokit to fetch real repository data from GitHub API
 */
async function fetchGitHubStats(
  repoOwner: string,
  repoName: string
): Promise<GitHubRepoStats | null> {
  try {
    // Dynamically import Octokit to avoid bundling in client components
    const { Octokit } = await import("@octokit/rest");

    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN, // Optional: increases rate limit from 60 to 5000/hour
    });

    // Fetch repository data
    const { data: repo } = await octokit.repos.get({
      owner: repoOwner,
      repo: repoName,
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    let recentStars = 0;

    if (USE_ACCURATE_RECENT_STARS) {
      // Try to fetch accurate recent stars using Stargazers API
      const accurateRecentStars = await fetchAccurateRecentStars(
        octokit,
        repoOwner,
        repoName,
        repo.stargazers_count
      );

      if (accurateRecentStars !== null) {
        recentStars = accurateRecentStars;
      } else {
        // Fall back to approximation if accurate fetch failed or repo too large
        const isRecentlyUpdated = new Date(repo.updated_at) > sevenDaysAgo;
        recentStars = isRecentlyUpdated
          ? Math.round(repo.stargazers_count * 0.1)
          : 0;
      }
    } else {
      // Use approximation method (10% of total stars for active repos)
      const isRecentlyUpdated = new Date(repo.updated_at) > sevenDaysAgo;
      recentStars = isRecentlyUpdated
        ? Math.round(repo.stargazers_count * 0.1)
        : 0;
    }

    return {
      stars: repo.stargazers_count,
      recentStars,
      forks: repo.forks_count,
      lastUpdated: new Date(repo.updated_at),
    };
  } catch (error) {
    // Log error but don't crash - gracefully degrade to fallback scoring
    console.error(
      `[TrendingProjects] Failed to fetch GitHub stats for ${repoOwner}/${repoName}:`,
      error instanceof Error ? error.message : error
    );
    return null;
  }
}

/**
 * Extract GitHub owner/repo from project links
 */
function extractGitHubRepo(project: Project): { owner: string; repo: string } | null {
  const githubLink = project.links.find(link => link.type === "github");
  if (!githubLink) return null;

  // Parse GitHub URL: https://github.com/owner/repo
  const match = githubLink.href.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) return null;

  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/, ""), // Remove .git suffix if present
  };
}

// ============================================================================
// TRENDING CALCULATION
// ============================================================================

/**
 * Calculate trending score for a single project
 */
function calculateProjectScore(
  project: Project,
  stats: GitHubRepoStats | null,
  options: Required<TrendingCalculationOptions>
): number {
  if (!stats) {
    // Fallback: simulate score based on project metadata
    // This ensures projects without GitHub data still appear in trending
    const baseScore = 50; // Base score for projects without GitHub data
    const featuredBonus = project.featured ? 20 : 0;
    const statusBonus = project.status === "active" ? 15 : project.status === "in-progress" ? 10 : 0;
    const techBonus = (project.tech?.length || 0) * 2; // More tech stack = more comprehensive

    return baseScore + featuredBonus + statusBonus + techBonus;
  }

  // Calculate recency bonus (newer projects get boost)
  const publishedDate = new Date(project.publishedAt);
  const monthsOld = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
  const recencyMultiplier = monthsOld < 6 ? options.recencyWeight : 1;

  // Weighted score calculation
  const score =
    (stats.recentStars * options.recentStarsWeight +
      stats.stars * options.totalStarsWeight +
      stats.forks * options.forksWeight) *
    recencyMultiplier;

  return Math.round(score);
}

/**
 * Calculate trending velocity indicators
 *
 * Determines which trending badges a project should display:
 * - Hot: >50% growth rate (recent stars / total stars)
 * - Rising: >20% growth rate
 * - Top: Highest score (will be set after sorting)
 * - Accelerating: >30% growth rate AND small repo (<1000 stars)
 *
 * @param stars - Total star count
 * @param recentStars - Stars gained recently
 * @returns Velocity indicators object
 */
function calculateVelocity(
  stars: number,
  recentStars: number
): Omit<TrendingVelocity, "isTop"> {
  // Avoid division by zero
  if (stars === 0) {
    return {
      isHot: false,
      isRising: false,
      isAccelerating: false,
      growthRate: 0,
    };
  }

  const growthRate = (recentStars / stars) * 100; // Percentage

  return {
    isHot: growthRate > 50, // >50% growth in recent period
    isRising: growthRate > 20, // >20% growth
    isAccelerating: growthRate > 30 && stars < 1000, // Fast growing new repos
    growthRate,
  };
}

/**
 * Get trending projects with GitHub stats
 *
 * @param projects - Array of projects to analyze
 * @param options - Calculation options
 * @returns Sorted array of trending projects
 */
export async function getTrendingProjects(
  projects: Project[],
  options: TrendingCalculationOptions = {}
): Promise<TrendingProject[]> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Filter to active/in-progress projects
  const activeProjects = projects.filter(
    (p) => p.status === "active" || p.status === "in-progress"
  );

  // Fetch GitHub stats for all projects in parallel
  const projectsWithStats = await Promise.all(
    activeProjects.map(async (project) => {
      const repoInfo = extractGitHubRepo(project);
      let stats: GitHubRepoStats | null = null;

      if (repoInfo) {
        try {
          stats = await fetchGitHubStats(repoInfo.owner, repoInfo.repo);
        } catch (error) {
          console.error(
            `[TrendingProjects] Failed to fetch GitHub stats for ${repoInfo.owner}/${repoInfo.repo}:`,
            error
          );
        }
      }

      const score = calculateProjectScore(project, stats, opts);
      const stars = stats?.stars || 0;
      const recentStars = stats?.recentStars || 0;

      // Calculate velocity indicators (without isTop, will be set after sorting)
      const velocityBase = calculateVelocity(stars, recentStars);

      return {
        project,
        stars,
        recentStars,
        forks: stats?.forks,
        score,
        velocity: {
          ...velocityBase,
          isTop: false, // Will be updated after sorting
        },
      } as TrendingProject;
    })
  );

  // Sort by score (descending) and limit
  const sorted = projectsWithStats
    .sort((a, b) => b.score - a.score)
    .slice(0, opts.limit);

  // Mark the top project
  if (sorted.length > 0 && sorted[0].velocity) {
    sorted[0].velocity.isTop = true;
  }

  return sorted;
}

// ============================================================================
// MOCK DATA GENERATOR (Development/Testing)
// ============================================================================

/**
 * Generate mock trending projects for development/testing
 * Use when GitHub API is not available or for static builds
 */
export function getMockTrendingProjects(
  projects: Project[],
  limit: number = 5
): TrendingProject[] {
  return projects
    .filter((p) => p.status === "active" || p.status === "in-progress")
    .slice(0, limit)
    .map((project, index) => ({
      project,
      stars: Math.max(0, 100 - index * 15), // Decreasing stars
      recentStars: Math.max(0, 20 - index * 3), // Decreasing recent stars
      forks: Math.max(0, 30 - index * 5), // Decreasing forks
      score: 100 - index * 10, // Decreasing score
    }));
}
