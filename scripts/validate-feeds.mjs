#!/usr/bin/env node

/**
 * Feed Validation Script
 * 
 * Validates RSS, Atom, and JSON feeds for proper formatting and content sanitization.
 * Checks that feed content doesn't include problematic HTML attributes.
 * 
 * Usage:
 *   node scripts/validate-feeds.mjs
 *   npm run feeds:validate
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// Colors for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, ...args) {
  console.log(color, ...args, colors.reset);
}

/**
 * Problematic attributes that shouldn't appear in feed content
 */
const FORBIDDEN_ATTRIBUTES = [
  'data-footnote-ref',
  'data-footnote-backref',
  'data-footnotes',
  'aria-describedby',
  'aria-label',
  'aria-labelledby',
  'aria-hidden',
];

/**
 * Feed endpoints to validate
 */
const FEED_ENDPOINTS = [
  { path: '/feed', type: 'RSS 2.0', contentType: 'application/rss+xml' },
  { path: '/atom.xml', type: 'Atom 1.0', contentType: 'application/atom+xml' },
  { path: '/feed.json', type: 'JSON Feed 1.1', contentType: 'application/feed+json' },
  { path: '/rss.xml', type: 'RSS 2.0 (redirect)', contentType: 'application/rss+xml' },
  { path: '/activity/feed', type: 'RSS 2.0', contentType: 'application/rss+xml' },
  { path: '/activity/rss.xml', type: 'RSS 2.0', contentType: 'application/rss+xml' },
  { path: '/activity/feed.json', type: 'JSON Feed 1.1', contentType: 'application/feed+json' },
  { path: '/blog/feed', type: 'RSS 2.0', contentType: 'application/rss+xml' },
  { path: '/blog/rss.xml', type: 'RSS 2.0', contentType: 'application/rss+xml' },
  { path: '/blog/feed.json', type: 'JSON Feed 1.1', contentType: 'application/feed+json' },
  { path: '/work/feed', type: 'RSS 2.0', contentType: 'application/rss+xml' },
  { path: '/work/rss.xml', type: 'RSS 2.0', contentType: 'application/rss+xml' },
  { path: '/work/feed.json', type: 'JSON Feed 1.1', contentType: 'application/feed+json' },
];

/**
 * Check feed content for forbidden attributes
 */
function validateFeedContent(content, feedPath) {
  const issues = [];
  
  for (const attr of FORBIDDEN_ATTRIBUTES) {
    // Check for attribute in HTML (case-insensitive)
    const regex = new RegExp(`${attr}\\s*=`, 'gi');
    const matches = content.match(regex);
    
    if (matches) {
      issues.push({
        attribute: attr,
        count: matches.length,
        locations: [],
      });
    }
  }
  
  return issues;
}

/**
 * Fetch and validate a feed
 */
async function validateFeed(endpoint) {
  const baseUrl = process.env.SITE_URL || 'http://localhost:3000';
  const url = `${baseUrl}${endpoint.path}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      return {
        endpoint,
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }
    
    const contentType = response.headers.get('content-type') || '';
    const content = await response.text();
    
    // Validate content type
    const hasCorrectContentType = contentType.includes(endpoint.contentType.split(';')[0]);
    
    // Validate content for forbidden attributes
    const contentIssues = validateFeedContent(content, endpoint.path);
    
    return {
      endpoint,
      success: true,
      contentType,
      hasCorrectContentType,
      contentIssues,
      size: content.length,
    };
  } catch (error) {
    return {
      endpoint,
      success: false,
      error: error.message,
    };
  }
}

/**
 * Main validation
 */
async function validateFeeds() {
  log(colors.cyan, '\n🔍 Feed Validation\n');
  
  const results = [];
  let hasErrors = false;
  
  for (const endpoint of FEED_ENDPOINTS) {
    log(colors.blue, `Checking ${endpoint.path} (${endpoint.type})...`);
    const result = await validateFeed(endpoint);
    results.push(result);
    
    if (!result.success) {
      log(colors.red, `  ❌ Failed: ${result.error}`);
      hasErrors = true;
    } else {
      // Check content type
      if (!result.hasCorrectContentType) {
        log(colors.yellow, `  ⚠️  Wrong Content-Type: ${result.contentType}`);
        log(colors.yellow, `      Expected: ${endpoint.contentType}`);
        hasErrors = true;
      } else {
        log(colors.green, `  ✅ Content-Type: ${result.contentType}`);
      }
      
      // Check for forbidden attributes
      if (result.contentIssues.length > 0) {
        log(colors.red, `  ❌ Found ${result.contentIssues.length} forbidden attribute(s):`);
        for (const issue of result.contentIssues) {
          log(colors.red, `     - ${issue.attribute}: ${issue.count} occurrence(s)`);
        }
        hasErrors = true;
      } else {
        log(colors.green, `  ✅ No forbidden attributes`);
      }
      
      // Show size
      const sizeKb = (result.size / 1024).toFixed(2);
      console.log(`     Size: ${sizeKb} KB`);
    }
    
    console.log('');
  }
  
  // Summary
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  log(colors.cyan, '\n📊 Summary\n');
  console.log(`  Total endpoints:     ${total}`);
  console.log(`  Successful:          ${successful}`);
  console.log(`  Failed:              ${total - successful}`);
  
  if (hasErrors) {
    log(colors.red, '\n❌ Feed validation failed\n');
    process.exit(1);
  } else {
    log(colors.green, '\n✅ All feeds validated successfully\n');
  }
}

// Check if dev server is running
const baseUrl = process.env.SITE_URL || 'http://localhost:3000';
console.log(`Using base URL: ${baseUrl}\n`);

if (baseUrl.includes('localhost')) {
  console.log('ℹ️  Make sure dev server is running: npm run dev\n');
}

// Run validation
validateFeeds().catch((error) => {
  log(colors.red, '\n❌ Validation error:', error.message);
  process.exit(1);
});
