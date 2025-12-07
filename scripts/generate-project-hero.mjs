#!/usr/bin/env node

/**
 * Project Hero Image Generator
 * 
 * Generates theme-aware SVG hero images for project cards with unique color schemes.
 * Uses CSS custom properties for automatic light/dark mode adaptation.
 * 
 * Features:
 * - 6 unique color schemes (red, blue, green, violet, indigo, orange)
 * - Pattern overlays for depth (dots, grid, lines, circuits, hexagons, waves)
 * - CSS custom properties for seamless theme switching
 * - OG image compliant (1200×630px)
 * - No color repetition across projects
 * 
 * Color-to-Project Mapping:
 * - code.svg → Red (danger/error themes)
 * - tech.svg → Blue (technology/trust)
 * - design.svg → Green (creativity/growth)
 * - startup.svg → Violet (innovation/energy)
 * - nonprofit.svg → Indigo (trust/stability)
 * - general.svg → Orange (warmth/versatility)
 * 
 * Usage:
 *   # Generate all project images
 *   node scripts/generate-project-hero.mjs --all
 * 
 *   # Generate single project
 *   node scripts/generate-project-hero.mjs --project code
 * 
 *   # Preview without saving
 *   node scripts/generate-project-hero.mjs --project tech --preview
 * 
 *   # Force regeneration
 *   node scripts/generate-project-hero.mjs --all --force
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const OUTPUT_DIR = join(PROJECT_ROOT, 'public/images/projects');

// Parse command line arguments
const args = process.argv.slice(2);
const flags = {
  project: args.find((arg, i) => args[i - 1] === '--project'),
  all: args.includes('--all'),
  preview: args.includes('--preview'),
  force: args.includes('--force'),
};

// Project definitions with unique color schemes and patterns
const PROJECTS = {
  code: {
    name: 'Code',
    baseColor: '#ef4444', // red-500
    accentColor: '#dc2626', // red-600
    pattern: 'dots',
    description: 'Code and development projects',
  },
  tech: {
    name: 'Tech',
    baseColor: '#3b82f6', // blue-500
    accentColor: '#2563eb', // blue-600
    pattern: 'circuits',
    description: 'Technology and infrastructure projects',
  },
  design: {
    name: 'Design',
    baseColor: '#10b981', // green-500
    accentColor: '#059669', // green-600
    pattern: 'grid',
    description: 'Design and creative projects',
  },
  startup: {
    name: 'Startup',
    baseColor: '#8b5cf6', // violet-500
    accentColor: '#7c3aed', // violet-600
    pattern: 'waves',
    description: 'Startup and entrepreneurial projects',
  },
  nonprofit: {
    name: 'Nonprofit',
    baseColor: '#6366f1', // indigo-500
    accentColor: '#4f46e5', // indigo-600
    pattern: 'hexagons',
    description: 'Nonprofit and community projects',
  },
  general: {
    name: 'General',
    baseColor: '#f97316', // orange-500
    accentColor: '#ea580c', // orange-600
    pattern: 'lines',
    description: 'General and miscellaneous projects',
  },
};

/**
 * Generate pattern overlay based on project type
 * Returns SVG pattern definition and usage
 */
function generatePattern(patternType, projectKey) {
  const patternId = `pattern-${projectKey}`;
  const patterns = {
    dots: `
    <pattern id="${patternId}" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
      <circle cx="20" cy="20" r="2" fill="currentColor" opacity="0.15"/>
      <circle cx="0" cy="0" r="2" fill="currentColor" opacity="0.15"/>
      <circle cx="40" cy="0" r="2" fill="currentColor" opacity="0.15"/>
      <circle cx="0" cy="40" r="2" fill="currentColor" opacity="0.15"/>
      <circle cx="40" cy="40" r="2" fill="currentColor" opacity="0.15"/>
    </pattern>`,
    
    grid: `
    <pattern id="${patternId}" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" stroke-width="1" opacity="0.12"/>
    </pattern>`,
    
    lines: `
    <pattern id="${patternId}" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="50" stroke="currentColor" stroke-width="1" opacity="0.1"/>
      <line x1="25" y1="0" x2="25" y2="50" stroke="currentColor" stroke-width="1" opacity="0.1"/>
      <line x1="50" y1="0" x2="50" y2="50" stroke="currentColor" stroke-width="1" opacity="0.1"/>
    </pattern>`,
    
    circuits: `
    <pattern id="${patternId}" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
      <circle cx="10" cy="10" r="3" fill="currentColor" opacity="0.15"/>
      <circle cx="90" cy="90" r="3" fill="currentColor" opacity="0.15"/>
      <line x1="10" y1="10" x2="50" y2="10" stroke="currentColor" stroke-width="1.5" opacity="0.1"/>
      <line x1="50" y1="10" x2="50" y2="50" stroke="currentColor" stroke-width="1.5" opacity="0.1"/>
      <line x1="50" y1="50" x2="90" y2="90" stroke="currentColor" stroke-width="1.5" opacity="0.1"/>
      <circle cx="50" cy="10" r="2" fill="currentColor" opacity="0.15"/>
      <circle cx="50" cy="50" r="2" fill="currentColor" opacity="0.15"/>
    </pattern>`,
    
    hexagons: `
    <pattern id="${patternId}" x="0" y="0" width="56" height="100" patternUnits="userSpaceOnUse">
      <path d="M28 0 L50 12.5 L50 37.5 L28 50 L6 37.5 L6 12.5 Z" fill="none" stroke="currentColor" stroke-width="1" opacity="0.12"/>
      <path d="M28 50 L50 62.5 L50 87.5 L28 100 L6 87.5 L6 62.5 Z" fill="none" stroke="currentColor" stroke-width="1" opacity="0.12"/>
    </pattern>`,
    
    waves: `
    <pattern id="${patternId}" x="0" y="0" width="100" height="40" patternUnits="userSpaceOnUse">
      <path d="M0 20 Q25 10, 50 20 T100 20" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.1"/>
      <path d="M0 30 Q25 20, 50 30 T100 30" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.1"/>
    </pattern>`,
  };
  
  return {
    definition: patterns[patternType] || patterns.dots,
    patternId,
  };
}

/**
 * Generate theme-aware SVG with CSS custom properties
 * Uses CSS variables for automatic light/dark mode adaptation
 */
function generateSVG(projectKey) {
  const project = PROJECTS[projectKey];
  if (!project) {
    throw new Error(`Unknown project: ${projectKey}`);
  }
  
  const { baseColor, accentColor, pattern } = project;
  const { definition: patternDef, patternId } = generatePattern(pattern, projectKey);
  
  // Generate gradient with theme-aware opacity
  // The pattern uses currentColor which inherits from the color property
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <style>
    /* Theme-aware colors using CSS custom properties */
    .base-gradient {
      color: ${baseColor};
    }
    
    /* Light mode: full saturation */
    @media (prefers-color-scheme: light) {
      .base-gradient {
        opacity: 1;
      }
    }
    
    /* Dark mode: slightly desaturated for better readability */
    @media (prefers-color-scheme: dark) {
      .base-gradient {
        opacity: 0.85;
      }
    }
    
    /* Manual theme override via data-theme attribute on html element */
    :root[data-theme="light"] .base-gradient {
      opacity: 1;
    }
    
    :root[data-theme="dark"] .base-gradient {
      opacity: 0.85;
    }
  </style>
  
  <defs>
    <!-- Base gradient -->
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%" gradientTransform="rotate(135)">
      <stop offset="0%" stop-color="${baseColor}"/>
      <stop offset="100%" stop-color="${accentColor}"/>
    </linearGradient>
    
    <!-- Pattern overlay -->
${patternDef}
  </defs>
  
  <!-- Background gradient -->
  <rect width="1200" height="630" fill="url(#bgGradient)" class="base-gradient"/>
  
  <!-- Pattern overlay with theme-aware color -->
  <rect width="1200" height="630" fill="url(#${patternId})" class="base-gradient"/>
</svg>`;
}

/**
 * Generate image for a single project
 */
function generateForProject(projectKey, options = {}) {
  const { preview = false, force = false } = options;
  
  const project = PROJECTS[projectKey];
  if (!project) {
    console.error(`❌ Unknown project: ${projectKey}`);
    console.log(`\n Available projects: ${Object.keys(PROJECTS).join(', ')}`);
    return false;
  }
  
  const outputPath = join(OUTPUT_DIR, `${projectKey}.svg`);
  
  // Check if image already exists
  if (existsSync(outputPath) && !force && !preview) {
    console.log(`⏭️  Skipping ${projectKey} (image already exists, use --force to regenerate)`);
    return false;
  }
  
  try {
    // Generate SVG
    const svg = generateSVG(projectKey);
    
    if (preview) {
      console.log(`\n📄 Preview for ${projectKey} (${project.name}):\n`);
      console.log(svg);
      console.log(`\n💡 Color: ${project.baseColor} → ${project.accentColor}`);
      console.log(`💡 Pattern: ${project.pattern}`);
      return true;
    }
    
    // Create output directory atomically (fixes TOCTOU race condition)
    mkdirSync(OUTPUT_DIR, { recursive: true });
    
    // Write SVG file
    writeFileSync(outputPath, svg, 'utf-8');
    console.log(`✅ Generated: ${outputPath}`);
    console.log(`   Color: ${project.baseColor} → ${project.accentColor}`);
    console.log(`   Pattern: ${project.pattern}`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error generating image for ${projectKey}:`, error.message);
    return false;
  }
}

/**
 * Generate all project images
 */
function generateAll(options = {}) {
  const projectKeys = Object.keys(PROJECTS);
  
  console.log(`\n🎨 Generating hero images for ${projectKeys.length} projects...\n`);
  
  let generated = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const projectKey of projectKeys) {
    const result = generateForProject(projectKey, options);
    
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
  
  console.log(`\n💡 Color scheme mapping:`);
  Object.entries(PROJECTS).forEach(([key, project]) => {
    console.log(`   ${key}.svg → ${project.baseColor} (${project.pattern})`);
  });
}

/**
 * Main execution
 */
function main() {
  console.log('🎨 Project Hero Image Generator\n');
  
  if (!flags.project && !flags.all) {
    console.error('❌ Error: Please specify --project <name> or --all\n');
    console.log('Usage:');
    console.log('  node scripts/generate-project-hero.mjs --all');
    console.log('  node scripts/generate-project-hero.mjs --project code');
    console.log('  node scripts/generate-project-hero.mjs --project tech --preview');
    console.log('  node scripts/generate-project-hero.mjs --all --force');
    console.log('\nAvailable projects:');
    Object.entries(PROJECTS).forEach(([key, project]) => {
      console.log(`  ${key.padEnd(12)} - ${project.description}`);
    });
    process.exit(1);
  }
  
  if (flags.all) {
    generateAll({ preview: flags.preview, force: flags.force });
  } else if (flags.project) {
    generateForProject(flags.project, { preview: flags.preview, force: flags.force });
  }
}

main();
