#!/usr/bin/env node
/**
 * Emoji Usage Analyzer
 *
 * Scans the codebase for emoji usage and categorizes them by context.
 * Identifies emojis in public-facing content vs. internal documentation.
 *
 * Usage: node scripts/analyze-emoji-usage.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

// Common emojis to search for
const EMOJI_PATTERNS = [
  '✅', '❌', '⚠️', '🔴', '🟡', '🟢', '🔵',
  '⚡', '📚', '🎯', '🚀', '💡', '📋', '🔍',
  '🔄', '🤖', '📊', '🔗', '📖', '🔐', '🚨',
  '🛡️', '🔒', '❤️', '🤍', '👁️', '👍', '🎉'
];

// Directories to scan
const SCAN_DIRS = [
  'src/content',        // Public MDX content (CRITICAL - user-facing)
  'src/components',     // React components
  'src/lib',            // Utility functions
  'src/app',            // App routes
  'docs',               // Documentation (internal)
  '.github',            // AI instructions and workflows
];

// Directories to exclude
const EXCLUDE_DIRS = [
  'node_modules',
  '.next',
  'dist',
  'coverage',
  'playwright-report',
];

const results = {
  publicContent: [],      // User-facing content (blogs, projects)
  internalDocs: [],       // Internal documentation
  codeComments: [],       // Code comments and console.logs
  uiComponents: [],       // UI text and labels
  tests: [],              // Test files
};

/**
 * Check if a file should be excluded
 */
function shouldExclude(filePath) {
  return EXCLUDE_DIRS.some(dir => filePath.includes(dir));
}

/**
 * Categorize emoji usage
 */
function categorizeUsage(filePath, line, lineNumber, emoji) {
  const category = {
    file: filePath,
    line: lineNumber,
    emoji,
    content: line.trim(),
  };

  // Public MDX content (user-facing)
  if (filePath.includes('src/content/blog') && !filePath.includes('/.private/') && !filePath.includes('/private/')) {
    results.publicContent.push(category);
  } else if (filePath.includes('src/content/projects')) {
    results.publicContent.push(category);
  }
  // Internal documentation
  else if (filePath.includes('/docs/') || filePath.includes('/.github/') ||
           filePath.includes('AGENTS.md') || filePath.includes('CLAUDE.md')) {
    results.internalDocs.push(category);
  }
  // Test files
  else if (filePath.includes('__tests__') || filePath.includes('.test.') ||
           filePath.includes('.spec.')) {
    results.tests.push(category);
  }
  // Code comments and console.logs
  else if (line.trim().startsWith('//') || line.trim().startsWith('*') ||
           line.includes('console.')) {
    results.codeComments.push(category);
  }
  // UI components
  else {
    results.uiComponents.push(category);
  }
}

/**
 * Scan a file for emojis
 */
function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      EMOJI_PATTERNS.forEach(emoji => {
        if (line.includes(emoji)) {
          categorizeUsage(filePath, line, index + 1, emoji);
        }
      });
    });
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
  }
}

/**
 * Recursively scan directory
 */
function scanDirectory(dirPath) {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (shouldExclude(fullPath)) continue;

      if (entry.isDirectory()) {
        scanDirectory(fullPath);
      } else if (entry.isFile()) {
        // Scan text files only
        const ext = path.extname(entry.name);
        if (['.ts', '.tsx', '.js', '.jsx', '.md', '.mdx', '.json', '.yml', '.yaml'].includes(ext)) {
          scanFile(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning ${dirPath}:`, error.message);
  }
}

/**
 * Print results
 */
function printResults() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('🔍 EMOJI USAGE ANALYSIS REPORT');
  console.log('═══════════════════════════════════════════════════════\n');

  // Summary
  console.log('📊 SUMMARY\n');
  console.log(`  Total Emojis Found: ${Object.values(results).flat().length}`);
  console.log(`  Public Content (CRITICAL): ${results.publicContent.length}`);
  console.log(`  Internal Docs: ${results.internalDocs.length}`);
  console.log(`  Code Comments: ${results.codeComments.length}`);
  console.log(`  UI Components: ${results.uiComponents.length}`);
  console.log(`  Tests: ${results.tests.length}\n`);

  // Public content (CRITICAL - needs replacement)
  if (results.publicContent.length > 0) {
    console.log('\n🚨 PUBLIC CONTENT (User-Facing - NEEDS REPLACEMENT)\n');
    console.log('These emojis appear in blog posts, projects, or public MDX content.');
    console.log('Replace with React icons or text alternatives.\n');

    const grouped = {};
    results.publicContent.forEach(item => {
      if (!grouped[item.file]) grouped[item.file] = [];
      grouped[item.file].push(item);
    });

    Object.entries(grouped).forEach(([file, items]) => {
      console.log(`  📄 ${path.relative(ROOT_DIR, file)}`);
      items.forEach(item => {
        console.log(`     Line ${item.line}: ${item.emoji} - ${item.content.substring(0, 80)}...`);
      });
      console.log('');
    });
  }

  // UI components
  if (results.uiComponents.length > 0) {
    console.log('\n⚠️  UI COMPONENTS (Review Needed)\n');
    console.log('These emojis appear in component code. Review if they are rendered to users.\n');

    const grouped = {};
    results.uiComponents.forEach(item => {
      if (!grouped[item.file]) grouped[item.file] = [];
      grouped[item.file].push(item);
    });

    Object.entries(grouped).forEach(([file, items]) => {
      console.log(`  📄 ${path.relative(ROOT_DIR, file)}`);
      items.slice(0, 3).forEach(item => {
        console.log(`     Line ${item.line}: ${item.emoji} - ${item.content.substring(0, 80)}...`);
      });
      if (items.length > 3) {
        console.log(`     ... and ${items.length - 3} more`);
      }
      console.log('');
    });
  }

  // Internal docs (OK to keep)
  console.log('\n✅ INTERNAL DOCUMENTATION (OK to keep)\n');
  console.log(`  ${results.internalDocs.length} emojis found in docs/, .github/, AGENTS.md, etc.`);
  console.log('  These are fine for internal use.\n');

  // Code comments (OK to keep)
  console.log('✅ CODE COMMENTS & LOGS (OK to keep)\n');
  console.log(`  ${results.codeComments.length} emojis found in comments and console.log statements.`);
  console.log('  These are fine for development.\n');

  // Tests (OK to keep)
  console.log('✅ TESTS (OK to keep)\n');
  console.log(`  ${results.tests.length} emojis found in test files.`);
  console.log('  These are fine for test readability.\n');

  // Recommendations
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📋 RECOMMENDATIONS');
  console.log('═══════════════════════════════════════════════════════\n');

  if (results.publicContent.length > 0) {
    console.log('🚨 CRITICAL:');
    console.log(`   • Replace ${results.publicContent.length} emojis in public content`);
    console.log('   • Use React icons from lucide-react instead');
    console.log('   • Update blog posts and project descriptions\n');
  }

  if (results.uiComponents.length > 0) {
    console.log('⚠️  REVIEW:');
    console.log(`   • Check ${results.uiComponents.length} emojis in UI components`);
    console.log('   • Verify if they are user-facing or internal\n');
  }

  console.log('✅ OK TO KEEP:');
  console.log('   • Internal documentation emojis');
  console.log('   • Code comments and console.log emojis');
  console.log('   • Test file emojis\n');

  console.log('💡 AI INSTRUCTION UPDATE:');
  console.log('   • Add rule: "Never use emojis in public content (blog posts, projects)"');
  console.log('   • Update: AGENTS.md, CLAUDE.md, .github/copilot-instructions.md\n');

  console.log('═══════════════════════════════════════════════════════\n');
}

/**
 * Main execution
 */
function main() {
  console.log('Starting emoji analysis...\n');

  // Scan each directory
  SCAN_DIRS.forEach(dir => {
    const fullPath = path.join(ROOT_DIR, dir);
    if (fs.existsSync(fullPath)) {
      console.log(`Scanning ${dir}...`);
      scanDirectory(fullPath);
    }
  });

  // Print results
  printResults();
}

main();
