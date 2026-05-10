/**
 * Real Analytics Data Integration
 *
 * This module provides functions to fetch real analytics data from:
 * - Vercel Analytics API
 * - GitHub Traffic API (requires repository admin access)
 *
 * All functions gracefully degrade to empty arrays if:
 * - APIs are not configured (missing credentials)
 * - API calls fail
 * - Rate limits are exceeded
 *
 * Environment Variables Required:
 * - VERCEL_TOKEN: Vercel API token
 * - VERCEL_ANALYTICS_ENDPOINT: Custom analytics endpoint
 * - GITHUB_TOKEN: GitHub Personal Access Token with `repo` scope
 */

import { redis } from '@/lib/redis-client';
import { fetchVercelAnalytics } from './vercel-analytics-api';

// ============================================================================
// TYPES
// ============================================================================

interface AnalyticsMilestone {
  type: 'monthly_visitors' | 'total_views' | 'unique_visitors';
  threshold: number;
  reached_at: string;
  value: number;
}

interface GitHubTrafficMilestone {
  type: 'stars' | 'forks' | 'watchers' | 'contributors';
  value: number;
  reached_at: string;
}

// ============================================================================
// VERCEL ANALYTICS - REAL DATA
// ============================================================================

/**
 * Fetch real Vercel Analytics data and detect milestone achievements
 *
 * Requires:
 * - VERCEL_TOKEN environment variable
 * - VERCEL_ANALYTICS_ENDPOINT environment variable
 *
 * Returns empty array if not configured (graceful degradation)
 */
export async function fetchVercelAnalyticsMilestones(days = 30): Promise<AnalyticsMilestone[]> {
  const isProduction =
    process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';

  try {
    const analyticsData = await fetchVercelAnalytics(days);

    if (!analyticsData) {
      if (isProduction) {
        console.error(
          '❌ CRITICAL: Vercel Analytics not configured in production. ' +
            'Set VERCEL_TOKEN and VERCEL_ANALYTICS_ENDPOINT.'
        );
      } else {
        console.warn(
          '📊 Vercel Analytics not configured (development mode). ' +
            'Set VERCEL_TOKEN and VERCEL_ANALYTICS_ENDPOINT to enable.'
        );
      }
      return [];
    }

    // Calculate total views from top pages
    const totalViews = analyticsData.topPages.reduce((sum, page) => sum + page.views, 0);

    const milestones: AnalyticsMilestone[] = [];
    const now = new Date().toISOString();

    // Define thresholds to track
    const viewThresholds = [1000, 5000, 10000, 25000, 50000, 100000];
    const monthlyThresholds = [500, 1000, 2500, 5000, 10000];

    // Check if we've crossed any view thresholds
    for (const threshold of viewThresholds) {
      if (totalViews >= threshold) {
        milestones.push({
          type: 'total_views',
          threshold,
          reached_at: now,
          value: totalViews,
        });
      }
    }

    // Estimate monthly visitors (this is a simplified calculation)
    const estimatedMonthlyVisitors = Math.floor(totalViews * 0.7); // Rough estimate

    for (const threshold of monthlyThresholds) {
      if (estimatedMonthlyVisitors >= threshold) {
        milestones.push({
          type: 'monthly_visitors',
          threshold,
          reached_at: now,
          value: estimatedMonthlyVisitors,
        });
      }
    }

    console.warn(
      `✅ Fetched Vercel Analytics: ${totalViews} views, ${milestones.length} milestones`
    );
    return milestones;
  } catch (error) {
    if (isProduction) {
      console.error('❌ CRITICAL: Failed to fetch Vercel Analytics in production:', error);
    } else {
      console.warn('⚠️  Failed to fetch Vercel Analytics (dev mode):', error);
    }
    return [];
  }
}

/**
 * Store Vercel Analytics milestones in Redis for activity feed
 */
export async function storeVercelAnalyticsMilestones(): Promise<void> {
  const milestones = await fetchVercelAnalyticsMilestones();

  if (milestones.length === 0) {
    console.warn('📊 No Vercel Analytics milestones to store');
    return;
  }

  try {
    await redis.set('analytics:milestones', JSON.stringify(milestones));
    console.warn(`✅ Stored ${milestones.length} Vercel Analytics milestones in Redis`);
  } catch (error) {
    console.error('❌ Failed to store analytics milestones:', error);
  }
}

// ============================================================================
// GITHUB TRAFFIC - REAL DATA
// ============================================================================

/**
 * Fetch real GitHub repository metrics
 *
 * Requires:
 * - GITHUB_TOKEN with `repo` scope (for traffic data, requires admin access)
 *
 * Note: Traffic data (views, clones) requires repository admin access.
 * Public API only provides stars, forks, watchers.
 *
 * Returns empty array if not configured
 */
export async function fetchGitHubTrafficMilestones(
  owner: string = 'dcyfr',
  repo: string = 'dcyfr-labs'
): Promise<GitHubTrafficMilestone[]> {
  const githubToken = process.env.GITHUB_TOKEN;
  const isProduction =
    process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';

  if (!githubToken) {
    if (isProduction) {
      console.error('❌ CRITICAL: GITHUB_TOKEN not set in production. GitHub traffic unavailable.');
    } else {
      console.warn('📊 GITHUB_TOKEN not set (development). GitHub traffic unavailable.');
    }
    return [];
  }

  try {
    // Fetch repository data
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!repoResponse.ok) {
      throw new Error(`GitHub API returned ${repoResponse.status}`);
    }

    const repoData = await repoResponse.json();

    const milestones: GitHubTrafficMilestone[] = [];
    const now = new Date().toISOString();

    // Track stars
    if (repoData.stargazers_count > 0) {
      milestones.push({
        type: 'stars',
        value: repoData.stargazers_count,
        reached_at: now,
      });
    }

    // Track forks
    if (repoData.forks_count > 0) {
      milestones.push({
        type: 'forks',
        value: repoData.forks_count,
        reached_at: now,
      });
    }

    // Track watchers
    if (repoData.subscribers_count > 0) {
      milestones.push({
        type: 'watchers',
        value: repoData.subscribers_count,
        reached_at: now,
      });
    }

    console.warn(
      `✅ Fetched GitHub metrics: ${repoData.stargazers_count} stars, ${repoData.forks_count} forks`
    );
    return milestones;
  } catch (error) {
    if (isProduction) {
      console.error('❌ CRITICAL: Failed to fetch GitHub traffic in production:', error);
    } else {
      console.warn('⚠️  Failed to fetch GitHub traffic (dev mode):', error);
    }
    return [];
  }
}

/**
 * Store GitHub traffic milestones in Redis
 */
export async function storeGitHubTrafficMilestones(): Promise<void> {
  const milestones = await fetchGitHubTrafficMilestones();

  if (milestones.length === 0) {
    console.warn('📊 No GitHub traffic milestones to store');
    return;
  }

  try {
    await redis.set('github:traffic:milestones', JSON.stringify(milestones));
    console.warn(`✅ Stored ${milestones.length} GitHub traffic milestones in Redis`);
  } catch (error) {
    console.error('❌ Failed to store GitHub traffic milestones:', error);
  }
}

// ============================================================================
// UNIFIED UPDATE FUNCTION
// ============================================================================

/**
 * Update all analytics milestones from real data sources
 *
 * This function should be called:
 * - Via cron job (daily or weekly)
 * - Via API route (manual trigger)
 * - Via Inngest scheduled function
 *
 * It will:
 * 1. Fetch data from all available sources
 * 2. Store in Redis for activity feed consumption
 * 3. Log warnings if sources are unavailable
 * 4. Gracefully degrade if APIs fail
 */
export async function updateAllAnalyticsMilestones(): Promise<{
  success: boolean;
  updated: string[];
  failed: string[];
}> {
  console.warn('📊 Starting analytics milestones update...');

  const updated: string[] = [];
  const failed: string[] = [];

  // Update Vercel Analytics
  try {
    await storeVercelAnalyticsMilestones();
    updated.push('vercel_analytics');
  } catch (error) {
    console.error('❌ Failed to update Vercel Analytics:', error);
    failed.push('vercel_analytics');
  }

  // Update GitHub Traffic
  try {
    await storeGitHubTrafficMilestones();
    updated.push('github_traffic');
  } catch (error) {
    console.error('❌ Failed to update GitHub traffic:', error);
    failed.push('github_traffic');
  }

  const success = failed.length === 0;
  console.warn(
    success
      ? `✅ Analytics update complete: ${updated.join(', ')}`
      : `⚠️  Analytics update completed with errors: updated [${updated.join(', ')}], failed [${failed.join(', ')}]`
  );

  return { success, updated, failed };
}
