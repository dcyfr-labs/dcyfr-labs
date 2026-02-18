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
import { writeFileSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

// ============================================================================
// CONFIGURATION
// ============================================================================

const GITHUB_USERNAME = 'dcyfr';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const CACHE_DURATION = 25 * 60 * 60; // 25 hours in seconds (survives between daily cron runs)

// Determine which Redis to use
const isProduction =
  process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'production';

let redisUrl, redisToken, keyPrefix;

if (isProduction) {
  redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  keyPrefix = '';
} else {
  // ✅ SIMPLIFIED: All non-production environments share 'preview:' prefix
  // This ensures dev, preview, and feature branches all share the same cache
  redisUrl = process.env.UPSTASH_REDIS_REST_URL_PREVIEW;
  redisToken = process.env.UPSTASH_REDIS_REST_TOKEN_PREVIEW;
  keyPrefix = 'preview:';
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
// VALIDATION HELPERS
// ============================================================================

function validateGitHubData(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Data must be an object');
  }
  if (!Array.isArray(data.contributions)) {
    throw new Error('Missing or invalid contributions array');
  }
  if (typeof data.totalContributions !== 'number') {
    throw new Error('Missing or invalid totalContributions');
  }
  if (data.contributions.length === 0) {
    throw new Error('Contributions array is empty');
  }
  // Validate structure of first contribution
  const sample = data.contributions[0];
  if (!sample.date || typeof sample.count !== 'number') {
    throw new Error('Invalid contribution structure');
  }
  return true;
}

function validateCredlyData(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Data must be an object');
  }
  if (!Array.isArray(data.badges)) {
    throw new Error('Missing or invalid badges array');
  }
  if (typeof data.count !== 'number') {
    throw new Error('Missing or invalid count');
  }
  if (data.count !== data.badges.length) {
    throw new Error('Count mismatch with badges array length');
  }
  return true;
}

// ============================================================================
// GITHUB CONTRIBUTIONS
// ============================================================================

/**
 * Run an async action with retry-backoff logic.
 * @param {() => Promise<boolean>} action
 * @param {number} retries
 * @param {string} name - Human-readable label for log messages
 */
async function retryWithBackoff(action, retries, name) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    console.log(`[Build Cache] Attempt ${attempt}/${retries}...`);
    try {
      return await action(attempt);
    } catch (error) {
      console.error(`[Build Cache] ❌ Attempt ${attempt} failed:`, error.message);
      if (attempt < retries) {
        const delay = attempt * 1000;
        console.log(`[Build Cache] ⏳ Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.error(`[Build Cache] ❌ All retries exhausted for ${name}`);
      }
    }
  }
  return false;
}

async function fetchGitHubContributions(retries = 3) {
  console.log('[Build Cache] 📊 Fetching GitHub contributions...');

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

  const headers = {
    'Content-Type': 'application/json',
  };

  if (GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
  } else {
    console.warn('[Build Cache] ⚠️  No GITHUB_TOKEN - API rate limits may apply');
  }

  const result = await retryWithBackoff(async () => {
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
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error(`GraphQL error: ${JSON.stringify(data.errors)}`);
    }

    const calendar = data.data?.user?.contributionsCollection?.contributionCalendar;
    if (!calendar) throw new Error('Invalid response structure from GitHub API');

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

    try {
      validateGitHubData(cacheData);
    } catch (validationError) {
      throw new Error(`Validation failed: ${validationError.message}`);
    }

    const cacheKey = `${keyPrefix}github:contributions:dcyfr`;
    const jsonString = JSON.stringify(cacheData);
    JSON.parse(jsonString);
    await redis.setex(cacheKey, CACHE_DURATION, jsonString);

    console.log('[Build Cache] ✅ GitHub data cached', {
      totalContributions: cacheData.totalContributions,
      contributionsCount: contributions.length,
      cacheKey,
    });
    return true;
  }, retries, 'GitHub data');

  return result === true;
}

/**
 * Write a persistent Credly snapshot to disk.
 */
function writeCredlySnapshot(cacheData) {
  try {
    const snapshotPath = resolve(__dirname, '../src/data/credly-badges-snapshot.json');
    const snapshotDir = dirname(snapshotPath);
    mkdirSync(snapshotDir, { recursive: true });
    const snapshot = { ...cacheData, generatedAt: new Date().toISOString() };
    writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2));
    console.log('[Build Cache] ✅ Snapshot written to src/data/credly-badges-snapshot.json', {
      badges: snapshot.badges.length,
      generatedAt: snapshot.generatedAt,
    });
  } catch (snapshotError) {
    console.warn('[Build Cache] ⚠️  Failed to write snapshot:', snapshotError.message);
  }
}

/**
 * Cache multiple badge count configurations (all, top-10, top-3).
 */
async function cacheCredlyConfigs(badges, cacheData) {
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
    validateCredlyData(limitedData);
    const cacheKey = `${keyPrefix}credly:badges:${GITHUB_USERNAME}:${config.key}`;
    const jsonString = JSON.stringify(limitedData);
    JSON.parse(jsonString);
    await redis.setex(cacheKey, CACHE_DURATION, jsonString);
    console.log(`[Build Cache] ✅ Cached ${config.key}: ${limitedData.count} badges`);
  }
}

async function fetchCredlyBadges(retries = 3) {
  console.log('[Build Cache] 🎓 Fetching Credly badges...');

  const result = await retryWithBackoff(async () => {
    const response = await fetch(`https://www.credly.com/users/${GITHUB_USERNAME}/badges.json`);

    if (!response.ok) {
      throw new Error(`Credly API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.data || !Array.isArray(data.data)) {
      throw new Error('Invalid Credly response structure');
    }

    const badges = data.data;
    const cacheData = { badges, total_count: badges.length, count: badges.length };

    try {
      validateCredlyData(cacheData);
    } catch (validationError) {
      throw new Error(`Validation failed: ${validationError.message}`);
    }

    writeCredlySnapshot(cacheData);
    await cacheCredlyConfigs(badges, cacheData);

    console.log('[Build Cache] ✅ Credly badges cached', {
      totalBadges: badges.length,
      configurations: 3,
    });
    return true;
  }, retries, 'Credly badges');

  return result === true;
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

  // In production, we MUST have valid cache data
  // In preview/dev, we can continue with warnings
  if (!githubSuccess || !credlySuccess) {
    console.error('[Build Cache] ❌ Cache population failed!');

    if (isProduction) {
      console.error('[Build Cache] 🚨 PRODUCTION BUILD BLOCKED');
      console.error('[Build Cache]    Cannot deploy without valid cache data');
      console.error('[Build Cache]    This prevents corrupted data in production');
      process.exit(1); // Fail the build in production
    } else {
      console.warn('[Build Cache] ⚠️  Preview/dev build continuing with warnings');
      console.warn('[Build Cache]    Components may show empty state or errors');
      console.warn('[Build Cache]    Fix cache issues before deploying to production');
      process.exit(0); // Allow preview/dev builds to continue
    }
  }

  console.log('[Build Cache] ✅ Build cache population complete');
  process.exit(0);
}

main().catch((error) => {
  console.error('[Build Cache] ❌ Fatal error:', error);
  // Don't fail the build - graceful degradation
  process.exit(0);
});
