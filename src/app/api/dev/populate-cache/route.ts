import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/mcp/shared/redis-client';
import { getRedisKeyPrefix } from '@/mcp/shared/redis-client';

/**
 * Development-only endpoint to populate local cache
 *
 * This endpoint directly populates Redis with:
 * - GitHub contribution data (via GraphQL API)
 * - Credly badge data
 *
 * Usage: GET http://localhost:3000/api/dev/populate-cache
 */

const GITHUB_USERNAME = 'dcyfr';
const CREDLY_API_BASE = 'https://www.credly.com/users/dcyfr/badges.json';

async function fetchGitHubContributions() {
  try {
    // Get date range for last year
    const to = new Date();
    const from = new Date();
    from.setFullYear(from.getFullYear() - 1);

    const query = `
      query($username: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $username) {
          contributionsCollection(from: $from, to: $to) {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  date
                  contributionCount
                }
              }
            }
          }
        }
      }
    `;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Use GitHub token if available
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query,
        variables: {
          username: GITHUB_USERNAME,
          from: from.toISOString(),
          to: to.toISOString(),
        },
      }),
      next: { revalidate: 0 }, // Don't cache during populate
    });

    if (!response.ok) {
      throw new Error(`GitHub API returned ${response.status}`);
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error(`GraphQL error: ${JSON.stringify(data.errors)}`);
    }

    const calendar = data.data?.user?.contributionsCollection?.contributionCalendar;

    if (!calendar) {
      throw new Error('No contribution data in response');
    }

    // Transform to our format
    const contributions: Array<{ date: string; count: number }> = [];
    for (const week of calendar.weeks || []) {
      for (const day of week.contributionDays || []) {
        contributions.push({
          date: day.date,
          count: day.contributionCount,
        });
      }
    }

    return {
      contributions,
      totalContributions: calendar.totalContributions || 0,
      source: 'github-api' as const,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[Populate Cache] GitHub fetch failed:', error);
    return null;
  }
}

async function fetchCredlyBadges(limit?: number) {
  try {
    const url = limit ? `${CREDLY_API_BASE}?per_page=${limit}` : CREDLY_API_BASE;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'dcyfr-labs/1.0' },
      next: { revalidate: 0 }, // Don't cache during populate
    });

    if (!response.ok) {
      throw new Error(`Credly API returned ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('[Populate Cache] Credly fetch failed:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Only available in development' }, { status: 403 });
  }

  const keyPrefix = getRedisKeyPrefix();
  const results: {
    github?: { success: boolean; message?: string; key?: string };
    credly?: { success: boolean; message?: string; keys?: string[] };
  } = {};

  // 1. Populate GitHub data
  try {
    const githubData = await fetchGitHubContributions();
    if (githubData) {
      const key = `${keyPrefix}github:contributions:dcyfr`;
      await redis.set(key, JSON.stringify(githubData), { ex: 24 * 60 * 60 });
      results.github = {
        success: true,
        message: `Cached ${githubData.totalContributions} contributions`,
        key,
      };
    } else {
      results.github = {
        success: false,
        message: 'Failed to fetch GitHub data',
      };
    }
  } catch (error) {
    results.github = {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // 2. Populate Credly data (all three variants)
  try {
    const credlyKeys: string[] = [];

    // Fetch all badges
    const allBadges = await fetchCredlyBadges();
    if (allBadges && Array.isArray(allBadges)) {
      const key = `${keyPrefix}credly:badges:dcyfr:all`;
      // Store in format expected by credly-data.ts: { badges, total_count }
      const cacheData = {
        badges: allBadges,
        total_count: allBadges.length,
      };
      await redis.set(key, JSON.stringify(cacheData), { ex: 24 * 60 * 60 });
      credlyKeys.push(key);
    }

    // Fetch 10 badges
    const badges10 = await fetchCredlyBadges(10);
    if (badges10 && Array.isArray(badges10)) {
      const key = `${keyPrefix}credly:badges:dcyfr:10`;
      const cacheData = {
        badges: badges10,
        total_count: badges10.length,
      };
      await redis.set(key, JSON.stringify(cacheData), { ex: 24 * 60 * 60 });
      credlyKeys.push(key);
    }

    // Fetch 3 badges
    const badges3 = await fetchCredlyBadges(3);
    if (badges3 && Array.isArray(badges3)) {
      const key = `${keyPrefix}credly:badges:dcyfr:3`;
      const cacheData = {
        badges: badges3,
        total_count: badges3.length,
      };
      await redis.set(key, JSON.stringify(cacheData), { ex: 24 * 60 * 60 });
      credlyKeys.push(key);
    }

    results.credly = {
      success: credlyKeys.length > 0,
      message: `Cached ${credlyKeys.length}/3 badge variants`,
      keys: credlyKeys,
    };
  } catch (error) {
    results.credly = {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  const overallSuccess = results.github?.success && results.credly?.success;

  return NextResponse.json(
    {
      success: overallSuccess,
      github: results.github?.success || false,
      credly: results.credly?.success || false,
      message: overallSuccess
        ? 'Local cache populated successfully'
        : 'Some operations failed - check details',
      details: results,
      keyPrefix,
    },
    { status: overallSuccess ? 200 : 500 }
  );
}
