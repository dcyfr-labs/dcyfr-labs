#!/usr/bin/env node

/**
 * Validate blog post IDs for CI
 * 
 * Ensures:
 * 1. All posts have explicit `id` fields in frontmatter
 * 2. IDs match the expected format (post-YYYYMMDD-{hash})
 * 3. No duplicate IDs across posts
 * 
 * Exit codes:
 * 0 - All posts valid
 * 1 - Validation errors found
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import yaml from 'js-yaml';
import crypto from 'crypto';

const CONTENT_DIR = path.join(process.cwd(), 'src/content/blog');
const ID_FORMAT_REGEX = /^post-\d{8}-[a-f0-9]{8}$/;

function generatePostId(publishedAt, slug) {
  const input = `${publishedAt}:${slug}`;
  const hash = crypto.createHash('sha256').update(input).digest('hex').substring(0, 8);
  const datePart = publishedAt.split('T')[0];
  const date = datePart.replace(/-/g, '');
  return `post-${date}-${hash}`;
}

function getAllPosts() {
  const entries = fs.readdirSync(CONTENT_DIR, { withFileTypes: true });
  const posts = [];

  for (const entry of entries) {
    let slug, filePath;

    if (entry.isFile() && entry.name.endsWith('.mdx')) {
      slug = entry.name.replace(/\.mdx$/, '');
      filePath = path.join(CONTENT_DIR, entry.name);
    } else if (entry.isDirectory()) {
      const indexPath = path.join(CONTENT_DIR, entry.name, 'index.mdx');
      if (fs.existsSync(indexPath)) {
        slug = entry.name;
        filePath = indexPath;
      } else continue;
    } else continue;

    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(fileContents, {
      engines: { yaml: (s) => yaml.load(s, { schema: yaml.JSON_SCHEMA }) },
    });

    posts.push({
      slug,
      filePath: path.relative(process.cwd(), filePath),
      frontmatterId: data.id,
      publishedAt: data.publishedAt,
      calculatedId: generatePostId(data.publishedAt, slug),
    });
  }

  return posts;
}

function validate() {
  console.log('🔍 Validating blog post IDs...\n');
  
  const posts = getAllPosts();
  const errors = [];
  const warnings = [];
  const seenIds = new Map(); // id -> filePath

  for (const post of posts) {
    // Check 1: Explicit ID required
    if (!post.frontmatterId) {
      errors.push({
        file: post.filePath,
        issue: 'Missing explicit `id` field in frontmatter',
        fix: `Add: id: "${post.calculatedId}"`,
      });
      continue;
    }

    // Check 2: ID format validation
    if (!ID_FORMAT_REGEX.test(post.frontmatterId)) {
      errors.push({
        file: post.filePath,
        issue: `Invalid ID format: "${post.frontmatterId}"`,
        fix: `Expected format: post-YYYYMMDD-{8-char-hash}`,
      });
    }

    // Check 3: Duplicate ID detection
    if (seenIds.has(post.frontmatterId)) {
      errors.push({
        file: post.filePath,
        issue: `Duplicate ID: "${post.frontmatterId}"`,
        fix: `Also used by: ${seenIds.get(post.frontmatterId)}`,
      });
    } else {
      seenIds.set(post.frontmatterId, post.filePath);
    }

    // Check 4: ID matches calculated (warning only - may be intentional)
    if (post.frontmatterId !== post.calculatedId) {
      warnings.push({
        file: post.filePath,
        issue: `ID differs from calculated value`,
        detail: `Current: ${post.frontmatterId}, Calculated: ${post.calculatedId}`,
        note: 'This is OK if intentional (e.g., preserving analytics after slug/date change)',
      });
    }
  }

  // Report results
  if (errors.length > 0) {
    console.log('❌ ERRORS:\n');
    for (const error of errors) {
      console.log(`   ${error.file}`);
      console.log(`   Issue: ${error.issue}`);
      console.log(`   Fix: ${error.fix}`);
      console.log('');
    }
  }

  if (warnings.length > 0) {
    console.log('⚠️  WARNINGS:\n');
    for (const warning of warnings) {
      console.log(`   ${warning.file}`);
      console.log(`   ${warning.issue}`);
      console.log(`   ${warning.detail}`);
      console.log(`   Note: ${warning.note}`);
      console.log('');
    }
  }

  // Summary
  console.log('📊 SUMMARY:\n');
  console.log(`   Posts validated: ${posts.length}`);
  console.log(`   Errors: ${errors.length}`);
  console.log(`   Warnings: ${warnings.length}`);

  if (errors.length === 0) {
    console.log('\n✅ All posts have valid IDs!');
    process.exit(0);
  } else {
    console.log('\n❌ Validation failed. Fix the errors above.');
    process.exit(1);
  }
}

validate();
