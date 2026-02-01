#!/usr/bin/env node
/**
 * Sync Production Metrics to Preview Database
 *
 * This script syncs analytics metrics from production Redis to preview Redis
 * during build time, ensuring preview/dev environments have accurate production
 * analytics data for development and testing.
 *
 * ✅ Safe to run: Only reads from production, writes to preview (one-way sync)
 * ✅ Environment-aware: Automatically detects production credentials
 * ✅ Build integration: Designed to run as part of build process
 *
 * Usage:
 *   npm run sync:metrics          # Full sync (all keys)
 *   npm run sync:metrics:dry-run  # Preview what would be synced
 *   npm run sync:metrics:quick    # Sync only critical keys
 *
 * Synced Metrics:
 * - blog:trending                 # Trending blog posts (production data)
 * - analytics:milestones          # Vercel Analytics (optional, future)
 * - github:traffic:milestones     # GitHub traffic (optional, future)
 * - pageviews:* (all paths)       # Page view counters
 * - engagement:* (all content)    # Likes/shares/clicks
 *
 * Security:
 * - Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN (production)
 * - Requires UPSTASH_REDIS_REST_URL_PREVIEW and UPSTASH_REDIS_REST_TOKEN_PREVIEW
 * - Will NOT sync sensitive keys (sessions, blocked IPs, API keys)
 */

import dotenv from 'dotenv';
import { Redis } from '@upstash/redis';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

/**
 * Escapes regex special characters in a pattern string, preserving wildcards.
 * Prevents regex injection (CWE-94) by escaping metacharacters except `*` (wildcard).
 */
function escapeRegExp(pattern) {
  return pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // Escape special chars
    .replace(/\*/g, '.*'); // Convert wildcard * to .*
}

// ============================================================================
// Configuration
// ============================================================================

const SYNC_PATTERNS = {
  // Critical analytics keys (always sync)
  critical: [
    'blog:trending', // Only production data
  ],
  // Optional analytics (future implementation)
  optional: [
    'analytics:milestones', // Vercel Analytics (not yet scheduled)
    'github:traffic:milestones', // GitHub traffic (not yet scheduled)
  ],
  // Page view counters (pattern-based)
  pageviews: 'pageviews:*',
  // Engagement metrics (pattern-based)
  engagement: 'engagement:*',
  // Project views
  projects: 'project:views:*',
  // Actual engagement data from production
  likes: 'likes:*',
  bookmarks: 'bookmarks:*',
  shares: 'shares:*',
  views: 'views:*',
};

const EXCLUDED_PATTERNS = [
  // Security-sensitive keys
  'session:*',
  'blocked:ips',
  'suspicious:ips',
  'rate_limit:*',
  'ip:reputation:*',
  'nonce:*',
  'csrf:*',
  // API tokens and credentials
  'inoreader:tokens',
  '*:api_key',
  '*:token',
  '*:secret',
  // MCP health tracking (environment-specific)
  'mcp:health:*',
  // Cache versioning (environment-specific)
  'cache:version:*',
  // History keys (complex data structures - sorted sets)
  '*:history:*',
];

// ============================================================================
// Redis Client Setup
// ============================================================================

function createProductionClient() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.error('❌ Production Redis credentials missing');
    console.error('   Required: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN');
    process.exit(1);
  }

  return new Redis({ url, token });
}

function createPreviewClient() {
  const url = process.env.UPSTASH_REDIS_REST_URL_PREVIEW;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN_PREVIEW;

  if (!url || !token) {
    console.error('❌ Preview Redis credentials missing');
    console.error('   Required: UPSTASH_REDIS_REST_URL_PREVIEW, UPSTASH_REDIS_REST_TOKEN_PREVIEW');
    process.exit(1);
  }

  return new Redis({ url, token });
}

// ============================================================================
// Key Filtering
// ============================================================================

function isExcluded(key) {
  return EXCLUDED_PATTERNS.some((pattern) => {
    // FIX: CWE-94 - Use secure regex escaping to prevent injection
    const regex = new RegExp('^' + escapeRegExp(pattern) + '$');
    return regex.test(key);
  });
}

function matchesPattern(key, pattern) {
  // FIX: CWE-94 - Use secure regex escaping to prevent injection
  const regex = new RegExp('^' + escapeRegExp(pattern) + '$');
  return regex.test(key);
}

// ============================================================================
// Sync Operations
// ============================================================================

async function syncCriticalKeys(prodRedis, previewRedis, dryRun = false) {
  console.log('\n📊 Syncing critical analytics keys...');
  const synced = [];

  for (const key of SYNC_PATTERNS.critical) {
    try {
      const value = await prodRedis.get(key);

      if (value === null) {
        console.log(`   ⊘ ${key} (not found in production)`);
        continue;
      }

      if (dryRun) {
        console.log(`   ✓ ${key} (would sync)`);
      } else {
        // Add 'preview:' prefix for preview environment
        await previewRedis.set(`preview:${key}`, value);
        console.log(`   ✓ ${key} → preview:${key}`);
      }

      synced.push(key);
    } catch (error) {
      console.error(`   ✗ ${key} (error: ${error.message})`);
    }
  }

  return synced;
}

async function syncOptionalKeys(prodRedis, previewRedis, dryRun = false) {
  console.log('\n📊 Syncing optional analytics keys (future features)...');
  const synced = [];

  for (const key of SYNC_PATTERNS.optional) {
    try {
      const value = await prodRedis.get(key);

      if (value === null) {
        console.log(`   ⊘ ${key} (not yet implemented in production)`);
        continue;
      }

      if (dryRun) {
        console.log(`   ✓ ${key} (would sync)`);
      } else {
        // Add 'preview:' prefix for preview environment
        await previewRedis.set(`preview:${key}`, value);
        console.log(`   ✓ ${key} → preview:${key}`);
      }

      synced.push(key);
    } catch (error) {
      console.error(`   ✗ ${key} (error: ${error.message})`);
    }
  }

  return synced;
}

async function syncPatternKeys(prodRedis, previewRedis, pattern, label, dryRun = false) {
  console.log(`\n📊 Syncing ${label}...`);
  const synced = [];

  try {
    // Scan for keys matching pattern
    const keys = await prodRedis.keys(pattern);

    if (!keys || keys.length === 0) {
      console.log(`   ℹ️  No ${label} found in production`);
      return synced;
    }

    console.log(`   Found ${keys.length} keys matching ${pattern}`);

    for (const key of keys) {
      // Skip excluded keys (history keys use sorted sets, not strings)
      if (isExcluded(key)) {
        continue;
      }

      try {
        const value = await prodRedis.get(key);

        if (value === null) {
          continue;
        }

        if (dryRun) {
          console.log(`   ✓ ${key} (would sync)`);
          synced.push(key); // Track for stats
        } else {
          // Add 'preview:' prefix for preview environment
          await previewRedis.set(`preview:${key}`, value);
          synced.push(key);

          // Only log first 10 keys to avoid spam
          if (synced.length <= 10) {
            console.log(`   ✓ ${key} → preview:${key}`);
          }
        }
      } catch (error) {
        // Skip errors silently (likely wrong data type for history keys)
        // Only log unexpected errors
        if (!error.message.includes('WRONGTYPE')) {
          console.error(`   ✗ ${key} (error: ${error.message})`);
        }
      }
    }

    if (synced.length > 10) {
      console.log(`   ... and ${synced.length - 10} more`);
    }
  } catch (error) {
    console.error(`   ✗ Failed to scan ${pattern}: ${error.message}`);
  }

  return synced;
}

// ============================================================================
// Main Sync Function
// ============================================================================

async function syncMetrics(options = {}) {
  const { dryRun = false, quickMode = false } = options;

  console.log('🔄 Production Metrics Sync');
  console.log('='.repeat(60));
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE SYNC'}`);
  console.log(`Speed: ${quickMode ? 'QUICK (critical only)' : 'FULL'}`);
  console.log('');

  const prodRedis = createProductionClient();
  const previewRedis = createPreviewClient();

  const stats = {
    critical: [],
    optional: [],
    pageviews: [],
    engagement: [],
    projects: [],
    likes: [],
    bookmarks: [],
    shares: [],
    views: [],
  };

  try {
    // Always sync critical keys
    stats.critical = await syncCriticalKeys(prodRedis, previewRedis, dryRun);

    // Sync optional keys (future features)
    stats.optional = await syncOptionalKeys(prodRedis, previewRedis, dryRun);

    // Full sync includes pattern-based keys
    if (!quickMode) {
      stats.pageviews = await syncPatternKeys(
        prodRedis,
        previewRedis,
        SYNC_PATTERNS.pageviews,
        'page view counters',
        dryRun
      );

      stats.engagement = await syncPatternKeys(
        prodRedis,
        previewRedis,
        SYNC_PATTERNS.engagement,
        'engagement metrics',
        dryRun
      );

      stats.projects = await syncPatternKeys(
        prodRedis,
        previewRedis,
        SYNC_PATTERNS.projects,
        'project views',
        dryRun
      );

      stats.likes = await syncPatternKeys(
        prodRedis,
        previewRedis,
        SYNC_PATTERNS.likes,
        'likes',
        dryRun
      );

      stats.bookmarks = await syncPatternKeys(
        prodRedis,
        previewRedis,
        SYNC_PATTERNS.bookmarks,
        'bookmarks',
        dryRun
      );

      stats.shares = await syncPatternKeys(
        prodRedis,
        previewRedis,
        SYNC_PATTERNS.shares,
        'share history',
        dryRun
      );

      stats.views = await syncPatternKeys(
        prodRedis,
        previewRedis,
        SYNC_PATTERNS.views,
        'view history',
        dryRun
      );
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📈 Sync Summary');
    console.log('='.repeat(60));
    console.log(`Critical keys:    ${stats.critical.length} synced`);
    console.log(`Optional keys:    ${stats.optional.length} synced (future features)`);
    console.log(`Page views:       ${stats.pageviews.length} synced`);
    console.log(`Engagement:       ${stats.engagement.length} synced`);
    console.log(`Project views:    ${stats.projects.length} synced`);
    console.log(`Likes:            ${stats.likes.length} synced`);
    console.log(`Bookmarks:        ${stats.bookmarks.length} synced`);
    console.log(`Shares:           ${stats.shares.length} synced`);
    console.log(`Views:            ${stats.views.length} synced`);
    console.log('─'.repeat(60));

    const total =
      stats.critical.length +
      stats.optional.length +
      stats.pageviews.length +
      stats.engagement.length +
      stats.projects.length +
      stats.likes.length +
      stats.bookmarks.length +
      stats.shares.length +
      stats.views.length;

    console.log(`Total:            ${total} keys ${dryRun ? 'would be synced' : 'synced'}`);
    console.log('');

    if (dryRun) {
      console.log('💡 Run without --dry-run to perform actual sync');
    } else {
      console.log('✅ Sync complete! Preview database now has production metrics.');
    }
  } catch (error) {
    console.error('\n❌ Sync failed:', error.message);
    process.exit(1);
  }
}

// ============================================================================
// CLI
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run') || args.includes('-d');
  const quickMode = args.includes('--quick') || args.includes('-q');

  await syncMetrics({ dryRun, quickMode });
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
