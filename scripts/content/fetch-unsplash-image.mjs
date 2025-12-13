#!/usr/bin/env node

/**
 * Unsplash Image Downloader for Blog Posts
 * 
 * Interactive CLI for searching and downloading Unsplash images for blog posts.
 * Requires UNSPLASH_ACCESS_KEY environment variable.
 * 
 * Usage:
 *   node scripts/fetch-unsplash-image.mjs --slug my-post --query "developer coding"
 *   node scripts/fetch-unsplash-image.mjs --slug my-post --interactive
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as readline from 'readline';
import { validateSlug, validateUnsplashUrl } from './lib/validation.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');

// Check for access key
const ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
if (!ACCESS_KEY) {
  console.error('❌ Error: UNSPLASH_ACCESS_KEY environment variable is required');
  console.error('\n📝 Setup instructions:');
  console.error('   1. Visit https://unsplash.com/developers');
  console.error('   2. Create a new application');
  console.error('   3. Copy your Access Key');
  console.error('   4. Add to .env.local: UNSPLASH_ACCESS_KEY=your_key_here\n');
  process.exit(1);
}

// Parse command line arguments
const args = process.argv.slice(2);
const flags = {
  slug: args.find((arg, i) => args[i - 1] === '--slug'),
  query: args.find((arg, i) => args[i - 1] === '--query'),
  interactive: args.includes('--interactive'),
  perPage: parseInt(args.find((arg, i) => args[i - 1] === '--per-page') || '10', 10),
  orientation: args.find((arg, i) => args[i - 1] === '--orientation') || 'landscape',
};

// Unsplash API functions (inline for simplicity)
const UNSPLASH_API_BASE = 'https://api.unsplash.com';

async function searchImages(query, options = {}) {
  const {
    page = 1,
    perPage = 10,
    orderBy = 'relevant',
    orientation = 'landscape',
  } = options;

  const params = new URLSearchParams({
    query,
    page: page.toString(),
    per_page: perPage.toString(),
    order_by: orderBy,
    orientation,
  });

  const url = `${UNSPLASH_API_BASE}/search/photos?${params.toString()}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Client-ID ${ACCESS_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Unsplash API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.results;
}

async function downloadImage(image, slug) {
  // Validate inputs to prevent path traversal and SSRF attacks
  const validatedSlug = validateSlug(slug);
  const imageUrl = validateUnsplashUrl(image.urls.regular);
  
  const outputDir = join(PROJECT_ROOT, 'public', 'blog', 'images', validatedSlug);
  const { mkdirSync, writeFileSync } = await import('fs');
  
  // Create directory atomically (fixes TOCTOU race condition)
  mkdirSync(outputDir, { recursive: true });

  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`);
  }

  const buffer = await response.arrayBuffer();
  const outputPath = join(outputDir, 'hero.jpg');
  // lgtm [js/http-to-file-access] - Security controls in place:
  // 1. URL validated via validateUnsplashUrl() against allowlist
  // 2. Path validated via validateSlug() to prevent directory traversal
  // 3. Source is trusted Unsplash API, not user-controlled endpoint
  writeFileSync(outputPath, Buffer.from(buffer));

  return `/blog/images/${validatedSlug}/hero.jpg`;
}

async function triggerDownload(image) {
  await fetch(image.links.download_location, {
    headers: {
      Authorization: `Client-ID ${ACCESS_KEY}`,
    },
  });
}

function getAttribution(image) {
  return `Photo by ${image.user.name} on Unsplash`;
}

function getAttributionLink(image) {
  return `${image.user.links.html}?utm_source=dcyfr-labs&utm_medium=referral`;
}

// Interactive mode helpers
function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function question(rl, prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function interactiveMode(slug) {
  const rl = createInterface();

  console.log('\n🔍 Interactive Unsplash Image Search\n');
  
  const query = await question(rl, '📝 Enter search query (e.g., "developer coding"): ');
  
  if (!query.trim()) {
    console.error('❌ Search query is required');
    rl.close();
    process.exit(1);
  }

  console.log(`\n🔎 Searching Unsplash for "${query}"...\n`);

  const images = await searchImages(query, {
    perPage: 5,
    orientation: 'landscape',
  });

  if (images.length === 0) {
    console.error('❌ No images found. Try a different query.');
    rl.close();
    process.exit(1);
  }

  console.log(`Found ${images.length} images:\n`);
  images.forEach((img, i) => {
    console.log(`${i + 1}. ${img.alt_description || 'Untitled'}`);
    console.log(`   By: ${img.user.name} (@${img.user.username})`);
    console.log(`   Size: ${img.width}x${img.height}`);
    console.log(`   Preview: ${img.urls.small}`);
    console.log();
  });

  const choice = await question(rl, 'Select image (1-5) or "q" to quit: ');

  if (choice.toLowerCase() === 'q') {
    console.log('👋 Cancelled');
    rl.close();
    process.exit(0);
  }

  const index = parseInt(choice, 10) - 1;
  if (isNaN(index) || index < 0 || index >= images.length) {
    console.error('❌ Invalid selection');
    rl.close();
    process.exit(1);
  }

  rl.close();

  const selectedImage = images[index];
  console.log(`\n📥 Downloading image by ${selectedImage.user.name}...\n`);

  const imagePath = await downloadImage(selectedImage, slug);
  await triggerDownload(selectedImage);

  console.log(`✅ Downloaded: ${imagePath}\n`);
  printFrontmatter(selectedImage, imagePath);
}

async function automaticMode(slug, query) {
  console.log(`\n🔎 Searching Unsplash for "${query}"...\n`);

  const images = await searchImages(query, {
    perPage: 1,
    orientation: flags.orientation,
  });

  if (images.length === 0) {
    console.error('❌ No images found. Try a different query.');
    process.exit(1);
  }

  const image = images[0];
  console.log(`📷 Found: ${image.alt_description || 'Untitled'}`);
  console.log(`   By: ${image.user.name} (@${image.user.username})`);
  console.log(`   Size: ${image.width}x${image.height}\n`);

  console.log('📥 Downloading...\n');

  const imagePath = await downloadImage(image, slug);
  await triggerDownload(image);

  console.log(`✅ Downloaded: ${imagePath}\n`);
  printFrontmatter(image, imagePath);
}

function printFrontmatter(image, imagePath) {
  console.log('💡 Add to frontmatter:\n');
  console.log('image:');
  console.log(`  url: "${imagePath}"`);
  console.log(`  alt: "${image.alt_description || image.description || 'Blog post hero image'}"`);
  console.log(`  width: ${image.width}`);
  console.log(`  height: ${image.height}`);
  console.log(`  credit: "${getAttribution(image)}"`);
  console.log();
  console.log('🔗 Attribution link:');
  console.log(getAttributionLink(image));
  console.log();
  console.log('⚠️  Important: Unsplash requires attribution. Always include the credit field.');
}

async function main() {
  console.log('📸 Unsplash Image Downloader\n');

  if (!flags.slug) {
    console.error('❌ Error: --slug is required\n');
    console.log('Usage:');
    console.log('  node scripts/fetch-unsplash-image.mjs --slug my-post --query "developer coding"');
    console.log('  node scripts/fetch-unsplash-image.mjs --slug my-post --interactive');
    console.log('\nOptions:');
    console.log('  --slug <slug>         Post slug (required)');
    console.log('  --query <query>       Search query');
    console.log('  --interactive         Interactive mode (select from results)');
    console.log('  --orientation <type>  Image orientation (landscape, portrait, squarish)');
    console.log('  --per-page <n>        Number of results in interactive mode (default: 10)');
    process.exit(1);
  }

  try {
    if (flags.interactive) {
      await interactiveMode(flags.slug);
    } else if (flags.query) {
      await automaticMode(flags.slug, flags.query);
    } else {
      console.error('❌ Error: Either --query or --interactive is required\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
