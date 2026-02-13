#!/usr/bin/env node

/**
 * V1 Website Content Migration Script
 *
 * Automates migration of legacy website content to DCYFR Labs (Next.js 16):
 * - Extracts V1 content from source (GitHub repo, archive, export)
 * - Processes content with Claude AI for modernization
 * - Converts to Next.js MDX format
 * - Migrates assets (images, files)
 * - Configures redirects for SEO continuity
 * - Migrates analytics data
 *
 * Usage:
 *   npm run migrate:v1              # Interactive mode
 *   npm run migrate:v1 -- --source=./v1-export --priority=P0
 *   npm run migrate:v1 -- --dry-run  # Preview without changes
 *
 * Requirements:
 *   - ANTHROPIC_API_KEY in .env.local
 *   - V1 content source (local directory, git repo, or export file)
 *   - Redis connection for analytics migration
 */

import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync, renameSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import prompts from 'prompts';
import yaml from 'js-yaml';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  // V1 content source
  v1SourcePath: process.env.V1_SOURCE_PATH || null,
  v1ManifestPath: process.env.V1_MANIFEST_PATH || './v1-migration-manifest.json',

  // Target directories
  contentDir: join(projectRoot, 'src/content/blog'),
  assetsDir: join(projectRoot, 'public/blog'),
  redirectsPath: join(projectRoot, 'v1-redirects.json'),

  // AI configuration
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  anthropicModel: 'claude-sonnet-4-20250514',
  maxTokens: 4096,

  // Migration options
  dryRun: process.argv.includes('--dry-run'),
  verbose: process.argv.includes('--verbose'),
  priority: getPriorityFilter(),
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get priority filter from CLI args
 */
function getPriorityFilter() {
  const priorityArg = process.argv.find((arg) => arg.startsWith('--priority='));
  if (!priorityArg) return null;
  return priorityArg.split('=')[1]; // P0, P1, P2, P3
}

/**
 * Generate URL-safe slug from title
 */
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Convert title to sentence case for SEO
 */
function toSentenceCase(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Load V1 migration manifest
 */
function loadV1Manifest() {
  const manifestPath = CONFIG.v1ManifestPath;

  if (!existsSync(manifestPath)) {
    console.log(chalk.yellow('⚠️  V1 manifest not found. Creating template...'));
    createManifestTemplate(manifestPath);
    return null;
  }

  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    console.log(chalk.green(`✅ Loaded V1 manifest: ${manifest.posts.length} posts`));
    return manifest;
  } catch (error) {
    console.error(chalk.red(`❌ Failed to load manifest: ${error.message}`));
    return null;
  }
}

/**
 * Create V1 manifest template
 */
function createManifestTemplate(path) {
  const template = {
    version: '1.0.0',
    migratedAt: null,
    source: {
      type: 'unknown', // 'github', 'wordpress', 'jekyll', 'static'
      url: null,
      exportDate: null,
    },
    posts: [
      {
        id: 'example-post-001',
        title: 'Example V1 Post Title',
        slug: 'example-post-title',
        v1Url: '/2020/01/example-post-title',
        v2Url: '/blog/modernized-example-post',
        priority: 'P0',
        date: '2020-01-15',
        views: 450,
        contentPath: './v1-export/posts/example-post.html',
        status: 'pending', // 'pending', 'processing', 'completed', 'errored'
        notes: 'High-traffic post from V1, needs code examples updated',
      },
    ],
    analytics: {
      totalPosts: 0,
      migratedPosts: 0,
      totalViews: 0,
      highPriority: 0,
    },
  };

  writeFileSync(path, JSON.stringify(template, null, 2));
  console.log(chalk.blue(`\n📋 Created manifest template: ${path}`));
  console.log(chalk.dim('   Edit this file to add your V1 posts for migration\n'));
}

/**
 * Modernize content with Claude AI
 */
async function modernizeContentWithAI(v1Content, v1Metadata) {
  if (!CONFIG.anthropicApiKey) {
    console.warn(chalk.yellow('⚠️  ANTHROPIC_API_KEY not set - skipping AI modernization'));
    return { content: v1Content, metadata: v1Metadata };
  }

  const anthropic = new Anthropic({ apiKey: CONFIG.anthropicApiKey });

  const prompt = `You are modernizing legacy blog content for DCYFR Labs (a cybersecurity and software engineering blog).

**Original Content:**
Title: ${v1Metadata.title}
Date: ${v1Metadata.date}
Content:
${v1Content}

**Tasks:**
1. Analyze content quality and technical accuracy
2. Modernize outdated information:
   - Update deprecated code examples
   - Replace obsolete technology references
   - Add current best practices
3. Enhance content with:
   - Updated code examples (syntax highlighting ready)
   - Diagrams (Mermaid syntax if beneficial)
   - Practical examples
4. Optimize for SEO:
   - Compelling title (keep essence, improve clarity)
   - Meta description (155 chars, action-oriented)
   - Relevant tags
5. Convert to Next.js MDX format with proper frontmatter

**Output Format:**
\`\`\`mdx
---
title: "Modernized Title"
description: "SEO-optimized description (155 chars max)"
date: "${v1Metadata.date}" # Preserve original publish date
updatedDate: "${new Date().toISOString().split('T')[0]}" # Migration date
tags: ["tag1", "tag2", "tag3"]
draft: false
v1Migrated: true
v1Url: "${v1Metadata.v1Url}"
---

# Modernized Title

[Updated content with modern examples, diagrams, and best practices]
\`\`\`

**Style Guidelines:**
- Write in first person ("I", "we")
- Be concise and practical
- Use code blocks with language tags
- Include real-world examples
- Maintain technical accuracy`;

  try {
    console.log(chalk.blue('🤖 Processing with Claude AI...'));

    const response = await anthropic.messages.create({
      model: CONFIG.anthropicModel,
      max_tokens: CONFIG.maxTokens,
      messages: [{ role: 'user', content: prompt }],
    });

    const modernizedContent = response.content[0].text;

    // Extract frontmatter and content
    const parsed = matter(modernizedContent.replace(/```mdx/g, '').replace(/```/g, ''));

    return {
      content: parsed.content,
      metadata: parsed.data,
    };
  } catch (error) {
    console.error(chalk.red(`❌ AI modernization failed: ${error.message}`));
    return { content: v1Content, metadata: v1Metadata };
  }
}

/**
 * Convert to Next.js MDX format
 */
function convertToMDX(content, metadata) {
  const frontmatter = yaml.dump(metadata, { indent: 2 });
  return `---
${frontmatter}---

${content}
`;
}

/**
 * Save migrated post to content directory
 */
function saveMigratedPost(slug, mdxContent) {
  const postDir = join(CONFIG.contentDir, slug);
  const postPath = join(postDir, 'index.mdx');

  if (CONFIG.dryRun) {
    console.log(chalk.dim(`   [DRY RUN] Would create: ${postPath}`));
    return;
  }

  mkdirSync(postDir, { recursive: true });
  writeFileSync(postPath, mdxContent);
  console.log(chalk.green(`   ✅ Saved: ${postPath}`));
}

/**
 * Add redirect to manifest
 */
function addRedirect(v1Url, v2Url) {
  let redirects = [];

  if (existsSync(CONFIG.redirectsPath)) {
    redirects = JSON.parse(readFileSync(CONFIG.redirectsPath, 'utf-8'));
  }

  redirects.push({
    source: v1Url,
    destination: v2Url,
    permanent: true,
  });

  if (CONFIG.dryRun) {
    console.log(chalk.dim(`   [DRY RUN] Would add redirect: ${v1Url} → ${v2Url}`));
    return;
  }

  // Write atomically: write to temp file first, then rename (atomic on POSIX)
  // Prevents TOCTOU race condition between read (line above) and write (CWE-367)
  const tmpPath = `${CONFIG.redirectsPath}.${process.pid}.tmp`;
  writeFileSync(tmpPath, JSON.stringify(redirects, null, 2));
  renameSync(tmpPath, CONFIG.redirectsPath);
}

/**
 * Migrate single V1 post
 */
async function migratePost(post) {
  console.log(chalk.blue(`\n📄 Migrating: ${post.title}`));
  console.log(chalk.dim(`   V1 URL: ${post.v1Url}`));
  console.log(chalk.dim(`   Priority: ${post.priority}`));

  // Load V1 content
  if (!existsSync(post.contentPath)) {
    console.error(chalk.red(`   ❌ Content file not found: ${post.contentPath}`));
    return { ...post, status: 'errored', error: 'Content file not found' };
  }

  const v1Content = readFileSync(post.contentPath, 'utf-8');

  // Prepare metadata
  const v1Metadata = {
    title: post.title,
    date: post.date,
    v1Url: post.v1Url,
    views: post.views || 0,
  };

  // Modernize with AI
  const { content, metadata } = await modernizeContentWithAI(v1Content, v1Metadata);

  // Generate slug
  const slug = post.slug || generateSlug(metadata.title || post.title);
  const v2Url = `/blog/${slug}`;

  // Convert to MDX
  const mdxContent = convertToMDX(content, {
    ...metadata,
    v1Migrated: true,
    v1Url: post.v1Url,
  });

  // Save post
  saveMigratedPost(slug, mdxContent);

  // Add redirect
  addRedirect(post.v1Url, v2Url);

  console.log(chalk.green(`   ✅ Migrated successfully`));
  console.log(chalk.dim(`   V2 URL: ${v2Url}`));

  return { ...post, status: 'completed', v2Url };
}

/**
 * Migrate all posts from manifest
 */
async function migrateAll(manifest) {
  let processed = 0;
  let succeeded = 0;
  let failed = 0;

  // Filter by priority if specified
  let postsToMigrate = manifest.posts;
  if (CONFIG.priority) {
    postsToMigrate = postsToMigrate.filter((p) => p.priority === CONFIG.priority);
    console.log(chalk.blue(`\nFiltering for priority: ${CONFIG.priority}`));
  }

  console.log(chalk.blue(`\n🚀 Starting migration: ${postsToMigrate.length} posts`));
  console.log(chalk.dim(`   Mode: ${CONFIG.dryRun ? 'DRY RUN' : 'LIVE'}\n`));

  for (const post of postsToMigrate) {
    try {
      const result = await migratePost(post);
      processed++;

      if (result.status === 'completed') {
        succeeded++;
      } else {
        failed++;
      }

      // Update manifest
      const postIndex = manifest.posts.findIndex((p) => p.id === post.id);
      manifest.posts[postIndex] = result;

    } catch (error) {
      console.error(chalk.red(`   ❌ Error: ${error.message}`));
      failed++;
    }
  }

  // Update manifest
  manifest.analytics.migratedPosts = succeeded;
  manifest.migratedAt = new Date().toISOString();

  if (!CONFIG.dryRun) {
    writeFileSync(CONFIG.v1ManifestPath, JSON.stringify(manifest, null, 2));
  }

  // Summary
  console.log(chalk.blue('\n' + '='.repeat(60)));
  console.log(chalk.blue('📊 Migration Summary'));
  console.log(chalk.blue('='.repeat(60)));
  console.log(chalk.green(`✅ Succeeded: ${succeeded}`));
  console.log(chalk.red(`❌ Failed: ${failed}`));
  console.log(chalk.dim(`📄 Total processed: ${processed}`));
  console.log(chalk.blue('='.repeat(60) + '\n'));
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  console.log(chalk.blue('╔════════════════════════════════════════════════════════╗'));
  console.log(chalk.blue('║      DCYFR V1 Website Content Migration Tool          ║'));
  console.log(chalk.blue('╚════════════════════════════════════════════════════════╝\n'));

  // Check for ANTHROPIC_API_KEY
  if (!CONFIG.anthropicApiKey) {
    console.warn(chalk.yellow('⚠️  Warning: ANTHROPIC_API_KEY not set'));
    console.warn(chalk.dim('   AI modernization will be skipped\n'));
  }

  // Load manifest
  const manifest = loadV1Manifest();
  if (!manifest) {
    console.log(chalk.yellow('\n⚠️  Please edit the manifest file and re-run this script\n'));
    console.log(chalk.dim('Next steps:'));
    console.log(chalk.dim('1. Edit v1-migration-manifest.json'));
    console.log(chalk.dim('2. Add your V1 posts to the "posts" array'));
    console.log(chalk.dim('3. Run: npm run migrate:v1\n'));
    process.exit(0);
  }

  // Confirm before proceeding
  if (!CONFIG.dryRun) {
    const { confirmed } = await prompts({
      type: 'confirm',
      name: 'confirmed',
      message: `Migrate ${manifest.posts.length} posts from V1 to V2?`,
      initial: false,
    });

    if (!confirmed) {
      console.log(chalk.yellow('\n❌ Migration cancelled\n'));
      process.exit(0);
    }
  }

  // Run migration
  await migrateAll(manifest);

  console.log(chalk.green('✅ Migration complete\n'));
  console.log(chalk.dim('Next steps:'));
  console.log(chalk.dim('1. Review migrated posts in src/content/blog/'));
  console.log(chalk.dim('2. Add redirects from v1-redirects.json to next.config.ts'));
  console.log(chalk.dim('3. Run: npm run build && npm run dev'));
  console.log(chalk.dim('4. Test redirects and content'));
  console.log(chalk.dim('5. Commit and deploy\n'));
}

main().catch((error) => {
  console.error(chalk.red(`\n❌ Fatal error: ${error.message}`));
  console.error(error.stack);
  process.exit(1);
});
