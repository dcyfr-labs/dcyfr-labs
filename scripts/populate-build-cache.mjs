#!/usr/bin/env node

/**
 * Populate Build Cache
 *
 * Pre-populates Redis cache with GitHub and Credly data during build time.
 * This ensures production deployments always have fresh data available,
 * eliminating the need for demo/fallback data.
 *
 * Usage:
 * - Automatically runs during build: npm run build
 * - Manual: node scripts/populate-build-cache.mjs
 *
 * Environment Requirements:
 * - UPSTASH_REDIS_REST_URL_PREVIEW or UPSTASH_REDIS_REST_URL
 * - UPSTASH_REDIS_REST_TOKEN_PREVIEW or UPSTASH_REDIS_REST_TOKEN
 * - GITHUB_TOKEN (for GitHub API access)
 */

import { config } from 'dotenv';
import { Redis } from '@upstash/redis';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

// ============================================================================
// CONFIGURATION
// ============================================================================

const GITHUB_USERNAME = 'dcyfr';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const CACHE_DURATION = 60 * 60; // 1 hour in seconds

// Determine which Redis to use
const isProduction =
  process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'production';
const isPreview = process.env.VERCEL_ENV === 'preview';

let redisUrl, redisToken, keyPrefix;

if (isProduction) {
  redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  keyPrefix = '';
} else if (isPreview) {
  redisUrl = process.env.UPSTASH_REDIS_REST_URL_PREVIEW;
  redisToken = process.env.UPSTASH_REDIS_REST_TOKEN_PREVIEW;
  // Use branch name for consistency (available in both build and runtime)
  const branch = process.env.VERCEL_GIT_COMMIT_REF || 'preview';
  keyPrefix = `preview:${branch}:`;
} else {
  // Development
  redisUrl = process.env.UPSTASH_REDIS_REST_URL_PREVIEW;
  redisToken = process.env.UPSTASH_REDIS_REST_TOKEN_PREVIEW;
  const username = process.env.USER || process.env.USERNAME || 'dev';
  keyPrefix = `dev:${username}:`;
}

if (!redisUrl || !redisToken) {
  console.log('[Build Cache] ℹ️  Redis not configured - skipping cache population');
  console.log('[Build Cache]    This is expected in local builds without Redis credentials');
  process.exit(0);
}

const redis = new Redis({
  url: redisUrl,
  token: redisToken,
});

// ============================================================================
// GITHUB CONTRIBUTIONS
// ============================================================================

async function fetchGitHubContributions() {
  console.log('[Build Cache] 📊 Fetching GitHub contributions...');

  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
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

  const headers = {
    'Content-Type': 'application/json',
  };

  if (GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
  } else {
    console.warn('[Build Cache] ⚠️  No GITHUB_TOKEN - API rate limits may apply');
  }

  try {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query,
        variables: { username: GITHUB_USERNAME },
      }),
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error(`GraphQL error: ${JSON.stringify(data.errors)}`);
    }

    const calendar = data.data?.user?.contributionsCollection?.contributionCalendar;

    if (!calendar) {
      throw new Error('Invalid response structure from GitHub API');
    }

    const contributions = calendar.weeks.flatMap((week) =>
      week.contributionDays.map((day) => ({
        date: day.date,
        count: day.contributionCount,
      }))
    );

    const cacheData = {
      contributions,
      source: 'github-api',
      totalContributions: calendar.totalContributions,
      lastUpdated: new Date().toISOString(),
    };

    // Write to Redis
    const cacheKey = `${keyPrefix}github:contributions:dcyfr`;
    await redis.setex(cacheKey, CACHE_DURATION, JSON.stringify(cacheData));

    console.log('[Build Cache] ✅ GitHub data cached', {
      totalContributions: cacheData.totalContributions,
      cacheKey,
    });

    return true;
  } catch (error) {
    console.error('[Build Cache] ❌ Failed to fetch GitHub data:', error.message);
    return false;
  }
}

// ============================================================================
// CREDLY BADGES
// ============================================================================

async function fetchCredlyBadges() {
  console.log('[Build Cache] 🎓 Fetching Credly badges...');

  try {
    const response = await fetch(`https://www.credly.com/users/${GITHUB_USERNAME}/badges.json`);

    if (!response.ok) {
      throw new Error(`Credly API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.data || !Array.isArray(data.data)) {
      throw new Error('Invalid Credly response structure');
    }

    const badges = data.data;
    const cacheData = {
      badges,
      total_count: badges.length,
      count: badges.length,
    };

    // Cache multiple configurations (all, top 10, top 3)
    const configs = [
      { limit: null, key: 'all' },
      { limit: 10, key: '10' },
      { limit: 3, key: '3' },
    ];

    for (const config of configs) {
      const limitedData = {
        ...cacheData,
        badges: config.limit ? badges.slice(0, config.limit) : badges,
        count: config.limit ? Math.min(config.limit, badges.length) : badges.length,
      };

      const cacheKey = `${keyPrefix}credly:badges:${GITHUB_USERNAME}:${config.key}`;
      await redis.setex(cacheKey, CACHE_DURATION, JSON.stringify(limitedData));
    }

    console.log('[Build Cache] ✅ Credly badges cached', {
      totalBadges: badges.length,
      configurations: configs.length,
    });

    return true;
  } catch (error) {
    console.error('[Build Cache] ❌ Failed to fetch Credly badges:', error.message);
    return false;
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('[Build Cache] 🚀 Starting build-time cache population...');
  console.log('[Build Cache] Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    GIT_COMMIT_REF: process.env.VERCEL_GIT_COMMIT_REF,
    keyPrefix: keyPrefix || '(none)',
    redisUrl: redisUrl ? `${redisUrl.substring(0, 30)}...` : '(none)',
  });

  const results = await Promise.allSettled([fetchGitHubContributions(), fetchCredlyBadges()]);

  const githubSuccess = results[0].status === 'fulfilled' && results[0].value;
  const credlySuccess = results[1].status === 'fulfilled' && results[1].value;

  console.log('[Build Cache] 📋 Summary:', {
    github: githubSuccess ? '✅ Success' : '❌ Failed',
    credly: credlySuccess ? '✅ Success' : '❌ Failed',
  });

  if (!githubSuccess || !credlySuccess) {
    console.warn('[Build Cache] ⚠️  Some cache operations failed');
    console.warn('[Build Cache]    Components will show empty state or errors');
    // Don't fail the build - graceful degradation
    process.exit(0);
  }

  console.log('[Build Cache] ✅ Build cache population complete');
  process.exit(0);
}

main().catch((error) => {
  console.error('[Build Cache] ❌ Fatal error:', error);
  // Don't fail the build - graceful degradation
  process.exit(0);
});
