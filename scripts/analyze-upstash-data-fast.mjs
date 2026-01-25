#!/usr/bin/env node
/**
 * Fast Upstash Data Analysis (Optimized Version)
 *
 * Quickly analyzes all keys in Upstash to identify issues.
 * Uses batch processing and minimal Redis calls for speed.
 */

// Load environment variables
import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readdir } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../.env.local') });

import { redis } from '../src/mcp/shared/redis-client.ts';

// Get blog post slugs
async function getAllBlogPostSlugs() {
  const contentDir = resolve(__dirname, '../src/content/blog');
  try {
    const entries = await readdir(contentDir, { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    return [];
  }
}

// Parse key and check for issues
function analyzeKey(key, blogPostSlugs) {
  const parts = key.split(':');
  const prefix = parts[0];
  const issues = [];

  // Check for malformed keys
  if (key.includes('undefined') || key.includes('null')) {
    issues.push({ type: 'malformed', reason: 'Contains undefined/null' });
  }

  if (parts.some((part) => part === '')) {
    issues.push({ type: 'malformed', reason: 'Empty part in key' });
  }

  // Check for stale dates (>90 days)
  const dateMatch = key.match(/(\d{4}-\d{2}-\d{2})/);
  if (dateMatch) {
    const date = new Date(dateMatch[1]);
    const daysOld = (new Date() - date) / (1000 * 60 * 60 * 24);
    if (daysOld > 90) {
      issues.push({ type: 'stale', reason: `${Math.floor(daysOld)} days old` });
    }
  }

  // Check for hanging post references
  if (prefix in { views: 1, likes: 1, bookmarks: 1, shares: 1 }) {
    if (parts[1] === 'post') {
      const slug = parts[2];
      if (slug && slug !== 'undefined' && slug !== 'null' && blogPostSlugs.length > 0) {
        if (!blogPostSlugs.includes(slug)) {
          issues.push({ type: 'hanging', reason: `Post not found: ${slug}` });
        }
      }
    }
  }

  return { prefix, issues };
}

async function main() {
  console.log('🔍 Fast Upstash Data Analysis\n');

  // Get reference data
  console.log('📚 Loading blog posts...');
  const blogPostSlugs = await getAllBlogPostSlugs();
  console.log(`  ✓ Found ${blogPostSlugs.length} blog posts\n`);

  // Scan all keys
  console.log('🔍 Scanning keys...');
  const allKeys = [];
  let scanCursor = '0';

  do {
    const result = await redis.scan(scanCursor, { count: 100 });
    scanCursor = result[0].toString();
    allKeys.push(...result[1]);
  } while (scanCursor !== '0');

  console.log(`  ✓ Found ${allKeys.length} keys\n`);

  // Analyze keys (no Redis calls - just pattern analysis)
  console.log('🔬 Analyzing patterns...');
  const results = {
    total: allKeys.length,
    byPrefix: {},
    malformed: [],
    stale: [],
    hanging: [],
  };

  for (const key of allKeys) {
    const { prefix, issues } = analyzeKey(key, blogPostSlugs);

    // Track by prefix
    if (!results.byPrefix[prefix]) {
      results.byPrefix[prefix] = { count: 0, issues: 0 };
    }
    results.byPrefix[prefix].count++;

    // Collect issues
    for (const issue of issues) {
      results.byPrefix[prefix].issues++;
      if (issue.type === 'malformed') {
        results.malformed.push({ key, reason: issue.reason });
      } else if (issue.type === 'stale') {
        results.stale.push({ key, reason: issue.reason });
      } else if (issue.type === 'hanging') {
        results.hanging.push({ key, reason: issue.reason });
      }
    }
  }

  console.log(`  ✓ Analysis complete\n`);

  // Generate report
  console.log('='.repeat(80));
  console.log('📊 ANALYSIS REPORT');
  console.log('='.repeat(80) + '\n');

  console.log('📈 SUMMARY');
  console.log('-'.repeat(80));
  console.log(`Total Keys: ${results.total}`);
  console.log(
    `Malformed: ${results.malformed.length} (${((results.malformed.length / results.total) * 100).toFixed(1)}%)`
  );
  console.log(
    `Stale (>90 days): ${results.stale.length} (${((results.stale.length / results.total) * 100).toFixed(1)}%)`
  );
  console.log(
    `Hanging References: ${results.hanging.length} (${((results.hanging.length / results.total) * 100).toFixed(1)}%)\n`
  );

  console.log('📋 KEYS BY PREFIX');
  console.log('-'.repeat(80));
  const sortedPrefixes = Object.entries(results.byPrefix).sort(([, a], [, b]) => b.count - a.count);

  for (const [prefix, data] of sortedPrefixes) {
    const issueStr = data.issues > 0 ? ` (⚠️  ${data.issues} issues)` : '';
    console.log(`${prefix}:* - ${data.count} keys${issueStr}`);
  }
  console.log('');

  // Malformed keys
  if (results.malformed.length > 0) {
    console.log('⚠️  MALFORMED KEYS (HIGH PRIORITY - DELETE)');
    console.log('-'.repeat(80));
    for (const item of results.malformed.slice(0, 10)) {
      console.log(`❌ ${item.key}`);
      console.log(`   Reason: ${item.reason}\n`);
    }
    if (results.malformed.length > 10) {
      console.log(`... and ${results.malformed.length - 10} more\n`);
    }
  }

  // Hanging references
  if (results.hanging.length > 0) {
    console.log('🔗 HANGING REFERENCES (MEDIUM PRIORITY - DELETE)');
    console.log('-'.repeat(80));
    for (const item of results.hanging.slice(0, 10)) {
      console.log(`❌ ${item.key}`);
      console.log(`   Reason: ${item.reason}\n`);
    }
    if (results.hanging.length > 10) {
      console.log(`... and ${results.hanging.length - 10} more\n`);
    }
  }

  // Stale keys
  if (results.stale.length > 0) {
    console.log('⏳ STALE KEYS (LOW PRIORITY - REVIEW)');
    console.log('-'.repeat(80));
    const staleByMonth = {};
    for (const item of results.stale) {
      const match = item.key.match(/(\d{4}-\d{2})-\d{2}/);
      if (match) {
        const month = match[1];
        if (!staleByMonth[month]) staleByMonth[month] = [];
        staleByMonth[month].push(item.key);
      }
    }

    const months = Object.keys(staleByMonth).sort();
    for (const month of months.slice(0, 3)) {
      console.log(`📅 ${month}: ${staleByMonth[month].length} keys`);
      for (const key of staleByMonth[month].slice(0, 3)) {
        console.log(`   ${key}`);
      }
      if (staleByMonth[month].length > 3) {
        console.log(`   ... and ${staleByMonth[month].length - 3} more`);
      }
    }
    console.log('');
  }

  // Cleanup plan
  console.log('🧹 CLEANUP PLAN');
  console.log('-'.repeat(80));

  const immediateCleanup = results.malformed.length + results.hanging.length;
  const reviewCleanup = results.stale.length;

  console.log('IMMEDIATE ACTION (Safe to Delete):');
  console.log(`  1. Malformed keys: ${results.malformed.length} keys`);
  console.log(`     → DELETE all (contain undefined/null/empty parts)`);
  console.log(`  2. Hanging references: ${results.hanging.length} keys`);
  console.log(`     → DELETE all (reference non-existent posts)`);
  console.log(
    `  Total immediate cleanup: ${immediateCleanup} keys (${((immediateCleanup / results.total) * 100).toFixed(1)}%)\n`
  );

  if (reviewCleanup > 0) {
    console.log('REVIEW & DECIDE:');
    console.log(`  3. Stale keys: ${reviewCleanup} keys`);
    console.log(`     → REVIEW retention policy before deleting`);
    console.log(`     → Consider archiving vs deleting\n`);
  }

  console.log('💡 RECOMMENDATIONS');
  console.log('-'.repeat(80));
  console.log('✅ Create backup before cleanup');
  console.log('✅ Start with malformed keys (safest)');
  console.log('✅ Then remove hanging references');
  console.log('✅ Review stale keys policy (keep 90 days? 180 days?)');
  console.log('✅ Add input validation to prevent future malformed keys\n');

  // Save cleanup list
  const cleanupData = {
    malformed: results.malformed.map((r) => r.key),
    hanging: results.hanging.map((r) => r.key),
    stale: results.stale.map((r) => r.key),
  };

  const fs = await import('fs/promises');
  await fs.writeFile(
    resolve(__dirname, '../.upstash-cleanup-plan.json'),
    JSON.stringify(cleanupData, null, 2)
  );

  console.log('📝 Cleanup plan saved to: .upstash-cleanup-plan.json');
  console.log('   Keys to cleanup: malformed + hanging = ' + immediateCleanup + ' keys\n');
}

main().catch(console.error);
