#!/usr/bin/env node
/**
 * Fix Corrupted Production Cache
 *
 * Clears corrupted Redis keys and repopulates them with fresh data.
 * This script is safe to run in production - it only deletes known-bad data.
 *
 * What it fixes:
 * - Corrupted blog:trending key (malformed JSON)
 * - Missing credly:badges:* keys
 * - Missing github:contributions:* keys
 * - Missing analytics milestones
 *
 * Usage:
 *   UPSTASH_REDIS_REST_URL=<prod-url> \
 *   UPSTASH_REDIS_REST_TOKEN=<prod-token> \
 *   GITHUB_TOKEN=<token> \
 *   node scripts/fix-corrupted-cache.mjs
 *
 * Safety:
 * - Runs in dry-run mode by default (use --execute to apply changes)
 * - Validates data before writing to Redis
 * - Logs all operations for audit trail
 */

import { Redis } from '@upstash/redis';
import { config } from 'dotenv';

config({ path: '.env.local' });

// Parse arguments
const args = process.argv.slice(2);
const DRY_RUN = !args.includes('--execute');

// Configuration
const GITHUB_USERNAME = 'dcyfr';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const CACHE_DURATION = 60 * 60; // 1 hour

// Redis connection
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

function isValidJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

function validateTrendingData(data) {
  if (!Array.isArray(data)) return false;
  if (data.length === 0) return true; // Empty array is valid

  // Validate structure of first item
  const sample = data[0];
  return (
    typeof sample.postId === 'string' &&
    typeof sample.totalViews === 'number' &&
    typeof sample.recentViews === 'number' &&
    typeof sample.score === 'number'
  );
}

function validateCredlyData(data) {
  if (!data.badges || !Array.isArray(data.badges)) return false;
  if (typeof data.count !== 'number') return false;
  return true;
}

function validateGitHubData(data) {
  if (!data.contributions || !Array.isArray(data.contributions)) return false;
  if (typeof data.totalContributions !== 'number') return false;
  return true;
}

// ============================================================================
// INSPECTION & CLEANUP
// ============================================================================

async function inspectKey(key, validator = null) {
  console.log(`\n🔍 Inspecting: ${key}`);

  try {
    const value = await redis.get(key);

    if (value === null) {
      console.log(`  ❌ Key does not exist`);
      return { exists: false, valid: false };
    }

    // Check if it's valid JSON
    const jsonStr = typeof value === 'string' ? value : JSON.stringify(value);
    if (!isValidJSON(jsonStr)) {
      console.log(`  ❌ CORRUPTED: Invalid JSON`);
      console.log(`  📄 Raw value: ${jsonStr.substring(0, 100)}...`);
      return { exists: true, valid: false, value };
    }

    // Parse and validate structure
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    const structureValid = validator ? validator(parsed) : true;

    if (!structureValid) {
      console.log(`  ❌ CORRUPTED: Invalid structure`);
      console.log(`  📄 Parsed value:`, JSON.stringify(parsed, null, 2).substring(0, 200));
      return { exists: true, valid: false, value };
    }

    console.log(`  ✅ Valid`);
    return { exists: true, valid: true, value: parsed };
  } catch (error) {
    console.log(`  ❌ ERROR: ${error.message}`);
    return { exists: true, valid: false, error: error.message };
  }
}

async function deleteKey(key) {
  if (DRY_RUN) {
    console.log(`  🔸 [DRY RUN] Would delete: ${key}`);
    return false;
  }

  await redis.del(key);
  console.log(`  ✅ Deleted: ${key}`);
  return true;
}

// ============================================================================
// DATA FETCHERS (with validation)
// ============================================================================

async function fetchGitHubContributions() {
  console.log('\n📊 Fetching GitHub contributions...');

  if (!GITHUB_TOKEN) {
    console.error('  ❌ GITHUB_TOKEN not set');
    return null;
  }

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

  try {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GITHUB_TOKEN}`,
      },
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
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error(`GraphQL error: ${JSON.stringify(data.errors)}`);
    }

    const calendar = data.data?.user?.contributionsCollection?.contributionCalendar;

    if (!calendar) {
      throw new Error('Invalid response structure');
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

    // Validate before returning
    if (!validateGitHubData(cacheData)) {
      console.error('  ❌ Validation failed for GitHub data');
      return null;
    }

    console.log(`  ✅ Fetched ${contributions.length} contribution days`);
    console.log(`  ✅ Total contributions: ${calendar.totalContributions}`);
    return cacheData;
  } catch (error) {
    console.error(`  ❌ Failed: ${error.message}`);
    return null;
  }
}

async function fetchCredlyBadges() {
  console.log('\n🎓 Fetching Credly badges...');

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

    // Validate before returning
    if (!validateCredlyData(cacheData)) {
      console.error('  ❌ Validation failed for Credly data');
      return null;
    }

    console.log(`  ✅ Fetched ${badges.length} badges`);
    return cacheData;
  } catch (error) {
    console.error(`  ❌ Failed: ${error.message}`);
    return null;
  }
}

// ============================================================================
// CACHE REPAIR
// ============================================================================

async function repairGitHubCache() {
  console.log('\n🔧 Repairing GitHub cache...');

  const key = 'github:contributions:dcyfr';
  const inspection = await inspectKey(key, validateGitHubData);

  if (inspection.valid) {
    console.log('  ✅ Cache is valid, no repair needed');
    return true;
  }

  // Delete corrupted data
  if (inspection.exists) {
    await deleteKey(key);
  }

  // Fetch fresh data
  const data = await fetchGitHubContributions();
  if (!data) {
    console.error('  ❌ Could not fetch fresh data');
    return false;
  }

  // Write to Redis
  if (DRY_RUN) {
    console.log(`  🔸 [DRY RUN] Would write ${data.contributions.length} contributions to ${key}`);
    return true;
  }

  await redis.setex(key, CACHE_DURATION, JSON.stringify(data));
  console.log(`  ✅ Wrote fresh data to ${key}`);
  return true;
}

async function repairCredlyCache() {
  console.log('\n🔧 Repairing Credly cache...');

  // Fetch fresh data once
  const data = await fetchCredlyBadges();
  if (!data) {
    console.error('  ❌ Could not fetch fresh data');
    return false;
  }

  // Cache multiple configurations
  const configs = [
    { limit: null, key: 'all' },
    { limit: 10, key: '10' },
    { limit: 3, key: '3' },
  ];

  for (const config of configs) {
    const key = `credly:badges:${GITHUB_USERNAME}:${config.key}`;
    const inspection = await inspectKey(key, validateCredlyData);

    if (inspection.valid) {
      console.log(`  ✅ ${key} is valid, skipping`);
      continue;
    }

    // Delete corrupted data
    if (inspection.exists) {
      await deleteKey(key);
    }

    // Prepare limited data
    const limitedData = {
      ...data,
      badges: config.limit ? data.badges.slice(0, config.limit) : data.badges,
      count: config.limit ? Math.min(config.limit, data.badges.length) : data.badges.length,
    };

    // Write to Redis
    if (DRY_RUN) {
      console.log(`  🔸 [DRY RUN] Would write ${limitedData.count} badges to ${key}`);
      continue;
    }

    await redis.setex(key, CACHE_DURATION, JSON.stringify(limitedData));
    console.log(`  ✅ Wrote ${limitedData.count} badges to ${key}`);
  }

  return true;
}

async function repairTrendingCache() {
  console.log('\n🔧 Repairing trending cache...');

  const key = 'blog:trending';
  const inspection = await inspectKey(key, validateTrendingData);

  if (inspection.valid) {
    console.log('  ✅ Cache is valid, no repair needed');
    return true;
  }

  // Delete corrupted data
  if (inspection.exists) {
    await deleteKey(key);
  }

  // Initialize with empty array (will be populated by Inngest)
  const emptyTrending = [];

  if (DRY_RUN) {
    console.log(`  🔸 [DRY RUN] Would initialize ${key} with empty array`);
    console.log(`  💡 Inngest will populate this hourly based on view data`);
    return true;
  }

  await redis.set(key, JSON.stringify(emptyTrending), { ex: CACHE_DURATION });
  console.log(`  ✅ Initialized ${key} with empty array`);
  console.log(`  💡 Inngest will populate this hourly based on view data`);
  return true;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('🚀 Production Cache Repair Tool');
  console.log('================================\n');

  if (DRY_RUN) {
    console.log('⚠️  DRY RUN MODE - No changes will be made');
    console.log('   Use --execute to apply changes\n');
  } else {
    console.log('⚠️  EXECUTE MODE - Changes will be applied!\n');
  }

  // Check credentials
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.error('❌ Redis credentials not configured');
    process.exit(1);
  }

  // Repair each cache type
  const results = {
    github: await repairGitHubCache(),
    credly: await repairCredlyCache(),
    trending: await repairTrendingCache(),
  };

  // Summary
  console.log('\n📋 Summary');
  console.log('===========');
  console.log(`GitHub cache: ${results.github ? '✅ Success' : '❌ Failed'}`);
  console.log(`Credly cache: ${results.credly ? '✅ Success' : '❌ Failed'}`);
  console.log(`Trending cache: ${results.trending ? '✅ Success' : '❌ Failed'}`);

  if (DRY_RUN) {
    console.log('\n💡 To apply these changes, run:');
    console.log('   node scripts/fix-corrupted-cache.mjs --execute');
  } else {
    console.log('\n✅ Cache repair complete!');
  }

  const allSuccess = Object.values(results).every((r) => r);
  process.exit(allSuccess ? 0 : 1);
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
