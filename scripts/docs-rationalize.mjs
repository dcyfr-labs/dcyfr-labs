#!/usr/bin/env node

/**
 * Documentation Rationalization Framework
 *
 * Systematically reduces documentation overhead through:
 * - Duplicate detection and consolidation
 * - Outdated content archival
 * - Category-based organization
 * - Historical document cleanup
 *
 * Usage:
 *   npm run docs:rationalize           # Full analysis + interactive cleanup
 *   npm run docs:analyze              # Analysis only (safe)
 *   npm run docs:archive-old          # Archive old documents
 *   npm run docs:consolidate          # Consolidate related documents
 *
 * Advanced Usage:
 *   node scripts/docs-rationalize.mjs --help
 *   node scripts/docs-rationalize.mjs --analyze-only
 *   node scripts/docs-rationalize.mjs --consolidate --category reports
 *   node scripts/docs-rationalize.mjs --archive --days 90
 *
 * Target: Reduce 781 → 300 files (62% reduction)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Color utilities
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  header: (msg) => console.log(`${colors.bold}${colors.blue}${msg}${colors.reset}`),
  separator: () => console.log(`${colors.gray}${'─'.repeat(70)}${colors.reset}`),
};

// Rationalization patterns
const CONSOLIDATION_PATTERNS = {
  // Phase completion reports
  'phase-reports': {
    pattern: /PHASE_\d+.*(?:COMPLETE|SUMMARY).*\.md$/i,
    consolidate: 'docs/reports/PHASE_COMPLETION_CONSOLIDATED.md',
    category: 'reports',
  },

  // Design token documentation
  'design-tokens': {
    pattern: /DESIGN_TOKEN.*\.md$/i,
    consolidate: 'docs/guides/DESIGN_TOKENS_COMPREHENSIVE.md',
    category: 'guides',
  },

  // Implementation plans
  'implementation-plans': {
    pattern: /.*PLAN.*2026-02-\d+\.md$/i,
    consolidate: 'docs/plans/IMPLEMENTATION_PLANS_ARCHIVE.md',
    category: 'plans',
  },

  // Test and migration summaries
  'migration-summaries': {
    pattern: /.*MIGRATION.*SUMMARY.*\.md$/i,
    consolidate: 'docs/reports/MIGRATION_SUMMARIES_CONSOLIDATED.md',
    category: 'reports',
  },
};

// Archive criteria
const ARCHIVE_CRITERIA = {
  // Files older than this many days
  maxAge: 90,

  // File patterns that are always safe to archive
  safeArchivePatterns: [
    /.*2026-02-0[1-9].*\.md$/, // Early February files
    /.*_COMPLETE_.*\.md$/i, // Completion reports
    /.*_SUMMARY_.*\.md$/i, // Summary reports
    /PHASE_\d+.*\.md$/i, // Phase documents
  ],

  // Patterns to never archive (critical docs)
  preservePatterns: [/README\.md$/i, /INDEX\.md$/i, /QUICKSTART/i, /REFERENCE/i, /AGENTS\.md$/i],
};

class DocumentationRationalizer {
  constructor(options = {}) {
    this.docsDir = path.resolve(__dirname, '..', 'docs');
    this.dryRun = options.dryRun || false;
    this.verbose = options.verbose || false;
    this.analysis = {
      totalFiles: 0,
      categories: {},
      consolidationCandidates: {},
      archiveCandidates: [],
      duplicates: [],
      outdated: [],
    };
  }

  async scanDocumentation() {
    log.header('📊 Analyzing documentation structure...');

    const files = await this.getAllMarkdownFiles(this.docsDir);
    this.analysis.totalFiles = files.length;

    for (const file of files) {
      await this.analyzeFile(file);
    }

    log.info(`Scanned ${this.analysis.totalFiles} markdown files`);
    return this.analysis;
  }

  async getAllMarkdownFiles(dir, basePath = '') {
    const files = [];

    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.join(basePath, entry.name);

        if (entry.isDirectory() && !entry.name.startsWith('.')) {
          files.push(...(await this.getAllMarkdownFiles(fullPath, relativePath)));
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          files.push({
            fullPath,
            relativePath,
            name: entry.name,
            category: this.categorizeFile(relativePath),
          });
        }
      }
    } catch {
      if (this.verbose) {
        log.warn(`Could not read directory: ${dir}`);
      }
    }

    return files;
  }

  categorizeFile(relativePath) {
    const parts = relativePath.split(path.sep);
    if (parts.length > 1) {
      return parts[0]; // First directory level
    }
    return 'root';
  }

  async analyzeFile(file) {
    try {
      const stats = fs.statSync(file.fullPath);
      const content = fs.readFileSync(file.fullPath, 'utf8');

      // Categorize by directory
      if (!this.analysis.categories[file.category]) {
        this.analysis.categories[file.category] = [];
      }
      this.analysis.categories[file.category].push(file);

      // Check consolidation patterns
      for (const [patternName, config] of Object.entries(CONSOLIDATION_PATTERNS)) {
        if (config.pattern.test(file.name)) {
          if (!this.analysis.consolidationCandidates[patternName]) {
            this.analysis.consolidationCandidates[patternName] = {
              config,
              files: [],
            };
          }
          this.analysis.consolidationCandidates[patternName].files.push(file);
        }
      }

      // Check archive criteria
      const ageInDays = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
      const isOld = ageInDays > ARCHIVE_CRITERIA.maxAge;
      const isSafeToArchive = ARCHIVE_CRITERIA.safeArchivePatterns.some((p) => p.test(file.name));
      const shouldPreserve = ARCHIVE_CRITERIA.preservePatterns.some((p) => p.test(file.name));

      if ((isOld || isSafeToArchive) && !shouldPreserve) {
        this.analysis.archiveCandidates.push({
          ...file,
          age: ageInDays,
          reason: isOld ? `${Math.floor(ageInDays)} days old` : 'safe archive pattern',
        });
      }

      // Check for outdated content
      if (content.includes('2026-02-0') && !content.includes('<!-- KEEP -->')) {
        this.analysis.outdated.push({
          ...file,
          reason: 'Contains early February 2026 dates',
        });
      }
    } catch {
      if (this.verbose) {
        log.warn(`Could not analyze file: ${file.relativePath}`);
      }
    }
  }

  printAnalysis() {
    log.header(`📈 Documentation Analysis Results`);
    log.separator();

    // Overall stats
    log.info(`Total markdown files: ${this.analysis.totalFiles}`);
    log.info(`Categories found: ${Object.keys(this.analysis.categories).length}`);

    // Category breakdown
    log.header('\n📁 Files by Category:');
    const sortedCategories = Object.entries(this.analysis.categories).sort(
      (a, b) => b[1].length - a[1].length
    );

    sortedCategories.forEach(([category, files]) => {
      console.log(`  ${category}: ${files.length} files`);
    });

    // Consolidation opportunities
    log.header('\n🔄 Consolidation Opportunities:');
    Object.entries(this.analysis.consolidationCandidates).forEach(([name, data]) => {
      log.info(`${name}: ${data.files.length} files → ${data.config.consolidate}`);
      if (this.verbose) {
        data.files.forEach((f) => console.log(`    • ${f.relativePath}`));
      }
    });

    // Archive candidates
    log.header('\n📦 Archive Candidates:');
    log.info(`${this.analysis.archiveCandidates.length} files can be archived`);
    if (this.verbose && this.analysis.archiveCandidates.length > 0) {
      this.analysis.archiveCandidates.slice(0, 10).forEach((f) => {
        console.log(`    • ${f.relativePath} (${f.reason})`);
      });
      if (this.analysis.archiveCandidates.length > 10) {
        console.log(`    ... and ${this.analysis.archiveCandidates.length - 10} more`);
      }
    }

    // Reduction estimate
    const consolidationSavings = Object.values(this.analysis.consolidationCandidates).reduce(
      (sum, data) => sum + Math.max(0, data.files.length - 1),
      0
    );

    const totalReduction = consolidationSavings + this.analysis.archiveCandidates.length;
    const finalCount = this.analysis.totalFiles - totalReduction;
    const reductionPercentage = ((totalReduction / this.analysis.totalFiles) * 100).toFixed(1);

    log.header('\n🎯 Reduction Estimate:');
    log.info(`Current files: ${this.analysis.totalFiles}`);
    log.info(`Consolidation savings: ${consolidationSavings} files`);
    log.info(`Archive candidates: ${this.analysis.archiveCandidates.length} files`);
    log.success(`Projected result: ${finalCount} files (${reductionPercentage}% reduction)`);
    log.separator();
  }

  async executeConsolidation(patternName) {
    const candidate = this.analysis.consolidationCandidates[patternName];
    if (!candidate || candidate.files.length < 2) {
      log.warn(`No consolidation needed for ${patternName}`);
      return false;
    }

    log.header(`🔄 Consolidating ${patternName}...`);

    // Create consolidated content
    let consolidatedContent = this.generateConsolidatedHeader(candidate);

    for (const file of candidate.files) {
      try {
        const content = fs.readFileSync(file.fullPath, 'utf8');
        consolidatedContent += this.formatFileSection(file, content);
      } catch (error) {
        log.warn(`Could not read ${file.relativePath}: ${error.message}`);
      }
    }

    // Write consolidated file
    if (!this.dryRun) {
      const consolidatedPath = path.resolve(this.docsDir, '..', candidate.config.consolidate);
      const consolidatedDir = path.dirname(consolidatedPath);

      if (!fs.existsSync(consolidatedDir)) {
        fs.mkdirSync(consolidatedDir, { recursive: true });
      }

      fs.writeFileSync(consolidatedPath, consolidatedContent);
      log.success(`Created consolidated file: ${candidate.config.consolidate}`);

      // Archive original files
      for (const file of candidate.files) {
        await this.archiveFile(file, `Consolidated into ${candidate.config.consolidate}`);
      }
    } else {
      log.info(
        `Would consolidate ${candidate.files.length} files into ${candidate.config.consolidate}`
      );
    }

    return true;
  }

  generateConsolidatedHeader(candidate) {
    const timestamp = new Date().toISOString().split('T')[0];
    return `<!-- TLP:AMBER - Internal Use Only -->
# ${candidate.config.consolidate.split('/').pop().replace('.md', '').replace(/_/g, ' ')}

**Information Classification:** TLP:AMBER (Internal Use Only)
**Consolidation Date:** ${timestamp}
**Original Files:** ${candidate.files.length} documents

This document consolidates related documentation to reduce operational overhead.

---

`;
  }

  formatFileSection(file, content) {
    const filename = file.name.replace('.md', '');
    const cleanContent = content
      .replace(/^<!--.*?-->[\s\n]*/m, '') // Remove TLP headers
      .replace(/^# .*/m, '') // Remove main title
      .trim();

    return `## ${filename}

**Original Location:** \`${file.relativePath}\`

${cleanContent}

---

`;
  }

  async archiveFile(file, reason = 'Automated archival') {
    const archiveDir = path.join(this.docsDir, '.archive', new Date().toISOString().split('T')[0]);

    if (!fs.existsSync(archiveDir)) {
      fs.mkdirSync(archiveDir, { recursive: true });
    }

    if (!this.dryRun) {
      const archivePath = path.join(archiveDir, file.name);
      fs.renameSync(file.fullPath, archivePath);
      log.success(`Archived: ${file.relativePath} → .archive/`);
    } else {
      log.info(`Would archive: ${file.relativePath} (${reason})`);
    }
  }

  static usage() {
    console.log(`
${colors.bold}DCYFR Labs Documentation Rationalization${colors.reset}

${colors.bold}Usage:${colors.reset}
  docs-rationalize.mjs [options] [action]

${colors.bold}Actions:${colors.reset}
  analyze         Analyze documentation structure (default)
  consolidate     Consolidate related documents
  archive         Archive outdated documents
  execute         Full rationalization (consolidate + archive)

${colors.bold}Options:${colors.reset}
  --help          Show this help
  --dry-run       Preview changes without modifications
  --verbose, -v   Detailed output
  --category      Target specific category
  --days          Archive files older than N days

${colors.bold}Examples:${colors.reset}
  docs-rationalize.mjs                     # Analysis only
  docs-rationalize.mjs consolidate --dry-run   # Preview consolidation
  docs-rationalize.mjs archive --days 60       # Archive 60+ day old files
  docs-rationalize.mjs execute --verbose       # Full rationalization
`);
  }
}

// CLI handling
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    DocumentationRationalizer.usage();
    process.exit(0);
  }

  const rationalizer = new DocumentationRationalizer({
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose') || args.includes('-v'),
  });

  try {
    await rationalizer.scanDocumentation();
    rationalizer.printAnalysis();

    const action = args[0] || 'analyze';

    switch (action) {
      case 'consolidate':
        log.header('🔄 Starting consolidation...');
        for (const patternName of Object.keys(rationalizer.analysis.consolidationCandidates)) {
          await rationalizer.executeConsolidation(patternName);
        }
        break;

      case 'archive':
        log.header('📦 Starting archival...');
        for (const candidate of rationalizer.analysis.archiveCandidates) {
          await rationalizer.archiveFile(candidate);
        }
        break;

      case 'execute':
        log.header('🎯 Full rationalization...');
        // First consolidate, then archive
        for (const patternName of Object.keys(rationalizer.analysis.consolidationCandidates)) {
          await rationalizer.executeConsolidation(patternName);
        }
        for (const candidate of rationalizer.analysis.archiveCandidates) {
          await rationalizer.archiveFile(candidate);
        }
        break;

      case 'analyze':
      default:
        log.success('Analysis complete. Use --help for next steps.');
        break;
    }
  } catch (error) {
    log.error(`Documentation rationalization failed: ${error.message}`);
    if (rationalizer.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(`Fatal error: ${error.message}`);
    process.exit(1);
  });
}

export default DocumentationRationalizer;
