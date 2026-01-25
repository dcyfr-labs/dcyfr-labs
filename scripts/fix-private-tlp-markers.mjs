#!/usr/bin/env node

/**
 * Fix TLP markers in subdirectories named 'private'
 * Changes TLP:CLEAR to TLP:AMBER for internal documentation
 *
 * Usage:
 *   node scripts/fix-private-tlp-markers.mjs           # Execute changes
 *   node scripts/fix-private-tlp-markers.mjs --dry-run # Preview only
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');

const isDryRun = process.argv.includes('--dry-run');

// Statistics
let stats = {
  fixed: 0,
  alreadyCorrect: 0,
  errors: 0,
};

/**
 * Check if file is in a private/ subdirectory
 */
function isInPrivateDir(filePath) {
  const relativePath = path.relative(DOCS_DIR, filePath);
  return relativePath.includes('/private/');
}

/**
 * Detect current TLP marker and return replacement
 */
function getTLPReplacement(content) {
  // Match both {/* TLP:CLEAR */} and {/_ TLP:CLEAR _/} formats
  const patterns = [
    { regex: /^\{\/\* TLP:CLEAR \*\/\}/m, replacement: '{/* TLP:AMBER - Internal Use Only */}' },
    { regex: /^\{\/_ TLP:CLEAR _\/\}/m, replacement: '{/_ TLP:AMBER - Internal Use Only _/}' },
  ];

  for (const pattern of patterns) {
    if (pattern.regex.test(content)) {
      return {
        found: true,
        newContent: content.replace(pattern.regex, pattern.replacement),
      };
    }
  }

  return { found: false, newContent: content };
}

/**
 * Fix TLP marker in a single file
 */
function fixTLPMarker(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const replacement = getTLPReplacement(content);

    if (!replacement.found) {
      stats.alreadyCorrect++;
      return;
    }

    const relativePath = path.relative(ROOT_DIR, filePath);

    if (isDryRun) {
      console.log(`✏️  Would fix: ${relativePath}`);
      stats.fixed++;
    } else {
      fs.writeFileSync(filePath, replacement.newContent, 'utf-8');
      console.log(`✅ Fixed: ${relativePath}`);
      stats.fixed++;
    }
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}: ${error.message}`);
    stats.errors++;
  }
}

/**
 * Find all markdown files in private/ subdirectories
 */
function findPrivateMarkdownFiles(dir) {
  const results = [];

  function traverse(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules and hidden directories
        if (entry.name === 'node_modules' || entry.name.startsWith('.')) {
          continue;
        }
        traverse(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        if (isInPrivateDir(fullPath)) {
          results.push(fullPath);
        }
      }
    }
  }

  traverse(dir);
  return results;
}

/**
 * Main execution
 */
function main() {
  console.log('🔧 Fixing TLP markers in private/ directories\n');

  if (isDryRun) {
    console.log('📋 DRY RUN MODE - No changes will be made\n');
  }

  const privateFiles = findPrivateMarkdownFiles(DOCS_DIR);
  console.log(`Found ${privateFiles.length} files in private/ subdirectories\n`);

  for (const filePath of privateFiles) {
    fixTLPMarker(filePath);
  }

  // Print summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📊 Summary:');
  console.log(`✅ Fixed: ${stats.fixed}`);
  console.log(`ℹ️  Already correct: ${stats.alreadyCorrect}`);
  console.log(`❌ Errors: ${stats.errors}`);

  if (isDryRun && stats.fixed > 0) {
    console.log('\n💡 Run without --dry-run to apply changes');
  }

  process.exit(stats.errors > 0 ? 1 : 0);
}

main();
