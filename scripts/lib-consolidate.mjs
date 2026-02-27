#!/usr/bin/env node

/**
 * Utility File Consolidation Framework
 * Phase 11d: Systematic reduction of src/lib files through consolidation
 *
 * Target: 175 → 130 files (25.7% reduction)
 * Focus: Merge similar utilities, eliminate duplication, optimize organization
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Consolidation patterns for utility files
const CONSOLIDATION_PATTERNS = {
  // Redis clients - multiple implementations
  'redis-clients': {
    pattern: /redis|cache|kv/i,
    consolidate: 'src/lib/redis/index.ts',
    category: 'infrastructure',
    description: 'Consolidate Redis/cache clients into unified interface',
  },

  // Analytics utilities - scattered implementations
  'analytics-utils': {
    pattern: /analytics|tracking|metrics/i,
    consolidate: 'src/lib/analytics/index.ts',
    category: 'analytics',
    description: 'Merge analytics utilities into comprehensive module',
  },

  // Validation utilities - multiple validators
  'validation-utils': {
    pattern: /validate|validator|check|verify/i,
    consolidate: 'src/lib/validation/index.ts',
    category: 'validation',
    description: 'Combine validation utilities into unified validators',
  },

  // GitHub utilities - API clients and helpers
  'github-utils': {
    pattern: /github|gh-|git-/i,
    consolidate: 'src/lib/github/index.ts',
    category: 'integration',
    description: 'Consolidate GitHub-related utilities',
  },

  // Small helper utilities - type guards, formatters, etc.
  'misc-helpers': {
    pattern: /helper|util|format|guard|type/i,
    consolidate: 'src/lib/utils/index.ts',
    category: 'utilities',
    description: 'Merge small helper utilities',
  },
};

// File size and complexity criteria for consolidation
const CONSOLIDATION_CRITERIA = {
  // Files smaller than this are good consolidation candidates
  maxSizeForConsolidation: 2000, // bytes

  // Files with fewer lines are consolidation candidates
  maxLinesForConsolidation: 100,

  // Directories with few files should be consolidated
  minFilesForDirectory: 3,

  // Similar file patterns (same prefix/suffix)
  similarityPatterns: [
    /(.+)-client\.ts$/, // *-client.ts files
    /(.+)-utils\.ts$/, // *-utils.ts files
    /(.+)-helpers\.ts$/, // *-helpers.ts files
    /(.+)\.types\.ts$/, // *.types.ts files
    /(.+)\.config\.ts$/, // *.config.ts files
  ],
};

class LibConsolidator {
  constructor() {
    this.libDir = path.resolve(__dirname, '..', 'src', 'lib');
    this.analysis = {
      totalFiles: 0,
      directories: {},
      consolidationCandidates: {},
      similarFiles: {},
      smallFiles: [],
      singleFileDirectories: [],
      duplicatePatterns: [],
    };
  }

  async scanLibraries() {
    console.log('📊 Analyzing utility file structure...');

    const files = await this.getAllLibFiles(this.libDir);
    this.analysis.totalFiles = files.length;

    for (const file of files) {
      await this.analyzeFile(file);
    }

    // Analyze directory structure
    await this.analyzeDirectoryStructure();

    // Find similar files
    await this.findSimilarFiles();

    console.log(`📈 Scanned ${this.analysis.totalFiles} utility files`);
    return this.analysis;
  }

  async getAllLibFiles(dir, basePath = '') {
    const files = [];

    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.join(basePath, entry.name);

        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== '__tests__') {
          files.push(...(await this.getAllLibFiles(fullPath, relativePath)));
        } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
          const stats = fs.statSync(fullPath);
          const content = fs.readFileSync(fullPath, 'utf8');

          files.push({
            name: entry.name,
            path: relativePath,
            fullPath,
            directory: path.dirname(relativePath) || 'lib',
            size: stats.size,
            lines: content.split('\n').length,
            content: content.substring(0, 500), // First 500 chars for analysis
          });
        }
      }
    } catch {
      // Skip inaccessible directories
    }

    return files;
  }

  async analyzeFile(file) {
    // Categorize by directory
    if (!this.analysis.directories[file.directory]) {
      this.analysis.directories[file.directory] = [];
    }
    this.analysis.directories[file.directory].push(file);

    // Check consolidation patterns
    for (const [patternName, config] of Object.entries(CONSOLIDATION_PATTERNS)) {
      if (config.pattern.test(file.name) || config.pattern.test(file.path)) {
        if (!this.analysis.consolidationCandidates[patternName]) {
          this.analysis.consolidationCandidates[patternName] = {
            config,
            files: [],
          };
        }
        this.analysis.consolidationCandidates[patternName].files.push(file);
      }
    }

    // Identify small files for consolidation
    if (
      file.size < CONSOLIDATION_CRITERIA.maxSizeForConsolidation ||
      file.lines < CONSOLIDATION_CRITERIA.maxLinesForConsolidation
    ) {
      this.analysis.smallFiles.push(file);
    }
  }

  async analyzeDirectoryStructure() {
    for (const [dirName, files] of Object.entries(this.analysis.directories)) {
      if (dirName !== 'lib' && files.length < CONSOLIDATION_CRITERIA.minFilesForDirectory) {
        this.analysis.singleFileDirectories.push({
          directory: dirName,
          files: files,
          consolidationTarget: this.suggestConsolidationTarget(dirName, files),
        });
      }
    }
  }

  suggestConsolidationTarget(directory, _files) {
    // Suggest consolidation based on directory name and content
    const dirLower = directory.toLowerCase();

    if (dirLower.includes('redis') || dirLower.includes('cache')) {
      return 'src/lib/redis/index.ts';
    }
    if (dirLower.includes('analytics') || dirLower.includes('tracking')) {
      return 'src/lib/analytics/index.ts';
    }
    if (dirLower.includes('validation') || dirLower.includes('validate')) {
      return 'src/lib/validation/index.ts';
    }
    if (dirLower.includes('github') || dirLower.includes('git')) {
      return 'src/lib/github/index.ts';
    }

    // Default to utils for miscellaneous
    return 'src/lib/utils/index.ts';
  }

  async findSimilarFiles() {
    const filesByPattern = {};

    for (const pattern of CONSOLIDATION_CRITERIA.similarityPatterns) {
      for (const file of Object.values(this.analysis.directories).flat()) {
        const match = file.name.match(pattern);
        if (match) {
          const basePattern = match[1] || pattern.toString();
          if (!filesByPattern[basePattern]) {
            filesByPattern[basePattern] = [];
          }
          filesByPattern[basePattern].push(file);
        }
      }
    }

    // Only keep patterns with multiple files
    for (const [pattern, files] of Object.entries(filesByPattern)) {
      if (files.length > 1) {
        this.analysis.similarFiles[pattern] = files;
      }
    }
  }

  displayAnalysis() {
    console.log('\n📈 Utility File Analysis Results');
    console.log('─'.repeat(70));
    console.log(`📊 Total utility files: ${this.analysis.totalFiles}`);
    console.log(`📁 Directories found: ${Object.keys(this.analysis.directories).length}`);

    console.log('\n📁 Files by Directory:');
    const sortedDirs = Object.entries(this.analysis.directories).sort(
      ([, a], [, b]) => b.length - a.length
    );

    for (const [dir, files] of sortedDirs.slice(0, 10)) {
      console.log(`  ${dir}: ${files.length} files`);
    }

    console.log('\n🔄 Consolidation Opportunities:');
    for (const [patternName, candidate] of Object.entries(this.analysis.consolidationCandidates)) {
      if (candidate.files.length > 1) {
        console.log(
          `📦 ${patternName}: ${candidate.files.length} files → ${candidate.config.consolidate}`
        );
        for (const file of candidate.files.slice(0, 5)) {
          console.log(`    • ${file.path}`);
        }
        if (candidate.files.length > 5) {
          console.log(`    ... and ${candidate.files.length - 5} more`);
        }
      }
    }

    console.log('\n📦 Single-File Directories:');
    for (const dir of this.analysis.singleFileDirectories) {
      console.log(
        `📁 ${dir.directory}: ${dir.files.length} files → ${path.basename(dir.consolidationTarget)}`
      );
      for (const file of dir.files) {
        console.log(`    • ${file.name}`);
      }
    }

    console.log('\n🔍 Similar File Patterns:');
    for (const [pattern, files] of Object.entries(this.analysis.similarFiles)) {
      console.log(`🔗 ${pattern}: ${files.length} files`);
      for (const file of files.slice(0, 3)) {
        console.log(`    • ${file.name}`);
      }
    }

    console.log('\n📏 Small Files (consolidation candidates):');
    const smallFilesByDir = {};
    for (const file of this.analysis.smallFiles) {
      if (!smallFilesByDir[file.directory]) {
        smallFilesByDir[file.directory] = [];
      }
      smallFilesByDir[file.directory].push(file);
    }

    for (const [dir, files] of Object.entries(smallFilesByDir)) {
      if (files.length > 1) {
        console.log(`📂 ${dir}: ${files.length} small files`);
      }
    }

    // Calculate reduction estimate
    const consolidationSavings = Object.values(this.analysis.consolidationCandidates).reduce(
      (sum, candidate) => sum + Math.max(0, candidate.files.length - 1),
      0
    );

    const directorySavings = this.analysis.singleFileDirectories.reduce(
      (sum, dir) => sum + Math.max(0, dir.files.length - 1),
      0
    );

    const totalSavings = consolidationSavings + directorySavings;
    const finalCount = this.analysis.totalFiles - totalSavings;
    const reductionPercent = ((totalSavings / this.analysis.totalFiles) * 100).toFixed(1);

    console.log('\n🎯 Reduction Estimate:');
    console.log(`📊 Current files: ${this.analysis.totalFiles}`);
    console.log(`💾 Pattern consolidation savings: ${consolidationSavings} files`);
    console.log(`📁 Directory consolidation savings: ${directorySavings} files`);
    console.log(`✅ Projected result: ${finalCount} files (${reductionPercent}% reduction)`);
    console.log('─'.repeat(70));
  }

  async consolidateFiles(patternName, dryRun = false) {
    const candidate = this.analysis.consolidationCandidates[patternName];
    if (!candidate || candidate.files.length <= 1) {
      console.log(`⚠️ No consolidation needed for ${patternName}`);
      return;
    }

    console.log(`🔄 Consolidating ${patternName}...`);

    if (dryRun) {
      console.log(
        `📝 Would consolidate ${candidate.files.length} files into ${candidate.config.consolidate}`
      );
      for (const file of candidate.files) {
        console.log(`    • ${file.path}`);
      }
      return;
    }

    // TODO: Implement actual consolidation logic
    // This would require careful analysis of imports, exports, and dependencies
    console.log(`🚧 Consolidation logic not yet implemented - this is a dry run`);
  }
}

// CLI interface
async function main() {
  const command = process.argv[2] || 'analyze';
  const options = process.argv.slice(3);

  const consolidator = new LibConsolidator();

  try {
    switch (command) {
      case 'help':
        console.log(`
Utility File Consolidation Framework

Commands:
  analyze [--verbose]     - Analyze utility file structure
  consolidate <pattern>   - Consolidate specific pattern
  consolidate-all         - Consolidate all patterns
  dry-run                 - Show what would be consolidated

Examples:
  node scripts/lib-consolidate.mjs analyze
  node scripts/lib-consolidate.mjs consolidate redis-clients
  node scripts/lib-consolidate.mjs dry-run
        `);
        break;

      case 'analyze':
        await consolidator.scanLibraries();
        consolidator.displayAnalysis();
        break;

      case 'consolidate':
        const pattern = options[0];
        if (!pattern) {
          console.error('❌ Please specify a pattern to consolidate');
          process.exit(1);
        }
        await consolidator.scanLibraries();
        await consolidator.consolidateFiles(pattern, false);
        break;

      case 'consolidate-all':
        await consolidator.scanLibraries();
        for (const patternName of Object.keys(CONSOLIDATION_PATTERNS)) {
          await consolidator.consolidateFiles(patternName, false);
        }
        break;

      case 'dry-run':
        await consolidator.scanLibraries();
        consolidator.displayAnalysis();
        console.log('\n🎯 Dry run consolidation preview:');
        for (const patternName of Object.keys(CONSOLIDATION_PATTERNS)) {
          await consolidator.consolidateFiles(patternName, true);
        }
        break;

      default:
        console.error(`❌ Unknown command: ${command}`);
        console.log('Use "help" for available commands');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Consolidation failed:', error.message);
    process.exit(1);
  }
}

if (process.argv[1] === __filename) {
  main();
}
