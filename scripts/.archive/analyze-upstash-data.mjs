#!/usr/bin/env node
/**
 * Comprehensive Upstash Data Analysis
 *
 * Analyzes all keys in Upstash to identify:
 * - Stale keys (expired or outdated)
 * - Duplicate keys
 * - Malformed keys (undefined, invalid references)
 * - Hanging references (posts/activities that don't exist)
 * - Storage optimization opportunities
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readdir, readFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: resolve(__dirname, '../.env.local') });

import { redis } from '../src/mcp/shared/redis-client.ts';

// Track analysis results
const analysis = {
  totalKeys: 0,
  byPrefix: {},
  malformed: [],
  stale: [],
  duplicates: [],
  hangingReferences: [],
  validReferences: [],
  ttlDistribution: {
    noExpiry: 0,
    lessThan1Hour: 0,
    lessThan1Day: 0,
    lessThan1Week: 0,
    lessThan1Month: 0,
    moreThan1Month: 0,
  },
  storageEstimate: 0,
};

// Get all blog post slugs from content directory
async function getAllBlogPostSlugs() {
  const contentDir = resolve(__dirname, '../src/content/blog');
  try {
    const entries = await readdir(contentDir, { withFileTypes: true });
    const slugs = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
    return slugs;
  } catch (error) {
    console.warn('⚠️  Could not read blog content directory:', error.message);
    return [];
  }
}

// Get all activity event IDs from activity feed
async function getAllActivityEventIds() {
  try {
    const feedKey = 'activity:v2:feed:all';
    const feedData = await redis.get(feedKey);

    if (!feedData) {
      return [];
    }

    const feed = typeof feedData === 'string' ? JSON.parse(feedData) : feedData;
    const eventIds = feed.events?.map((event) => event.id) || [];
    return eventIds;
  } catch (error) {
    console.warn('⚠️  Could not read activity feed:', error.message);
    return [];
  }
}

// Parse a key and extract metadata
function parseKey(key) {
  const parts = key.split(':');
  const prefix = parts[0];

  // Detect malformed keys
  if (key.includes('undefined') || key.includes('null')) {
    return { prefix, malformed: true, reason: 'Contains undefined/null' };
  }

  if (parts.some((part) => part === '')) {
    return { prefix, malformed: true, reason: 'Empty part in key' };
  }

  // Parse specific patterns
  if (prefix === 'views' || prefix === 'likes' || prefix === 'bookmarks' || prefix === 'shares') {
    // Format: {metric}:post:{slug}:day:{date}
    // Or: {metric}:history:activity:{eventId}
    const type = parts[1]; // 'post' or 'history'
    const identifier = parts[2]; // slug or 'activity'

    if (type === 'post' && (identifier === 'undefined' || identifier === 'null' || !identifier)) {
      return { prefix, malformed: true, reason: `Invalid post slug: ${identifier}`, type };
    }

    if (type === 'history' && identifier === 'activity') {
      const eventId = parts[3];
      return { prefix, type, subtype: 'activity', eventId, malformed: false };
    }

    return { prefix, type, identifier, malformed: false };
  }

  if (prefix === 'blog') {
    // Format: blog:analytics:daily:{date}
    const type = parts[1]; // 'analytics'
    const period = parts[2]; // 'daily'
    const date = parts[3]; // YYYY-MM-DD

    if (date && !isValidDate(date)) {
      return { prefix, malformed: true, reason: `Invalid date: ${date}` };
    }

    return { prefix, type, period, date, malformed: false };
  }

  if (prefix === 'activity') {
    // Format: activity:v2:feed:all or activity:feed:all
    return { prefix, version: parts[1], malformed: false };
  }

  return { prefix, malformed: false };
}

// Validate date format (YYYY-MM-DD)
function isValidDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

// Check if a date is stale (older than retention policy)
function isStaleDate(dateString, retentionDays = 90) {
  if (!isValidDate(dateString)) return false;

  const date = new Date(dateString);
  const now = new Date();
  const daysDiff = (now - date) / (1000 * 60 * 60 * 24);

  return daysDiff > retentionDays;
}

// Categorize TTL
function categorizeTTL(ttl) {
  if (ttl === -1) return 'noExpiry';
  if (ttl < 3600) return 'lessThan1Hour';
  if (ttl < 86400) return 'lessThan1Day';
  if (ttl < 604800) return 'lessThan1Week';
  if (ttl < 2592000) return 'lessThan1Month';
  return 'moreThan1Month';
}

// Estimate storage size for a key
async function estimateKeySize(key, type, value) {
  let size = key.length; // Key name

  if (type === 'string') {
    const strValue = typeof value === 'string' ? value : JSON.stringify(value);
    size += strValue.length;
  } else if (type === 'list' || type === 'set') {
    // Approximate - count elements
    size += (value?.length || 0) * 10; // Rough estimate
  } else if (type === 'zset') {
    // Approximate - count members
    size += (value?.length || 0) * 20; // Rough estimate (member + score)
  }

  return size;
}

async function analyzeUpstashData() {
  console.log('🔍 Starting Comprehensive Upstash Data Analysis...\n');

  // Get reference data
  console.log('📚 Loading reference data...');
  const blogPostSlugs = await getAllBlogPostSlugs();
  const activityEventIds = await getAllActivityEventIds();

  console.log(`  ✓ Found ${blogPostSlugs.length} blog posts`);
  console.log(`  ✓ Found ${activityEventIds.length} activity events\n`);

  // Scan all keys
  console.log('🔍 Scanning all keys in Upstash...');
  const allKeys = [];
  let scanCursor = '0';

  do {
    const result = await redis.scan(scanCursor, { count: 100 });
    scanCursor = result[0].toString();
    allKeys.push(...result[1]);
  } while (scanCursor !== '0');

  analysis.totalKeys = allKeys.length;
  console.log(`  ✓ Found ${analysis.totalKeys} keys\n`);

  // Analyze each key
  console.log('🔬 Analyzing keys...');
  for (let i = 0; i < allKeys.length; i++) {
    const key = allKeys[i];

    if ((i + 1) % 50 === 0) {
      console.log(`  Progress: ${i + 1}/${allKeys.length} keys analyzed...`);
    }

    try {
      // Get key type and TTL
      const type = await redis.type(key);
      const ttl = await redis.ttl(key);

      // Get value for analysis
      let value;
      if (type === 'string') {
        value = await redis.get(key);
      } else if (type === 'list') {
        value = await redis.lrange(key, 0, -1);
      } else if (type === 'set') {
        value = await redis.smembers(key);
      } else if (type === 'zset') {
        value = await redis.zrange(key, 0, -1, { withScores: true });
      }

      // Parse key structure
      const parsed = parseKey(key);
      const prefix = parsed.prefix || 'unknown';

      // Track by prefix
      if (!analysis.byPrefix[prefix]) {
        analysis.byPrefix[prefix] = {
          count: 0,
          keys: [],
          malformed: 0,
          stale: 0,
          hanging: 0,
        };
      }
      analysis.byPrefix[prefix].count++;
      analysis.byPrefix[prefix].keys.push({
        key,
        type,
        ttl,
        parsed,
        size: await estimateKeySize(key, type, value),
      });

      // Check for malformed keys
      if (parsed.malformed) {
        analysis.malformed.push({
          key,
          reason: parsed.reason,
          type,
          ttl,
        });
        analysis.byPrefix[prefix].malformed++;
      }

      // Check for stale data
      if (parsed.date && isStaleDate(parsed.date, 90)) {
        analysis.stale.push({
          key,
          reason: `Date older than 90 days: ${parsed.date}`,
          type,
          ttl,
        });
        analysis.byPrefix[prefix].stale++;
      }

      // Check for hanging references (post slugs)
      if (parsed.type === 'post' && parsed.identifier && blogPostSlugs.length > 0) {
        if (!blogPostSlugs.includes(parsed.identifier)) {
          analysis.hangingReferences.push({
            key,
            reason: `Post slug not found: ${parsed.identifier}`,
            type,
            ttl,
          });
          analysis.byPrefix[prefix].hanging++;
        } else {
          analysis.validReferences.push(key);
        }
      }

      // Check for hanging references (activity events)
      if (parsed.subtype === 'activity' && parsed.eventId && activityEventIds.length > 0) {
        if (!activityEventIds.includes(parsed.eventId)) {
          analysis.hangingReferences.push({
            key,
            reason: `Activity event not found: ${parsed.eventId}`,
            type,
            ttl,
          });
          analysis.byPrefix[prefix].hanging++;
        } else {
          analysis.validReferences.push(key);
        }
      }

      // TTL distribution
      const ttlCategory = categorizeTTL(ttl);
      analysis.ttlDistribution[ttlCategory]++;

      // Storage estimate
      analysis.storageEstimate += await estimateKeySize(key, type, value);
    } catch (error) {
      console.error(`❌ Error analyzing key ${key}:`, error.message);
    }
  }

  console.log(`  ✓ Analysis complete\n`);

  // Find duplicates (similar patterns)
  console.log('🔍 Checking for duplicate patterns...');
  const keyPatterns = {};
  for (const key of allKeys) {
    // Normalize key to pattern (replace dates/slugs with placeholders)
    const pattern = key
      .replace(/\d{4}-\d{2}-\d{2}/g, 'DATE')
      .replace(/post-\d{8}-[a-f0-9]{8}/g, 'POST_ID')
      .replace(/:[^:]+$/, ':VALUE'); // Last part might be dynamic

    if (!keyPatterns[pattern]) {
      keyPatterns[pattern] = [];
    }
    keyPatterns[pattern].push(key);
  }

  for (const [pattern, keys] of Object.entries(keyPatterns)) {
    if (keys.length > 10) {
      // Check if they're truly duplicates or just similar patterns
      const uniqueValues = new Set();
      for (const key of keys) {
        const value = await redis.get(key);
        uniqueValues.add(JSON.stringify(value));
      }

      if (uniqueValues.size < keys.length / 2) {
        analysis.duplicates.push({
          pattern,
          count: keys.length,
          uniqueValues: uniqueValues.size,
          example: keys[0],
        });
      }
    }
  }
  console.log(`  ✓ Found ${analysis.duplicates.length} duplicate patterns\n`);

  return analysis;
}

// Generate report
function generateReport(analysis) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 UPSTASH DATA ANALYSIS REPORT');
  console.log('='.repeat(80) + '\n');

  // Summary
  console.log('📈 SUMMARY');
  console.log('-'.repeat(80));
  console.log(`Total Keys: ${analysis.totalKeys}`);
  console.log(
    `Malformed Keys: ${analysis.malformed.length} (${((analysis.malformed.length / analysis.totalKeys) * 100).toFixed(1)}%)`
  );
  console.log(
    `Stale Keys: ${analysis.stale.length} (${((analysis.stale.length / analysis.totalKeys) * 100).toFixed(1)}%)`
  );
  console.log(
    `Hanging References: ${analysis.hangingReferences.length} (${((analysis.hangingReferences.length / analysis.totalKeys) * 100).toFixed(1)}%)`
  );
  console.log(`Valid References: ${analysis.validReferences.length}`);
  console.log(`Duplicate Patterns: ${analysis.duplicates.length}`);
  console.log(`Estimated Storage: ${(analysis.storageEstimate / 1024).toFixed(2)} KB\n`);

  // By Prefix
  console.log('📋 KEYS BY PREFIX');
  console.log('-'.repeat(80));
  const sortedPrefixes = Object.entries(analysis.byPrefix).sort(
    ([, a], [, b]) => b.count - a.count
  );

  for (const [prefix, data] of sortedPrefixes) {
    console.log(`${prefix}:* (${data.count} keys)`);
    if (data.malformed > 0) console.log(`  ⚠️  Malformed: ${data.malformed}`);
    if (data.stale > 0) console.log(`  ⏳ Stale: ${data.stale}`);
    if (data.hanging > 0) console.log(`  🔗 Hanging: ${data.hanging}`);
  }
  console.log('');

  // TTL Distribution
  console.log('⏰ TTL DISTRIBUTION');
  console.log('-'.repeat(80));
  console.log(`No Expiry: ${analysis.ttlDistribution.noExpiry} keys`);
  console.log(`< 1 Hour: ${analysis.ttlDistribution.lessThan1Hour} keys`);
  console.log(`< 1 Day: ${analysis.ttlDistribution.lessThan1Day} keys`);
  console.log(`< 1 Week: ${analysis.ttlDistribution.lessThan1Week} keys`);
  console.log(`< 1 Month: ${analysis.ttlDistribution.lessThan1Month} keys`);
  console.log(`> 1 Month: ${analysis.ttlDistribution.moreThan1Month} keys\n`);

  // Malformed Keys
  if (analysis.malformed.length > 0) {
    console.log('⚠️  MALFORMED KEYS');
    console.log('-'.repeat(80));
    for (const item of analysis.malformed.slice(0, 20)) {
      console.log(`${item.key}`);
      console.log(`  Reason: ${item.reason}`);
      console.log(`  Type: ${item.type}, TTL: ${item.ttl}s\n`);
    }
    if (analysis.malformed.length > 20) {
      console.log(`... and ${analysis.malformed.length - 20} more\n`);
    }
  }

  // Hanging References
  if (analysis.hangingReferences.length > 0) {
    console.log('🔗 HANGING REFERENCES');
    console.log('-'.repeat(80));
    for (const item of analysis.hangingReferences.slice(0, 20)) {
      console.log(`${item.key}`);
      console.log(`  Reason: ${item.reason}`);
      console.log(`  Type: ${item.type}, TTL: ${item.ttl}s\n`);
    }
    if (analysis.hangingReferences.length > 20) {
      console.log(`... and ${analysis.hangingReferences.length - 20} more\n`);
    }
  }

  // Stale Keys
  if (analysis.stale.length > 0) {
    console.log('⏳ STALE KEYS (>90 days old)');
    console.log('-'.repeat(80));
    for (const item of analysis.stale.slice(0, 20)) {
      console.log(`${item.key}`);
      console.log(`  Reason: ${item.reason}`);
      console.log(`  Type: ${item.type}, TTL: ${item.ttl}s\n`);
    }
    if (analysis.stale.length > 20) {
      console.log(`... and ${analysis.stale.length - 20} more\n`);
    }
  }

  // Duplicates
  if (analysis.duplicates.length > 0) {
    console.log('🔄 DUPLICATE PATTERNS');
    console.log('-'.repeat(80));
    for (const item of analysis.duplicates) {
      console.log(`Pattern: ${item.pattern}`);
      console.log(`  Count: ${item.count} keys, Unique Values: ${item.uniqueValues}`);
      console.log(`  Example: ${item.example}\n`);
    }
  }

  // Cleanup Plan
  console.log('🧹 CLEANUP PLAN OF ACTION');
  console.log('-'.repeat(80));

  let totalCleanup = 0;

  if (analysis.malformed.length > 0) {
    console.log(`1. DELETE MALFORMED KEYS (${analysis.malformed.length} keys)`);
    console.log(`   - These keys contain 'undefined', 'null', or empty parts`);
    console.log(`   - Safe to delete: They reference non-existent data`);
    console.log(
      `   - Storage savings: ~${((analysis.malformed.length * 100) / 1024).toFixed(2)} KB\n`
    );
    totalCleanup += analysis.malformed.length;
  }

  if (analysis.hangingReferences.length > 0) {
    console.log(`2. DELETE HANGING REFERENCES (${analysis.hangingReferences.length} keys)`);
    console.log(`   - These keys reference posts/activities that no longer exist`);
    console.log(`   - Safe to delete: No functional impact`);
    console.log(
      `   - Storage savings: ~${((analysis.hangingReferences.length * 100) / 1024).toFixed(2)} KB\n`
    );
    totalCleanup += analysis.hangingReferences.length;
  }

  if (analysis.stale.length > 0) {
    console.log(`3. REVIEW STALE KEYS (${analysis.stale.length} keys)`);
    console.log(`   - These keys are older than 90 days`);
    console.log(`   - Consider: Are historical analytics still needed?`);
    console.log(`   - Recommendation: Archive or delete based on retention policy`);
    console.log(
      `   - Potential savings: ~${((analysis.stale.length * 100) / 1024).toFixed(2)} KB\n`
    );
  }

  console.log('💡 RECOMMENDATIONS');
  console.log('-'.repeat(80));
  console.log(
    `✅ Immediate cleanup: ${totalCleanup} keys (${((totalCleanup / analysis.totalKeys) * 100).toFixed(1)}% of total)`
  );
  console.log(`✅ Storage reduction: ~${((totalCleanup * 100) / 1024).toFixed(2)} KB`);
  console.log(`✅ Create backup before cleanup`);
  console.log(`✅ Implement TTL policies for future data`);
  console.log(`✅ Add validation to prevent malformed keys\n`);

  // Save detailed report to file
  return {
    summary: {
      totalKeys: analysis.totalKeys,
      malformed: analysis.malformed.length,
      stale: analysis.stale.length,
      hanging: analysis.hangingReferences.length,
      cleanup: totalCleanup,
    },
    malformedKeys: analysis.malformed.map((k) => k.key),
    hangingKeys: analysis.hangingReferences.map((k) => k.key),
    staleKeys: analysis.stale.map((k) => k.key),
  };
}

// Main execution
async function main() {
  try {
    const results = await analyzeUpstashData();
    const cleanup = generateReport(results);

    // Save cleanup data for script execution
    const cleanupData = JSON.stringify(cleanup, null, 2);
    const fs = await import('fs/promises');
    await fs.writeFile(resolve(__dirname, '../.upstash-cleanup-plan.json'), cleanupData);

    console.log('📝 Cleanup plan saved to: .upstash-cleanup-plan.json');
    console.log('   Run: npm run redis:cleanup to execute cleanup\n');
  } catch (error) {
    console.error('❌ Analysis failed:', error);
    process.exit(1);
  }
}

main();
