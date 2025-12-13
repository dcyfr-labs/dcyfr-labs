#!/usr/bin/env node

/**
 * Blog Hero Image Generator (Simplified Gradients)
 * 
 * Generates simple gradient SVG hero images for blog posts.
 * Uses deterministic randomization based on post slug for consistent gradients.
 * 
 * Features:
 * - 22 gradient variants across 5 themes (brand, warm, cool, neutral, vibrant)
 * - Deterministic gradient selection (same slug = same gradient)
 * - Tag-based thematic gradients (security → red/orange, performance → blue, etc.)
 * - Manual gradient override via --variant flag
 * - OG image compliant (1200×630px)
 * 
 * Usage:
 *   # Generate for specific post (deterministic gradient)
 *   node scripts/generate-blog-hero.mjs --slug my-post-slug
 * 
 *   # Generate for all posts missing images
 *   node scripts/generate-blog-hero.mjs --all
 * 
 *   # Preview without saving
 *   node scripts/generate-blog-hero.mjs --slug my-post --preview
 * 
 *   # Force regeneration even if image exists
 *   node scripts/generate-blog-hero.mjs --slug my-post --force
 * 
 *   # Manual gradient override
 *   node scripts/generate-blog-hero.mjs --slug my-post --variant ocean --force
 *   node scripts/generate-blog-hero.mjs --slug my-post --variant warm.sunset --force
 * 
 * Available gradients:
 *   brand: primary, secondary, accent, inverted
 *   warm: sunset, fire, amber, rose, coral
 *   cool: ocean, teal, sky, forest, arctic
 *   neutral: slate, charcoal, silver, midnight
 *   vibrant: electric, neon, plasma, aurora
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readdir } from 'fs/promises';
import { createHash } from 'crypto';
import { validateSlug } from './lib/validation.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const CONTENT_DIR = join(PROJECT_ROOT, 'src/content/blog');
const PUBLIC_IMAGES_DIR = join(PROJECT_ROOT, 'public/blog/images');

// Parse command line arguments
const args = process.argv.slice(2);
const flags = {
  slug: args.find((arg, i) => args[i - 1] === '--slug'),
  all: args.includes('--all'),
  preview: args.includes('--preview'),
  force: args.includes('--force'),
  variant: args.find((arg, i) => args[i - 1] === '--variant'),
};

// Import gradient definitions from design tokens
// Note: Using direct definitions here to avoid ESM import issues
// These mirror the GRADIENTS object in src/lib/design-tokens.ts
const GRADIENTS = {
  brand: {
    primary: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
    secondary: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
    accent: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)",
    inverted: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
  },
  warm: {
    sunset: "linear-gradient(135deg, #f97316 0%, #ef4444 50%, #ec4899 100%)",
    fire: "linear-gradient(135deg, #ef4444 0%, #f97316 100%)",
    amber: "linear-gradient(135deg, #eab308 0%, #f97316 100%)",
    rose: "linear-gradient(135deg, #f472b6 0%, #f43f5e 100%)",
    coral: "linear-gradient(135deg, #fb923c 0%, #ec4899 100%)",
  },
  cool: {
    ocean: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 50%, #4f46e5 100%)",
    teal: "linear-gradient(135deg, #10b981 0%, #14b8a6 100%)",
    sky: "linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)",
    forest: "linear-gradient(135deg, #16a34a 0%, #10b981 100%)",
    arctic: "linear-gradient(135deg, #67e8f9 0%, #818cf8 100%)",
  },
  neutral: {
    slate: "linear-gradient(135deg, #334155 0%, #0f172a 100%)",
    charcoal: "linear-gradient(135deg, #1e293b 0%, #020617 100%)",
    silver: "linear-gradient(135deg, #94a3b8 0%, #475569 100%)",
    midnight: "linear-gradient(135deg, #0f172a 0%, #172554 100%)",
  },
  vibrant: {
    electric: "linear-gradient(135deg, #a855f7 0%, #d946ef 100%)",
    neon: "linear-gradient(135deg, #a3e635 0%, #22c55e 100%)",
    plasma: "linear-gradient(135deg, #7c3aed 0%, #d946ef 50%, #f97316 100%)",
    aurora: "linear-gradient(135deg, #34d399 0%, #22d3ee 50%, #3b82f6 100%)",
  },
};

// Flattened gradient keys for deterministic selection
const GRADIENT_KEYS = [
  "brand.primary",
  "brand.secondary",
  "brand.accent",
  "brand.inverted",
  "warm.sunset",
  "warm.fire",
  "warm.amber",
  "warm.rose",
  "warm.coral",
  "cool.ocean",
  "cool.teal",
  "cool.sky",
  "cool.forest",
  "cool.arctic",
  "neutral.slate",
  "neutral.charcoal",
  "neutral.silver",
  "neutral.midnight",
  "vibrant.electric",
  "vibrant.neon",
  "vibrant.plasma",
  "vibrant.aurora",
];

/**
 * Get gradient value from dot-notation key
 */
function getGradient(key) {
  const [category, variant] = key.split(".");
  return GRADIENTS[category]?.[variant] || GRADIENTS.brand.primary;
}

/**
 * Generate deterministic hash from string (post slug or ID)
 * Returns a number between 0 and length-1 for array indexing
 */
function deterministicHash(str, length) {
  const hash = createHash('md5').update(str).digest('hex');
  const num = parseInt(hash.substring(0, 8), 16);
  return num % length;
}

/**
 * Select gradient variant based on post metadata or deterministic randomization
 * Priority: manual --variant flag > tag-based selection > deterministic hash
 */
function selectGradientKey(frontmatter, slug) {
  // Manual override via CLI flag
  if (flags.variant) {
    const key = GRADIENT_KEYS.find(k => k.includes(flags.variant));
    if (key) return key;
  }
  
  const tags = Array.isArray(frontmatter.tags) ? frontmatter.tags.map(t => t.toLowerCase()) : [];
  const category = (frontmatter.category || '').toLowerCase();
  
  // Tag-based gradient selection (thematic)
  if (tags.some(t => ['security', 'cve', 'vulnerability'].includes(t))) {
    return 'warm.fire'; // Red/orange for security
  }
  if (tags.some(t => ['performance', 'optimization', 'speed'].includes(t))) {
    return 'cool.ocean'; // Blue for performance
  }
  if (tags.some(t => ['design', 'ui', 'ux', 'css', 'tailwind'].includes(t))) {
    return 'vibrant.electric'; // Purple/fuchsia for design
  }
  if (tags.some(t => ['api', 'integration', 'mcp'].includes(t))) {
    return 'cool.teal'; // Green/teal for APIs
  }
  if (tags.some(t => ['data', 'database', 'redis'].includes(t))) {
    return 'neutral.midnight'; // Dark blue for data
  }
  if (category === 'tutorial') {
    return 'brand.accent'; // Blue/cyan for tutorials
  }
  
  // Deterministic randomization based on slug
  const index = deterministicHash(slug, GRADIENT_KEYS.length);
  return GRADIENT_KEYS[index];
}

/**
 * Generate simplified SVG with pure gradient background
 * Removes patterns, blobs, icons, and text overlays
 * Output: 1200×630px OG image with single linearGradient
 */
function generateSVG(frontmatter, slug) {
  const gradientKey = selectGradientKey(frontmatter, slug);
  const gradientValue = getGradient(gradientKey);
  
  // Parse gradient for SVG linearGradient definition
  const gradientMatch = gradientValue.match(/linear-gradient\(([^)]+)\)/);
  if (!gradientMatch) {
    throw new Error(`Invalid gradient format: ${gradientValue}`);
  }
  
  const [angle, ...stops] = gradientMatch[1].split(',').map(s => s.trim());
  const rotation = angle.replace('deg', '');
  
  // Build SVG linearGradient stops
  const stopElements = stops.map((stop, i) => {
    const parts = stop.split(/\s+/);
    const color = parts[0];
    const position = parts[1] || `${(i * 100 / (stops.length - 1))}%`;
    return `    <stop offset="${position}" stop-color="${color}"/>`;
  }).join('\n');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%" gradientTransform="rotate(${rotation})">
${stopElements}
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bgGradient)"/>
</svg>`;
}

// Parse frontmatter from MDX file
function parseFrontmatter(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  
  if (!match) {
    throw new Error(`No frontmatter found in ${filePath}`);
  }
  
  const frontmatter = {};
  const lines = match[1].split('\n');
  let currentKey = null;
  let arrayItems = [];
  let inArray = false;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip empty lines
    if (!trimmedLine) continue;
    
    // Array item
    if (trimmedLine.startsWith('-')) {
      if (!inArray) {
        inArray = true;
        arrayItems = [];
      }
      const item = trimmedLine.substring(1).trim().replace(/^['"]|['"]$/g, '');
      arrayItems.push(item);
    }
    // Key-value pair
    else if (trimmedLine.includes(':') && !trimmedLine.startsWith(' ')) {
      // Save previous array if any
      if (inArray && currentKey) {
        frontmatter[currentKey] = arrayItems;
        arrayItems = [];
        inArray = false;
      }
      
      const colonIndex = trimmedLine.indexOf(':');
      const key = trimmedLine.substring(0, colonIndex).trim();
      const value = trimmedLine.substring(colonIndex + 1).trim().replace(/^['"]|['"]$/g, '');
      
      currentKey = key;
      
      if (value) {
        frontmatter[key] = value;
        currentKey = null;
      }
    }
  }
  
  // Save final array if any
  if (inArray && currentKey) {
    frontmatter[currentKey] = arrayItems;
  }
  
  return frontmatter;
}

// Generate image for a single post
function generateForPost(slug, options = {}) {
  const { preview = false, force = false } = options;
  
  // Validate slug to prevent path traversal attacks
  const validatedSlug = validateSlug(slug);
  
  // Check for both flat (.mdx) and folder-based (slug/index.mdx) structures
  let mdxPath = join(CONTENT_DIR, `${validatedSlug}.mdx`);
  if (!existsSync(mdxPath)) {
    mdxPath = join(CONTENT_DIR, validatedSlug, 'index.mdx');
  }
  
  const outputDir = join(PUBLIC_IMAGES_DIR, validatedSlug);
  const outputPath = join(outputDir, 'hero.svg');
  
  // Check if source file exists
  if (!existsSync(mdxPath)) {
    console.error(`❌ Post not found: ${validatedSlug}.mdx or ${validatedSlug}/index.mdx`);
    return false;
  }
  
  // Check if image already exists
  if (existsSync(outputPath) && !force && !preview) {
    console.log(`⏭️  Skipping ${validatedSlug} (image already exists, use --force to regenerate)`);
    return false;
  }
  
  try {
    // Parse frontmatter
    const frontmatter = parseFrontmatter(mdxPath);
    
    // Check if post already has custom image
    if (frontmatter.image && !force && !preview) {
      console.log(`⏭️  Skipping ${validatedSlug} (custom image defined in frontmatter)`);
      return false;
    }
    
    // Generate SVG
    const svg = generateSVG(frontmatter, validatedSlug);
    
    if (preview) {
      const gradientKey = selectGradientKey(frontmatter, validatedSlug);
      console.log(`\n📄 Preview for ${validatedSlug}:\n`);
      console.log(svg);
      console.log(`\n💡 Gradient: ${gradientKey}`);
      return true;
    }
    
    // Create output directory atomically (fixes TOCTOU race condition)
    // lgtm[js/file-system-race] - mkdirSync with recursive:true is atomic and prevents TOCTOU vulnerabilities. Path validated via validateSlug() to prevent traversal.
    mkdirSync(outputDir, { recursive: true });
    
    // Write SVG file
    writeFileSync(outputPath, svg, 'utf-8');
    console.log(`✅ Generated: ${outputPath}`);
    
    // Print next steps
    console.log(`\n💡 Next steps for ${validatedSlug}:`);
    console.log(`   1. Review the generated image at: public/blog/images/${validatedSlug}/hero.svg`);
    console.log(`   2. Update frontmatter in src/content/blog/${validatedSlug}.mdx:`);
    console.log(`      image:`);
    console.log(`        url: "/blog/images/${slug}/hero.svg"`);
    console.log(`        alt: "${frontmatter.title} - Hero image"`);
    console.log(`        width: 1200`);
    console.log(`        height: 630\n`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error generating image for ${slug}:`, error.message);
    return false;
  }
}

// Generate for all posts
async function generateForAll(options = {}) {
  const files = await readdir(CONTENT_DIR);
  const mdxFiles = files.filter(f => f.endsWith('.mdx'));
  
  console.log(`\n🎨 Generating hero images for ${mdxFiles.length} posts...\n`);
  
  let generated = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const file of mdxFiles) {
    const slug = file.replace('.mdx', '');
    const result = generateForPost(slug, options);
    
    if (result === true) {
      generated++;
    } else if (result === false) {
      skipped++;
    } else {
      errors++;
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Generated: ${generated}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  if (errors > 0) {
    console.log(`   ❌ Errors: ${errors}`);
  }
}

// Main execution
async function main() {
  console.log('🎨 Blog Hero Image Generator (Simplified Gradients)\n');
  
  if (!flags.slug && !flags.all) {
    console.error('❌ Error: Please specify --slug <slug> or --all\n');
    console.log('Usage:');
    console.log('  node scripts/generate-blog-hero.mjs --slug my-post-slug');
    console.log('  node scripts/generate-blog-hero.mjs --all');
    console.log('  node scripts/generate-blog-hero.mjs --slug my-post --preview');
    console.log('  node scripts/generate-blog-hero.mjs --slug my-post --force');
    console.log('  node scripts/generate-blog-hero.mjs --slug my-post --variant ocean --force');
    process.exit(1);
  }
  
  if (flags.all) {
    await generateForAll({ preview: flags.preview, force: flags.force });
  } else if (flags.slug) {
    generateForPost(flags.slug, { preview: flags.preview, force: flags.force });
  }
}

main().catch(console.error);
