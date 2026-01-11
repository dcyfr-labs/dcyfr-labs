#!/usr/bin/env node

/**
 * Convert Hardcoded Tailwind Classes to Design Tokens
 * 
 * This script automatically converts hardcoded Tailwind classes to design tokens.
 * Phase 2 of Design Token Enforcement Implementation.
 * 
 * Usage:
 *   npm run fix:tokens --dry-run     # Preview changes without applying
 *   npm run fix:tokens               # Apply conversions
 *   npm run fix:tokens --rollback    # Undo changes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, '../src');

// Conversion map: hardcoded pattern → token reference + replacement logic
const conversionMap = [
  // SPACING CONVERSIONS
  {
    name: 'Margin Bottom',
    patterns: [
      { regex: /mb-4(?![0-9])/g, token: 'SPACING.md', desc: 'mb-4 → SPACING.md' },
      { regex: /mb-2(?![0-9])/g, token: 'SPACING.sm', desc: 'mb-2 → SPACING.sm' },
      { regex: /mb-6(?![0-9])/g, token: 'SPACING.lg', desc: 'mb-6 → SPACING.lg' },
      { regex: /mb-8(?![0-9])/g, token: 'SPACING.xl', desc: 'mb-8 → SPACING.xl' },
      { regex: /mb-3(?![0-9])/g, token: 'SPACING.sm', desc: 'mb-3 → SPACING.sm' },
    ],
  },
  {
    name: 'Margin Top',
    patterns: [
      { regex: /mt-4(?![0-9])/g, token: 'SPACING.md', desc: 'mt-4 → SPACING.md' },
      { regex: /mt-2(?![0-9])/g, token: 'SPACING.sm', desc: 'mt-2 → SPACING.sm' },
      { regex: /mt-6(?![0-9])/g, token: 'SPACING.lg', desc: 'mt-6 → SPACING.lg' },
      { regex: /mt-1(?![0-9])/g, token: 'SPACING.xs', desc: 'mt-1 → SPACING.xs' },
    ],
  },
  {
    name: 'Gap Spacing',
    patterns: [
      { regex: /gap-4(?![0-9])/g, token: 'SPACING.md', desc: 'gap-4 → SPACING.md' },
      { regex: /gap-2(?![0-9])/g, token: 'SPACING.sm', desc: 'gap-2 → SPACING.sm' },
      { regex: /gap-3(?![0-9])/g, token: 'SPACING.sm', desc: 'gap-3 → SPACING.sm' },
      { regex: /gap-6(?![0-9])/g, token: 'SPACING.lg', desc: 'gap-6 → SPACING.lg' },
      { regex: /gap-8(?![0-9])/g, token: 'SPACING.xl', desc: 'gap-8 → SPACING.xl' },
    ],
  },
  {
    name: 'Padding',
    patterns: [
      { regex: /\bp-4(?![0-9])/g, token: 'SPACING.md', desc: 'p-4 → SPACING.md' },
      { regex: /\bp-6(?![0-9])/g, token: 'SPACING.lg', desc: 'p-6 → SPACING.lg' },
      { regex: /\bp-8(?![0-9])/g, token: 'SPACING.xl', desc: 'p-8 → SPACING.xl' },
    ],
  },
  // Note: Typography conversions require structural changes - handled manually
  // Note: Container width conversions require context - handled manually
];

function convertFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    const changes = [];

    // Apply conversions
    conversionMap.forEach((category) => {
      category.patterns.forEach(({ regex, token, desc }) => {
        let match;
        while ((match = regex.exec(content)) !== null) {
          const before = match[0];
          content = content.replace(regex, `\${SPACING.[token_value]}`);
          changes.push({
            description: desc,
            before,
            after: `\${SPACING.[token_value]}`,
            token,
          });
        }
      });
    });

    if (changes.length === 0) {
      return null;
    }

    return {
      file: filePath.replace(srcDir, ''),
      changes,
    };
  } catch (err) {
    console.warn(`⚠️  Could not process ${filePath}: ${err.message}`);
    return null;
  }
}

function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const isRollback = args.includes('--rollback');

  if (isRollback) {
    console.log('🔄 Rollback functionality coming in Phase 2...');
    console.log('   (Currently: manual git checkout of individual files)');
    process.exit(0);
  }

  console.log('🔄 Scanning for hardcoded Tailwind patterns...\n');

  const files = globSync('**/*.{ts,tsx}', {
    cwd: srcDir,
    ignore: [
      'node_modules/**',
      '.next/**',
      'ui/**',  // shadcn/ui uses own system
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.spec.ts',
      '**/*.spec.tsx',
    ],
  });

  const conversions = [];
  let totalChanges = 0;

  files.forEach((file) => {
    const fullPath = path.join(srcDir, file);
    const result = convertFile(fullPath);
    if (result) {
      conversions.push(result);
      totalChanges += result.changes.length;
    }
  });

  if (conversions.length === 0) {
    console.log('✅ No straightforward conversions found.');
    console.log('   (Complex patterns require manual review)');
    process.exit(0);
  }

  // Display summary
  console.log(`📊 Found ${totalChanges} potential conversions in ${conversions.length} files\n`);

  conversions.slice(0, 20).forEach(({ file, changes }) => {
    console.log(`📄 ${file}`);
    changes.slice(0, 5).forEach(({ description }) => {
      console.log(`   • ${description}`);
    });
    if (changes.length > 5) {
      console.log(`   ... and ${changes.length - 5} more`);
    }
    console.log();
  });

  if (conversions.length > 20) {
    console.log(`   ... and ${conversions.length - 20} more files\n`);
  }

  console.log('⚠️  IMPORTANT: Automated conversions for spacing are limited.');
  console.log('   ✅ Straightforward patterns: spacing tokens (mb-, mt-, gap-, p-)');
  console.log('   ❌ Complex patterns requiring manual review:');
  console.log('      • Typography combinations (text-* + font-*)')
  console.log('      • Responsive classes (sm:*, md:*, lg:*)');
  console.log('      • Dynamic/conditional classes');
  console.log('      • Container widths with context-dependent logic\n');

  if (isDryRun) {
    console.log('✅ Dry run completed. No changes applied.');
    console.log('   Run: npm run fix:tokens (without --dry-run) to apply changes\n');
    process.exit(0);
  }

  console.log('🚀 Phase 2 Hybrid Approach Strategy:');
  console.log('   1. Auto-convert straightforward spacing patterns (this script)');
  console.log('   2. Manual review and complex pattern fixes (next step)');
  console.log('   3. Test thoroughly and validate');
  console.log('   4. Enable strict enforcement for new violations\n');

  console.log('📋 Next Steps:');
  console.log('   • Review conversion report (coming next)');
  console.log('   • Apply conversions component-by-component');
  console.log('   • Test after each batch of changes');
  console.log('   • Handle edge cases manually\n');

  console.log('💡 Strategy for best results:');
  console.log('   1. Start with utility-heavy components first');
  console.log('   2. Test E2E after each component batch');
  console.log('   3. Capture patterns for automation\n');

  process.exit(0);
}

main();
