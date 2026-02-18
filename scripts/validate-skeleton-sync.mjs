#!/usr/bin/env node

/**
 * Skeleton Sync Validation Script
 *
 * Validates that skeleton components match their actual component structure.
 * Checks for:
 * - Design token usage (no hardcoded spacing/typography)
 * - JSDoc sync warnings present
 * - Primitive usage instead of manual construction
 * - Animation implementation
 *
 * Usage:
 *   node scripts/validate-skeleton-sync.mjs
 *   npm run validate:skeletons
 *
 * Exit codes:
 *   0 - All skeletons pass compliance checks
 *   1 - One or more skeletons below 90% compliance
 *
 * @see /docs/components/skeleton-sync-strategy.md
 */

import { readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Skeleton component configurations
const SKELETONS = [
  {
    name: 'PostListSkeleton',
    skeleton: 'src/components/blog/post/post-list-skeleton.tsx',
    actual: 'src/components/blog/post/modern-post-card.tsx',
    syncPoints: ['padding', 'spacing', 'typography', 'image-aspect-ratios', 'floating-badges', 'quick-actions'],
    requiredPrimitives: ['SkeletonHeading', 'SkeletonText', 'SkeletonMetadata', 'SkeletonBadges', 'SkeletonImage'],
    requiredAnimations: ['ANIMATIONS.stagger', 'ANIMATIONS.types.fadeIn'],
  },
  {
    name: 'BlogPostSkeleton',
    skeleton: 'src/components/blog/post/blog-post-skeleton.tsx',
    actual: 'src/app/blog/[slug]/page.tsx',
    syncPoints: ['container', 'grid-layout', 'spacing', 'typography'],
    requiredPrimitives: ['SkeletonHeading', 'SkeletonText', 'SkeletonMetadata', 'SkeletonBadges', 'SkeletonParagraphs'],
    requiredAnimations: ['ANIMATIONS.stagger', 'ANIMATIONS.types.fadeIn'],
  },
  {
    name: 'ProjectCardSkeleton',
    skeleton: 'src/components/projects/project-card-skeleton.tsx',
    actual: 'src/components/project-card.tsx',
    syncPoints: ['padding', 'spacing', 'typography', 'tech-stack-badges'],
    requiredPrimitives: ['SkeletonHeading', 'SkeletonText', 'SkeletonBadges'],
    requiredAnimations: ['ANIMATIONS.stagger', 'ANIMATIONS.types.fadeIn'],
  },
  {
    name: 'ActivitySkeleton',
    skeleton: 'src/components/activity/ActivitySkeleton.tsx',
    actual: 'src/components/activity/*',
    syncPoints: ['spacing', 'typography', 'featured-image', 'metadata-badges'],
    requiredPrimitives: ['SkeletonHeading', 'SkeletonText', 'SkeletonBadges', 'SkeletonImage'],
    requiredAnimations: ['ANIMATIONS.stagger', 'ANIMATIONS.types.fadeIn'],
  },
  {
    name: 'SkillsWalletSkeleton',
    skeleton: 'src/components/about/skills-wallet-skeleton.tsx',
    actual: 'src/components/about/skills-wallet.tsx',
    syncPoints: ['grid-layout', 'spacing', 'typography'],
    requiredPrimitives: ['SkeletonHeading'],
    requiredAnimations: ['ANIMATIONS.stagger', 'ANIMATIONS.types.fadeIn'],
  },
  {
    name: 'BadgeWalletSkeleton',
    skeleton: 'src/components/about/badge-wallet-skeleton.tsx',
    actual: 'src/components/about/badge-wallet.tsx',
    syncPoints: ['grid-layout', 'spacing', 'typography', 'badge-structure'],
    requiredPrimitives: ['SkeletonHeading'],
    requiredAnimations: ['ANIMATIONS.stagger', 'ANIMATIONS.types.fadeIn'],
  },
  {
    name: 'ChartSkeleton',
    skeleton: 'src/components/common/skeletons/chart-skeleton.tsx',
    actual: 'src/components/charts/*',
    syncPoints: ['spacing', 'typography', 'chart-area'],
    requiredPrimitives: ['SkeletonHeading'],
    requiredAnimations: ['ANIMATIONS.stagger', 'ANIMATIONS.types.fadeIn'],
  },
  {
    name: 'FormSkeleton',
    skeleton: 'src/components/common/skeletons/form-skeleton.tsx',
    actual: 'src/components/forms/*',
    syncPoints: ['spacing', 'field-structure', 'button-placement'],
    requiredPrimitives: [],
    requiredAnimations: ['ANIMATIONS.stagger', 'ANIMATIONS.types.fadeIn'],
  },
  {
    name: 'GitHubHeatmapSkeleton',
    skeleton: 'src/components/common/skeletons/github-heatmap-skeleton.tsx',
    actual: 'src/components/github/heatmap/*',
    syncPoints: ['spacing', 'grid-layout', 'stat-cards'],
    requiredPrimitives: ['SkeletonHeading'],
    requiredAnimations: ['ANIMATIONS.stagger', 'ANIMATIONS.types.fadeIn'],
  },
  {
    name: 'CommentSectionSkeleton',
    skeleton: 'src/components/common/skeletons/comment-section-skeleton.tsx',
    actual: 'src/components/comments/*',
    syncPoints: ['spacing', 'comment-structure', 'avatar-layout'],
    requiredPrimitives: ['SkeletonHeading', 'SkeletonAvatar'],
    requiredAnimations: ['ANIMATIONS.stagger', 'ANIMATIONS.types.fadeIn'],
  },
  {
    name: 'DiagramSkeleton',
    skeleton: 'src/components/common/skeletons/diagram-skeleton.tsx',
    actual: 'src/components/diagrams/*',
    syncPoints: ['aspect-ratios'],
    requiredPrimitives: [],
    requiredAnimations: [],
  },
];

// Violation patterns to detect
const VIOLATIONS = {
  // Only flag spacing violations that should use design tokens
  // Allow small gaps (1-3) for flexbox/grid children
  hardcodedSpacing: [
    /className=["'][^"']*\b(space-y-[4-9]|space-y-\d{2,})\b/g, // space-y-4 and above
    /className=["'][^"']*\b(gap-[4-9]|gap-\d{2,})\b(?!.*\bflex\s+gap-2\b)/g, // gap-4 and above
    /className=["'][^"']*\b(p-[5-9]|p-\d{2,}|px-[5-9]|px-\d{2,}|py-[5-9]|py-\d{2,})\b/g, // p-5 and above
    /className=["'][^"']*\b(mb-[4-9]|mb-\d{2,}|mt-[4-9]|mt-\d{2,})\b/g, // mb/mt-4 and above
  ],
  // Only flag typography violations on text-like Skeleton components
  // Allow small height skeletons for badges, separators, etc.
  hardcodedTypography: [
    // Only flag larger heights that should use SkeletonHeading/SkeletonText
    /<Skeleton[^>]*className=["'][^"']*\b(h-[6-9]|h-\d{2,})\b[^>]*w-(full|3\/4|2\/3|1\/2)/g,
    /<Skeleton[^>]*className=["'][^"']*\btext-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl)\b/g,
  ],
  hardcodedColors: [
    /className=["'][^"']*\b(bg-(white|black|gray|red|blue|green)-\d+)\b/g,
  ],
};

/**
 * Analyze skeleton component for compliance
 */
/**
 * Format a violation list snippet for messages
 */
function violationSnippet(matches) {
  const preview = matches.slice(0, 3).join(', ');
  const extra = matches.length > 3 ? ` (+${matches.length - 3} more)` : '';
  return `${preview}${extra}`;
}

/**
 * Check spacing violations and update results
 */
function checkSpacingViolations(content, results) {
  let count = 0;
  for (const pattern of VIOLATIONS.hardcodedSpacing) {
    const matches = content.match(pattern);
    if (!matches) continue;
    const actual = matches.filter(m => !m.includes('SPACING_VALUES'));
    count += actual.length;
    if (actual.length > 0) {
      results.violations.push(`Hardcoded spacing: ${violationSnippet(actual)}`);
    }
  }
  if (count > 0) results.compliance -= Math.min(30, count * 3);
}

/**
 * Check typography violations and update results
 */
function checkTypographyViolations(content, results) {
  let count = 0;
  for (const pattern of VIOLATIONS.hardcodedTypography) {
    const matches = content.match(pattern);
    if (!matches) continue;
    count += matches.length;
    results.violations.push(`Hardcoded typography: ${violationSnippet(matches)}`);
  }
  if (count > 0) results.compliance -= Math.min(25, count * 3);
}

/**
 * Check required primitives and update results
 */
function checkPrimitives(content, config, results) {
  for (const primitive of config.requiredPrimitives) {
    if (content.includes(primitive)) {
      results.primitives.push(primitive);
    } else {
      results.warnings.push(`Missing recommended primitive: ${primitive}`);
      results.compliance -= 5;
    }
  }
}

/**
 * Check required animations and update results
 */
function checkAnimations(content, config, results) {
  for (const animation of config.requiredAnimations) {
    if (content.includes(animation)) {
      results.animations.push(animation);
    } else {
      results.violations.push(`Missing animation: ${animation}`);
      results.compliance -= 10;
    }
  }
}

async function analyzeSkeletonCompliance(config) {
  const skeletonPath = join(rootDir, config.skeleton);
  const skeletonContent = await readFile(skeletonPath, 'utf-8');

  const results = {
    name: config.name,
    file: config.skeleton,
    compliance: 100,
    violations: [],
    warnings: [],
    primitives: [],
    animations: [],
  };

  // Check for JSDoc sync warning
  if (!skeletonContent.includes('⚠️ SYNC REQUIRED WITH:')) {
    results.violations.push('Missing JSDoc sync warning (⚠️ SYNC REQUIRED WITH:)');
    results.compliance -= 15;
  }

  // Check for "Last sync" date
  if (!/Last sync:\s*\d{4}-\d{2}-\d{2}/.test(skeletonContent)) {
    results.warnings.push('Missing "Last sync" date in JSDoc');
    results.compliance -= 5;
  }

  checkSpacingViolations(skeletonContent, results);
  checkTypographyViolations(skeletonContent, results);
  checkPrimitives(skeletonContent, config, results);
  checkAnimations(skeletonContent, config, results);

  // Check for design token imports
  if (!skeletonContent.includes('SPACING')) {
    results.violations.push('Missing SPACING design token import');
    results.compliance -= 10;
  }
  if (!skeletonContent.includes('ANIMATIONS')) {
    results.violations.push('Missing ANIMATIONS design token import');
    results.compliance -= 10;
  }

  results.compliance = Math.max(0, results.compliance);
  return results;
}

/**
 * Format compliance percentage with color
 */
function formatCompliance(compliance) {
  const percentage = `${compliance.toFixed(1)}%`;
  if (compliance >= 90) return `\x1b[32m${percentage}\x1b[0m`; // Green
  if (compliance >= 70) return `\x1b[33m${percentage}\x1b[0m`; // Yellow
  return `\x1b[31m${percentage}\x1b[0m`; // Red
}

/**
 * Main validation function
 */
async function validateSkeletons() {
  console.log('\n🔍 Skeleton Sync Validation\n');
  console.log('═'.repeat(80));

  const results = [];

  for (const config of SKELETONS) {
    console.log(`\nAnalyzing ${config.name}...`);
    const result = await analyzeSkeletonCompliance(config);
    results.push(result);
  }

  // Print detailed results
  console.log('\n' + '═'.repeat(80));
  console.log('📊 RESULTS\n');

  let totalViolations = 0;
  let failedSkeletons = 0;

  for (const result of results) {
    console.log(`\n${result.name} - ${formatCompliance(result.compliance)} compliance`);
    console.log(`  File: ${result.file}`);

    if (result.violations.length > 0) {
      console.log(`\n  ❌ Violations (${result.violations.length}):`);
      result.violations.forEach(v => console.log(`     • ${v}`));
      totalViolations += result.violations.length;
    }

    if (result.warnings.length > 0) {
      console.log(`\n  ⚠️  Warnings (${result.warnings.length}):`);
      result.warnings.forEach(w => console.log(`     • ${w}`));
    }

    if (result.primitives.length > 0) {
      console.log(`\n  ✅ Primitives (${result.primitives.length}/${result.primitives.length + result.warnings.filter(w => w.includes('primitive')).length}):`);
      console.log(`     ${result.primitives.join(', ')}`);
    }

    if (result.animations.length > 0) {
      console.log(`\n  ✨ Animations (${result.animations.length}/${result.animations.length + result.violations.filter(v => v.includes('animation')).length}):`);
      console.log(`     ${result.animations.join(', ')}`);
    }

    if (result.compliance < 90) {
      failedSkeletons++;
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(80));
  console.log('\n📈 SUMMARY\n');

  const avgCompliance = results.reduce((sum, r) => sum + r.compliance, 0) / results.length;
  console.log(`  Total Skeletons: ${results.length}`);
  console.log(`  Average Compliance: ${formatCompliance(avgCompliance)}`);
  console.log(`  Total Violations: ${totalViolations}`);
  console.log(`  Failed Skeletons: ${failedSkeletons} (< 90% compliance)`);

  if (failedSkeletons === 0) {
    console.log('\n✅ All skeletons pass compliance checks!\n');
    return 0;
  } else {
    console.log(`\n❌ ${failedSkeletons} skeleton(s) below 90% compliance\n`);
    console.log('Run the following to fix violations:');
    console.log('  1. Replace hardcoded spacing with SPACING tokens');
    console.log('  2. Replace manual typography with SkeletonHeading/SkeletonText');
    console.log('  3. Add stagger animations using ANIMATIONS.stagger');
    console.log('  4. Add JSDoc sync warnings\n');
    return 1;
  }
}

// Run validation
validateSkeletons()
  .then(exitCode => process.exit(exitCode))
  .catch(error => {
    console.error('\n❌ Validation failed with error:', error.message);
    process.exit(1);
  });
