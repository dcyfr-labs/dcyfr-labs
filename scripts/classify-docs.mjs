#!/usr/bin/env node
/**
 * Documentation Classification & Migration Tool
 *
 * Purpose: Identify operational docs (point-in-time) vs reference docs (timeless)
 * and migrate operational docs to private/ subdirectories per governance policy.
 *
 * Usage:
 *   npm run classify:docs              # Dry run - show what would be migrated
 *   npm run classify:docs -- --execute # Execute migration
 *   npm run classify:docs -- --verbose # Show detailed analysis
 *
 * Based on: docs/governance/OPERATIONAL_DOCUMENTATION_POLICY.md
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const docsDir = path.join(rootDir, 'docs');

// Parse CLI arguments
const args = process.argv.slice(2);
const EXECUTE = args.includes('--execute');
const VERBOSE = args.includes('--verbose');
const DRY_RUN = !EXECUTE;

// Operational documentation patterns (from OPERATIONAL_DOCUMENTATION_POLICY.md)
// NOTE: Conservative approach - only flag clearly operational docs
const OPERATIONAL_FILENAME_PATTERNS = [
  // Completion/status reports with dates or clear indicators
  /-summary-\d{4}(-\d{2}){1,2}\.md$/i, // summary-2026-01-24.md
  /-complete-\d{4}(-\d{2}){1,2}\.md$/i, // complete-2026-01.md
  /-status-\d{4}(-\d{2}){1,2}\.md$/i, // status-2026-01-24.md
  /-report-\d{4}(-\d{2}){1,2}\.md$/i, // report-2026-01-24.md
  /-validation-\d{4}(-\d{2}){1,2}\.md$/i, // validation-2026-01.md
  /-implementation-\d{4}(-\d{2}){1,2}\.md$/i, // implementation-2026-01.md
  /-findings-\d{4}(-\d{2}){1,2}\.md$/i, // findings-2026-01-24.md
  /-results-\d{4}(-\d{2}){1,2}\.md$/i, // results-2026-01.md

  // Session logs (always operational)
  /^sessions\/.+-\d{4}-\d{2}-\d{2}\.md$/i, // sessions/xxx-2026-01-24.md

  // All-caps operational files (PROJECT_STATUS, COMPLETION_REPORT, etc.)
  /^[A-Z_]+_(SUMMARY|COMPLETE|STATUS|REPORT|VALIDATION|IMPLEMENTATION|FINDINGS|RESULTS).*\.md$/i,

  // Audit/analysis files with dates in name
  /-audit-\d{4}(-\d{2}){1,2}\.md$/i,
  /-analysis-\d{4}(-\d{2}){1,2}\.md$/i,
];

const OPERATIONAL_CONTENT_PATTERNS = [
  // Strong indicators of point-in-time status
  /^##?\s*Status:\s*(COMPLETE|IN\s+PROGRESS|PENDING)/im,
  /^##?\s*Implementation\s+(Complete|Status)/im,
  /^##?\s*Completion\s+(Summary|Status|Report)/im,
  /Work\s+Session\s+(Log|Summary):/i,
  /^##?\s*Session\s+Summary/im,
  /Point-in-time\s+(snapshot|status|report)/i,

  // Date-stamped headers indicating operational doc
  /^##?\s*.+\s+\d{4}-\d{2}(-\d{2})?$/im, // "## Status 2026-01-24"
];

// Categories that should always have private/ subdirectory available
const CATEGORIES_WITH_PRIVATE = [
  'accessibility',
  'analysis',
  'api',
  'architecture',
  'authentication',
  'automation',
  'backlog',
  'blog',
  'components',
  'content',
  'debugging',
  'design',
  'features',
  'governance',
  'maintenance',
  'mcp',
  'operations',
  'optimization',
  'performance',
  'platform',
  'proposals',
  'refactoring',
  'research',
  'security',
  'sessions',
  'templates',
  'testing',
  'troubleshooting',
];

// Files to exclude from analysis
const EXCLUDE_PATTERNS = [
  /^INDEX\.md$/i,
  /^README\.md$/i,
  /^QUICK_REFERENCE\.md$/i,
  /\/private\//i, // Already in private/
];

class DocumentClassifier {
  constructor() {
    this.results = {
      total: 0,
      reference: 0,
      operational: 0,
      needsMigration: [],
      alreadyPrivate: [],
      errors: [],
    };
  }

  /**
   * Check if file matches operational patterns
   */
  isOperationalFile(filename, content) {
    const reasons = [];

    // Check filename patterns
    for (const pattern of OPERATIONAL_FILENAME_PATTERNS) {
      if (pattern.test(filename)) {
        reasons.push(`Filename matches pattern: ${pattern.toString()}`);
      }
    }

    // Check content patterns (require at least 2 matches for content-based detection)
    const contentMatches = [];
    for (const pattern of OPERATIONAL_CONTENT_PATTERNS) {
      if (pattern.test(content)) {
        contentMatches.push(`Content matches pattern: ${pattern.toString()}`);
      }
    }

    // Only flag as operational if:
    // 1. Filename matches patterns, OR
    // 2. Content has 2+ operational indicators (reduces false positives)
    if (contentMatches.length >= 2) {
      reasons.push(...contentMatches);
    }

    return {
      isOperational: reasons.length > 0,
      reasons,
    };
  }

  /**
   * Check if file should be excluded
   */
  shouldExclude(relativePath, filename) {
    return EXCLUDE_PATTERNS.some((pattern) => pattern.test(relativePath) || pattern.test(filename));
  }

  /**
   * Get target private path for a file
   */
  getPrivatePath(filePath) {
    const relativePath = path.relative(docsDir, filePath);
    const parts = relativePath.split(path.sep);

    if (parts.length < 2) {
      // File is in docs/ root - can't migrate (no category)
      return null;
    }

    const category = parts[0];
    const filename = parts[parts.length - 1];

    // Add date to filename if not present
    const hasDate = /\d{4}-\d{2}(-\d{2})?\.md$/.test(filename);
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const newFilename = hasDate ? filename : filename.replace('.md', `-${today}.md`);

    return path.join(docsDir, category, 'private', newFilename);
  }

  /**
   * Scan directory recursively
   */
  async scanDirectory(dir) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(docsDir, fullPath);

        if (entry.isDirectory()) {
          await this.scanDirectory(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          await this.analyzeFile(fullPath, relativePath, entry.name);
        }
      }
    } catch (error) {
      this.results.errors.push({
        path: dir,
        error: error.message,
      });
    }
  }

  /**
   * Analyze a single file
   */
  async analyzeFile(filePath, relativePath, filename) {
    this.results.total++;

    // Skip excluded files
    if (this.shouldExclude(relativePath, filename)) {
      if (VERBOSE) {
        console.log(`📋 Skipped (excluded): ${relativePath}`);
      }
      return;
    }

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const { isOperational, reasons } = this.isOperationalFile(filename, content);

      if (!isOperational) {
        this.results.reference++;
        if (VERBOSE) {
          console.log(`📖 Reference doc: ${relativePath}`);
        }
        return;
      }

      this.results.operational++;

      // Check if already in private/
      if (relativePath.includes('/private/')) {
        this.results.alreadyPrivate.push({
          path: relativePath,
          reasons,
        });
        if (VERBOSE) {
          console.log(`✅ Already private: ${relativePath}`);
        }
        return;
      }

      // Needs migration
      const targetPath = this.getPrivatePath(filePath);
      if (!targetPath) {
        this.results.errors.push({
          path: relativePath,
          error: 'Cannot determine private path (file in docs/ root)',
        });
        return;
      }

      this.results.needsMigration.push({
        source: filePath,
        sourcePath: relativePath,
        target: targetPath,
        targetPath: path.relative(rootDir, targetPath),
        reasons,
      });
    } catch (error) {
      this.results.errors.push({
        path: relativePath,
        error: error.message,
      });
    }
  }

  /**
   * Execute migration for identified files
   */
  async migrate() {
    if (this.results.needsMigration.length === 0) {
      console.log('\n✅ No files need migration!');
      return;
    }

    console.log(`\n🔄 Migrating ${this.results.needsMigration.length} files...\n`);

    let successCount = 0;
    let failCount = 0;

    for (const item of this.results.needsMigration) {
      try {
        // Ensure target directory exists
        await fs.mkdir(path.dirname(item.target), { recursive: true });

        // Move file
        await fs.rename(item.source, item.target);
        console.log(`✅ Migrated: ${item.sourcePath} → ${item.targetPath}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed: ${item.sourcePath} - ${error.message}`);
        failCount++;
      }
    }

    console.log(`\n📊 Migration complete: ${successCount} succeeded, ${failCount} failed`);
  }

  /**
   * Generate report
   */
  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📋 DOCUMENTATION CLASSIFICATION REPORT');
    console.log('='.repeat(80));
    console.log(`Generated: ${new Date().toISOString()}`);
    console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'EXECUTE'}`);
    console.log('='.repeat(80));

    console.log('\n📊 Summary:');
    console.log(`  Total files analyzed: ${this.results.total}`);
    console.log(`  Reference docs (public): ${this.results.reference}`);
    console.log(`  Operational docs (should be private): ${this.results.operational}`);
    console.log(`    - Already in private/: ${this.results.alreadyPrivate.length}`);
    console.log(`    - Need migration: ${this.results.needsMigration.length}`);
    console.log(`  Errors: ${this.results.errors.length}`);

    if (this.results.needsMigration.length > 0) {
      console.log('\n🔄 Files requiring migration:');
      console.log('-'.repeat(80));

      this.results.needsMigration.forEach((item, index) => {
        console.log(`\n${index + 1}. ${item.sourcePath}`);
        console.log(`   → ${item.targetPath}`);
        if (VERBOSE) {
          console.log('   Reasons:');
          item.reasons.forEach((reason) => console.log(`     - ${reason}`));
        }
      });
      console.log('-'.repeat(80));

      if (DRY_RUN) {
        console.log('\n💡 To execute migration, run:');
        console.log('   npm run classify:docs -- --execute');
      }
    }

    if (this.results.errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      console.log('-'.repeat(80));
      this.results.errors.forEach((error) => {
        console.log(`  ${error.path}: ${error.error}`);
      });
      console.log('-'.repeat(80));
    }

    if (VERBOSE && this.results.alreadyPrivate.length > 0) {
      console.log('\n✅ Already correctly placed in private/:');
      console.log('-'.repeat(80));
      this.results.alreadyPrivate.forEach((item) => {
        console.log(`  ${item.path}`);
      });
      console.log('-'.repeat(80));
    }

    console.log('\n📖 Policy Reference:');
    console.log('   docs/governance/OPERATIONAL_DOCUMENTATION_POLICY.md');
    console.log('='.repeat(80) + '\n');
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 Scanning documentation for classification...\n');

  const classifier = new DocumentClassifier();
  await classifier.scanDirectory(docsDir);
  classifier.generateReport();

  if (EXECUTE) {
    await classifier.migrate();
  }

  // Exit with error code if there are files needing migration
  const exitCode = classifier.results.needsMigration.length > 0 ? 1 : 0;
  process.exit(exitCode);
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
