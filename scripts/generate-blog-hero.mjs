#!/usr/bin/env node

/**
 * Blog Hero Image Generator
 * 
 * Generates custom SVG hero images for blog posts based on metadata.
 * Supports multiple style variants and post-specific customization.
 * 
 * Usage:
 *   # Generate for specific post
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
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readdir } from 'fs/promises';

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
};

// Brand colors from design tokens
const COLORS = {
  primary: '#3b82f6',    // blue-500
  secondary: '#8b5cf6',  // violet-500
  accent: '#06b6d4',     // cyan-500
  success: '#10b981',    // emerald-500
  warning: '#f59e0b',    // amber-500
  error: '#ef4444',      // red-500
  dark: '#0f172a',       // slate-900
  darker: '#020617',     // slate-950
  light: '#f1f5f9',      // slate-100
};

// Style variants with gradients and patterns
const STYLE_VARIANTS = {
  gradient: {
    background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
    pattern: 'dots',
    iconColor: 'white',
  },
  minimal: {
    background: COLORS.darker,
    pattern: 'dots',
    iconColor: COLORS.primary,
  },
  geometric: {
    background: `linear-gradient(45deg, ${COLORS.dark} 0%, ${COLORS.primary} 100%)`,
    pattern: 'grid',
    iconColor: 'white',
  },
  waves: {
    background: `linear-gradient(180deg, ${COLORS.darker} 0%, ${COLORS.dark} 100%)`,
    pattern: 'waves',
    iconColor: COLORS.accent,
  },
  circuit: {
    background: COLORS.darker,
    pattern: 'circuit',
    iconColor: COLORS.success,
  },
  security: {
    background: `linear-gradient(135deg, ${COLORS.error} 0%, ${COLORS.warning} 100%)`,
    pattern: 'hexagons',
    iconColor: 'white',
  },
};

// Icon sets for different content types
const ICONS = {
  code: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 6L4 10L8 14M16 6L20 10L16 14M12 4L8 20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  
  security: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L4 6V11C4 16.5 7.5 21.5 12 22C16.5 21.5 20 16.5 20 11V6L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  
  design: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  
  api: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="2" stroke="currentColor" stroke-width="2"/>
    <circle cx="12" cy="5" r="2" stroke="currentColor" stroke-width="2"/>
    <circle cx="12" cy="19" r="2" stroke="currentColor" stroke-width="2"/>
    <circle cx="5" cy="12" r="2" stroke="currentColor" stroke-width="2"/>
    <circle cx="19" cy="12" r="2" stroke="currentColor" stroke-width="2"/>
    <path d="M12 7V10M12 14V17M7 12H10M14 12H17" stroke="currentColor" stroke-width="2"/>
  </svg>`,
  
  data: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="12" cy="6" rx="8" ry="3" stroke="currentColor" stroke-width="2"/>
    <path d="M4 6V18C4 19.66 7.58 21 12 21C16.42 21 20 19.66 20 18V6" stroke="currentColor" stroke-width="2"/>
    <path d="M4 12C4 13.66 7.58 15 12 15C16.42 15 20 13.66 20 12" stroke="currentColor" stroke-width="2"/>
  </svg>`,
  
  tools: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.7 6.3L17.7 9.3L7 20H4V17L14.7 6.3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M3 21H21M16 5L19 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  
  performance: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
    <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
  
  docs: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M14 2V8H20M16 13H8M16 17H8M10 9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
};

// Pattern generators
function generatePattern(type, color = 'rgba(255,255,255,0.1)') {
  switch (type) {
    case 'dots':
      return `<pattern id="dots" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
        <circle cx="15" cy="15" r="1.5" fill="${color}"/>
      </pattern>
      <rect width="1200" height="630" fill="url(#dots)"/>`;
    
    case 'grid':
      return `<pattern id="grid" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
        <path d="M 50 0 L 0 0 0 50" fill="none" stroke="${color}" stroke-width="1"/>
      </pattern>
      <rect width="1200" height="630" fill="url(#grid)"/>`;
    
    case 'waves':
      return `<pattern id="waves" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
        <path d="M0 50 Q 25 30, 50 50 T 100 50" stroke="${color}" fill="none" stroke-width="2"/>
        <path d="M0 60 Q 25 40, 50 60 T 100 60" stroke="${color}" fill="none" stroke-width="2" opacity="0.5"/>
      </pattern>
      <rect width="1200" height="630" fill="url(#waves)"/>`;
    
    case 'circuit':
      return `<pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
        <circle cx="20" cy="20" r="2" fill="${color}"/>
        <circle cx="80" cy="80" r="2" fill="${color}"/>
        <line x1="20" y1="20" x2="80" y2="20" stroke="${color}" stroke-width="1"/>
        <line x1="20" y1="20" x2="20" y2="80" stroke="${color}" stroke-width="1"/>
        <line x1="80" y1="20" x2="80" y2="80" stroke="${color}" stroke-width="1"/>
      </pattern>
      <rect width="1200" height="630" fill="url(#circuit)"/>`;
    
    case 'hexagons':
      return `<pattern id="hexagons" x="0" y="0" width="56" height="100" patternUnits="userSpaceOnUse">
        <path d="M28,0 L56,16 L56,50 L28,66 L0,50 L0,16 Z" fill="none" stroke="${color}" stroke-width="1"/>
      </pattern>
      <rect width="1200" height="630" fill="url(#hexagons)"/>`;
    
    default:
      return '';
  }
}

// Select style variant based on post metadata
function selectStyleVariant(frontmatter) {
  const tags = Array.isArray(frontmatter.tags) ? frontmatter.tags.map(t => t.toLowerCase()) : [];
  const category = (frontmatter.category || '').toLowerCase();
  
  // Security content
  if (tags.some(t => ['security', 'cve', 'vulnerability'].includes(t)) || 
      category === 'security') {
    return 'security';
  }
  
  // Code/tech content
  if (tags.some(t => ['javascript', 'typescript', 'react', 'node', 'code', 'programming'].includes(t)) ||
      category === 'development') {
    return 'minimal';
  }
  
  // Design/UI content
  if (tags.some(t => ['design', 'ui', 'ux', 'css', 'tailwind', 'styling'].includes(t)) ||
      category === 'design') {
    return 'geometric';
  }
  
  // Performance content
  if (tags.some(t => ['performance', 'optimization', 'speed'].includes(t))) {
    return 'waves';
  }
  
  // API/Integration content
  if (tags.some(t => ['api', 'integration', 'mcp'].includes(t))) {
    return 'circuit';
  }
  
  // Default to gradient
  return 'gradient';
}

// Select icon based on post metadata
function selectIcon(frontmatter) {
  const tags = Array.isArray(frontmatter.tags) ? frontmatter.tags.map(t => t.toLowerCase()) : [];
  const category = (frontmatter.category || '').toLowerCase();
  
  if (tags.some(t => ['security', 'cve', 'vulnerability'].includes(t))) return 'security';
  if (tags.some(t => ['api', 'mcp', 'integration'].includes(t))) return 'api';
  if (tags.some(t => ['design', 'ui', 'ux'].includes(t))) return 'design';
  if (tags.some(t => ['performance', 'optimization'].includes(t))) return 'performance';
  if (tags.some(t => ['data', 'database', 'redis'].includes(t))) return 'data';
  if (tags.some(t => ['tools', 'cli', 'workflow'].includes(t))) return 'tools';
  if (category === 'tutorial') return 'docs';
  
  return 'code'; // Default
}

// Generate SVG hero image
function generateSVG(frontmatter, slug) {
  const styleVariant = selectStyleVariant(frontmatter);
  const style = STYLE_VARIANTS[styleVariant];
  const iconKey = selectIcon(frontmatter);
  const icon = ICONS[iconKey];
  const title = frontmatter.title || '';
  
  // Generate background
  let backgroundDef = '';
  if (style.background.startsWith('linear-gradient')) {
    const gradientMatch = style.background.match(/linear-gradient\(([^)]+)\)/);
    if (gradientMatch) {
      const [angle, ...stops] = gradientMatch[1].split(',').map(s => s.trim());
      const rotation = angle.replace('deg', '');
      
      backgroundDef = `
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%" gradientTransform="rotate(${rotation})">
      ${stops.map((stop, i) => {
        const [color, position] = stop.split(/\s+/);
        return `<stop offset="${position || (i * 100 / (stops.length - 1)) + '%'}" stop-color="${color}"/>`;
      }).join('\n      ')}
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bgGradient)"/>`;
    }
  } else {
    backgroundDef = `<rect width="1200" height="630" fill="${style.background}"/>`;
  }
  
  // Generate pattern overlay
  const patternOpacity = styleVariant === 'minimal' ? '0.4' : '0.3';
  const pattern = style.pattern 
    ? `<g opacity="${patternOpacity}">\n    ${generatePattern(style.pattern, 'rgba(255,255,255,0.15)')}\n  </g>`
    : '';
  
  // Icon with background
  const iconSize = 100;
  const iconX = 600 - iconSize / 2;
  const iconY = 240 - iconSize / 2;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  ${backgroundDef}
  
  ${pattern}
  
  <!-- Decorative blobs -->
  <g opacity="0.2">
    <circle cx="1050" cy="100" r="150" fill="white" filter="blur(60px)"/>
    <circle cx="150" cy="530" r="150" fill="white" filter="blur(60px)"/>
  </g>
  
  <!-- Icon container -->
  <g transform="translate(${iconX}, ${iconY})">
    <rect width="${iconSize}" height="${iconSize}" rx="20" fill="rgba(255,255,255,0.15)" 
          stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
    <g transform="translate(25, 25) scale(2)" color="${style.iconColor}">
      ${icon}
    </g>
  </g>
  
  <!-- Title (if short enough) -->
  ${title.length <= 60 ? `
  <text x="600" y="400" font-family="system-ui, -apple-system, sans-serif" 
        font-size="48" font-weight="700" fill="white" text-anchor="middle"
        style="text-shadow: 0 2px 10px rgba(0,0,0,0.3)">
    ${escapeXml(title.length > 50 ? title.substring(0, 50) + '...' : title)}
  </text>` : ''}
  
  <!-- Site branding -->
  <text x="600" y="520" font-family="system-ui, -apple-system, sans-serif" 
        font-size="24" font-weight="600" fill="rgba(255,255,255,0.9)" 
        text-anchor="middle" letter-spacing="0.05em">
    DCYFR.AI BLOG
  </text>
  
  <!-- Metadata badge -->
  <g transform="translate(500, 560)">
    <rect width="200" height="40" rx="20" fill="rgba(255,255,255,0.1)" 
          stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
    <text x="100" y="26" font-family="system-ui, -apple-system, sans-serif" 
          font-size="14" font-weight="500" fill="rgba(255,255,255,0.8)" 
          text-anchor="middle">
      ${frontmatter.category ? frontmatter.category.toUpperCase() : 'BLOG POST'}
    </text>
  </g>
</svg>`;
}

// Helper to escape XML special characters
function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
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
  
  const mdxPath = join(CONTENT_DIR, `${slug}.mdx`);
  const outputDir = join(PUBLIC_IMAGES_DIR, slug);
  const outputPath = join(outputDir, 'hero.svg');
  
  // Check if source file exists
  if (!existsSync(mdxPath)) {
    console.error(`❌ Post not found: ${slug}.mdx`);
    return false;
  }
  
  // Check if image already exists
  if (existsSync(outputPath) && !force && !preview) {
    console.log(`⏭️  Skipping ${slug} (image already exists, use --force to regenerate)`);
    return false;
  }
  
  try {
    // Parse frontmatter
    const frontmatter = parseFrontmatter(mdxPath);
    
    // Check if post already has custom image
    if (frontmatter.image && !force && !preview) {
      console.log(`⏭️  Skipping ${slug} (custom image defined in frontmatter)`);
      return false;
    }
    
    // Generate SVG
    const svg = generateSVG(frontmatter, slug);
    
    if (preview) {
      console.log(`\n📄 Preview for ${slug}:\n`);
      console.log(svg);
      console.log(`\n💡 Style: ${selectStyleVariant(frontmatter)}, Icon: ${selectIcon(frontmatter)}`);
      return true;
    }
    
    // Create output directory
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }
    
    // Write SVG file
    writeFileSync(outputPath, svg, 'utf-8');
    console.log(`✅ Generated: ${outputPath}`);
    
    // Print next steps
    console.log(`\n💡 Next steps for ${slug}:`);
    console.log(`   1. Review the generated image at: public/blog/images/${slug}/hero.svg`);
    console.log(`   2. Update frontmatter in src/content/blog/${slug}.mdx:`);
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
  console.log('🎨 Blog Hero Image Generator\n');
  
  if (!flags.slug && !flags.all) {
    console.error('❌ Error: Please specify --slug <slug> or --all\n');
    console.log('Usage:');
    console.log('  node scripts/generate-blog-hero.mjs --slug my-post-slug');
    console.log('  node scripts/generate-blog-hero.mjs --all');
    console.log('  node scripts/generate-blog-hero.mjs --slug my-post --preview');
    console.log('  node scripts/generate-blog-hero.mjs --slug my-post --force');
    process.exit(1);
  }
  
  if (flags.all) {
    await generateForAll({ preview: flags.preview, force: flags.force });
  } else if (flags.slug) {
    generateForPost(flags.slug, { preview: flags.preview, force: flags.force });
  }
}

main().catch(console.error);
