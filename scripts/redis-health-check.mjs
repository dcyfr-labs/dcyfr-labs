#!/usr/bin/env node
/**
 * Redis Cache Health Check & Analysis
 *
 * Comprehensive tool for analyzing Redis cache health:
 * - Activity feed cache analysis
 * - GitHub activity detection and removal
 * - Key statistics and memory usage
 * - Stale data detection
 * - Cache optimization recommendations
 *
 * Usage:
 *   npm run redis:health              # Full health check
 *   npm run redis:health -- --clean   # Health check + cleanup
 *   npm run redis:health -- --github  # Check for GitHub activity only
 */

import { Redis } from '@upstash/redis';
import { config } from 'dotenv';

config({ path: '.env.local' });

// ============================================================================
// CONFIGURATION
// ============================================================================

const CACHE_KEY = 'activity:feed:all';
const GITHUB_SOURCES = ['github']; // GitHub activity sources to detect/remove

// ============================================================================
// REDIS CLIENT
// ============================================================================

async function getRedisClient() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.error(
      '❌ UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not configured in environment'
    );
    process.exit(1);
  }

  console.log('✅ Connected to Redis\n');
  return new Redis({ url, token });
}

// ============================================================================
// ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Analyze activity feed cache
 */
async function analyzeActivityCache(redis) {
  console.log('📊 Activity Feed Cache Analysis');
  console.log('═'.repeat(50));

  const cached = await redis.get(CACHE_KEY);

  if (!cached) {
    console.log('⚠️  No cached activity feed found');
    console.log('   Cache will be populated on next page visit\n');
    return null;
  }

  let activities = [];
  try {
    activities = JSON.parse(cached);
  } catch (error) {
    console.error('❌ Failed to parse cached activities:', error.message);
    return null;
  }

  console.log(`✅ Cache key: ${CACHE_KEY}`);
  console.log(`✅ Total activities: ${activities.length}`);

  // TTL check
  const ttl = await redis.ttl(CACHE_KEY);
  if (ttl > 0) {
    console.log(`⏱️  Time to live: ${Math.floor(ttl / 60)} minutes ${ttl % 60} seconds`);
  } else if (ttl === -1) {
    console.log('⚠️  No TTL set (cache will persist until manually cleared)');
  } else {
    console.log('⚠️  Key expired or does not exist');
  }

  console.log('');
  return activities;
}

/**
 * Analyze activity sources
 */
function analyzeActivitySources(activities) {
  console.log('📈 Activity Sources Breakdown');
  console.log('═'.repeat(50));

  const sourceCounts = {};
  const githubActivities = [];

  activities.forEach((activity) => {
    const source = activity.source || 'unknown';
    sourceCounts[source] = (sourceCounts[source] || 0) + 1;

    // Track GitHub activities
    if (GITHUB_SOURCES.includes(source)) {
      githubActivities.push(activity);
    }
  });

  // Sort by count
  const sorted = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1]);

  sorted.forEach(([source, count]) => {
    const percentage = ((count / activities.length) * 100).toFixed(1);
    const icon = GITHUB_SOURCES.includes(source) ? '⚠️ ' : '  ';
    console.log(`${icon}${source.padEnd(20)} ${count.toString().padStart(4)} (${percentage}%)`);
  });

  console.log('');
  return githubActivities;
}

/**
 * Analyze activity timestamps for staleness
 */
function analyzeTimestamps(activities) {
  console.log('⏰ Activity Timeline Analysis');
  console.log('═'.repeat(50));

  const now = new Date();
  const timestamps = activities
    .map((a) => {
      const ts = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
      return { id: a.id, source: a.source, timestamp: ts };
    })
    .sort((a, b) => b.timestamp - a.timestamp);

  if (timestamps.length === 0) {
    console.log('⚠️  No activities found');
    console.log('');
    return;
  }

  const newest = timestamps[0];
  const oldest = timestamps[timestamps.length - 1];
  const ageInDays = Math.floor((now - oldest.timestamp) / (1000 * 60 * 60 * 24));

  console.log(`📅 Newest activity: ${newest.timestamp.toLocaleDateString()} (${newest.source})`);
  console.log(`📅 Oldest activity: ${oldest.timestamp.toLocaleDateString()} (${oldest.source})`);
  console.log(`📅 Age range: ${ageInDays} days`);
  console.log('');
}

/**
 * Check all Redis keys related to activities
 */
async function checkAllKeys(redis) {
  console.log('🔑 Redis Key Analysis');
  console.log('═'.repeat(50));

  const patterns = ['activity:*', 'github:*', 'views:*', 'likes:*', 'bookmarks:*', 'analytics:*'];

  for (const pattern of patterns) {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      console.log(`${pattern.padEnd(20)} ${keys.length} keys`);
    }
  }

  console.log('');
}

/**
 * Clean GitHub activities from cache
 */
async function cleanGitHubActivities(redis, githubActivities) {
  if (githubActivities.length === 0) {
    console.log('✅ No GitHub activities found - cache is clean\n');
    return false;
  }

  console.log('🧹 Cleaning GitHub Activities');
  console.log('═'.repeat(50));
  console.log(`⚠️  Found ${githubActivities.length} GitHub activities`);

  // Get current cache
  const cached = await redis.get(CACHE_KEY);
  if (!cached) {
    console.log('⚠️  Cache already empty\n');
    return false;
  }

  const activities = JSON.parse(cached);
  const cleaned = activities.filter((a) => !GITHUB_SOURCES.includes(a.source));

  console.log(`   Removing ${activities.length - cleaned.length} activities...`);

  // Update cache
  await redis.set(CACHE_KEY, JSON.stringify(cleaned));
  await redis.expire(CACHE_KEY, 300); // 5 minutes TTL

  console.log(`✅ Cache updated: ${activities.length} → ${cleaned.length} activities`);
  console.log('');
  return true;
}

/**
 * Generate recommendations
 */
function generateRecommendations(activities, githubActivities) {
  console.log('💡 Recommendations');
  console.log('═'.repeat(50));

  const recommendations = [];

  // GitHub activity check
  if (githubActivities.length > 0) {
    recommendations.push({
      severity: 'high',
      message: `Remove ${githubActivities.length} GitHub activities from cache`,
      action: 'Run: npm run redis:health -- --clean',
    });
  }

  // Cache age check
  const oldest = activities.reduce((min, a) => {
    const ts = new Date(a.timestamp);
    return ts < min ? ts : min;
  }, new Date());

  const ageInDays = Math.floor((new Date() - oldest) / (1000 * 60 * 60 * 24));
  if (ageInDays > 365) {
    recommendations.push({
      severity: 'low',
      message: `Cache contains activities from ${ageInDays} days ago`,
      action: 'Consider archiving old activities',
    });
  }

  // Display recommendations
  if (recommendations.length === 0) {
    console.log('✅ No issues detected - cache is healthy');
  } else {
    recommendations.forEach((rec, i) => {
      const icon = rec.severity === 'high' ? '⚠️ ' : 'ℹ️ ';
      console.log(`${icon}${i + 1}. ${rec.message}`);
      console.log(`   ${rec.action}`);
    });
  }

  console.log('');
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const shouldClean = args.includes('--clean');
  const githubOnly = args.includes('--github');

  console.log('🔍 Redis Cache Health Check');
  console.log('═'.repeat(50));
  console.log('');

  const redis = await getRedisClient();

  try {
    // Analyze activity cache
    const activities = await analyzeActivityCache(redis);

    if (!activities || activities.length === 0) {
      console.log('ℹ️  No activities to analyze');
      return;
    }

    // Source analysis (with GitHub detection)
    const githubActivities = analyzeActivitySources(activities);

    if (githubOnly) {
      if (githubActivities.length > 0) {
        console.log(`⚠️  Found ${githubActivities.length} GitHub activities:`);
        githubActivities.slice(0, 5).forEach((a) => {
          console.log(`   - ${a.title} (${new Date(a.timestamp).toLocaleDateString()})`);
        });
        if (githubActivities.length > 5) {
          console.log(`   ... and ${githubActivities.length - 5} more`);
        }
      } else {
        console.log('✅ No GitHub activities found');
      }
      console.log('');
      return;
    }

    // Timeline analysis
    analyzeTimestamps(activities);

    // All keys check
    await checkAllKeys(redis);

    // Cleanup if requested
    if (shouldClean) {
      await cleanGitHubActivities(redis, githubActivities);
    }

    // Recommendations
    generateRecommendations(activities, githubActivities);

    console.log('✅ Health check complete');
  } catch (error) {
    console.error('❌ Health check failed:', error);
    throw error;
  }
}

// Run
main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
