#!/usr/bin/env node
/**
 * Validate Prose Quality with LanguageTool
 *
 * @fileoverview Check MDX blog posts for grammar, spelling, and style issues
 * using LanguageTool Pro API.
 *
 * Usage:
 *   npm run validate:prose                           # Check all blog posts
 *   npm run validate:prose -- --file=my-post.mdx     # Check specific file
 *   npm run validate:prose -- --staged               # Check staged files
 *   npm run validate:prose -- --strict               # Exit 1 on any issues
 *
 * Environment:
 *   LANGUAGETOOL_USERNAME - Your LanguageTool username/email
 *   LANGUAGETOOL_API_KEY  - Your LanguageTool API key
 */

import dotenv from 'dotenv';
import { glob } from 'glob';
import path from 'path';

// Explicitly load .env.local
dotenv.config({ path: '.env.local' });
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { checkText, formatMatches } from './lib/languagetool-client.mjs';
import { extractProseAsText, getProseStats } from './lib/mdx-prose-extractor.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Default disabled rules (common false positives for technical writing)
const DEFAULT_DISABLED_RULES = [
  'WHITESPACE_RULE', // Extra whitespace (common in code examples)
  'EN_QUOTES', // Quote style (technical writing uses both)
  'DASH_RULE', // Em dash vs en dash (style preference)
  'WORD_CONTAINS_UNDERSCORE', // Code identifiers in prose
  'UPPERCASE_SENTENCE_START', // Code examples may not start capitalized
  'SENTENCE_FRAGMENT', // List items may be fragments

  // MDX component artifacts (Phase 1 - Jan 2026)
  'QB_NEW_EN_OTHER_ERROR_IDS_5', // Spacing after component removal (~106 false positives)
  'QB_NEW_EN_DECAPITALIZE_ERROR_IDS_6', // Technical abbreviations
  'COMMA_COMPOUND_SENTENCE', // List items without conjunctions

  // Bold list formatting (Phase 2 - Jan 2026)
  'QB_NEW_EN_OTHER_ERROR_IDS_32', // Bold definition list items (~40 false positives)
  'QB_NEW_EN_HYPHEN', // Technical compound words (performance-based, multi-part)
  'QB_NEW_EN_ORTHOGRAPHY_ERROR_IDS_1', // Capitalization in lists

  // Component spacing artifacts (Phase 2.1 - Jan 2026)
  'QB_NEW_EN', // General spacing issues from removed components (~50 false positives)
  'QB_NEW_EN_MERGED_MATCH', // Sentence structure around quotes (~4 false positives)

  // Technical writing exceptions (Phase 2.1 - Jan 2026)
  'MORFOLOGIK_RULE_EN_US', // Spell check false positives (company names, technical terms)

  // Grammar false positives (Phase 3 - Jan 2026)
  'USE_TO_VERB', // False positive: "use X to Y" is correct present tense (verb + preposition)
].join(',');

// Default disabled categories
const DEFAULT_DISABLED_CATEGORIES = [
  'REDUNDANCY', // Technical writing often repeats for clarity
].join(',');

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    file: null,
    staged: false,
    strict: false,
    level: 'default',
    verbose: false,
  };

  for (const arg of args) {
    if (arg.startsWith('--file=')) {
      options.file = arg.split('=')[1];
    } else if (arg === '--staged') {
      options.staged = true;
    } else if (arg === '--strict') {
      options.strict = true;
    } else if (arg === '--picky') {
      options.level = 'picky';
    } else if (arg === '--verbose') {
      options.verbose = true;
    }
  }

  return options;
}

/**
 * Get list of files to check
 */
async function getFilesToCheck(options) {
  if (options.file) {
    const filePath = path.resolve(PROJECT_ROOT, options.file);
    return [filePath];
  }

  if (options.staged) {
    try {
      const output = execSync('git diff --cached --name-only --diff-filter=ACM', { // NOSONAR - Administrative script, inputs from controlled sources
        encoding: 'utf-8',
        cwd: PROJECT_ROOT,
      });

      const files = output
        .split('\n')
        .filter((f) => f.endsWith('.mdx') && f.includes('content/blog'))
        .map((f) => path.resolve(PROJECT_ROOT, f));

      return files;
    } catch (error) {
      console.error('❌ Failed to get staged files:', error.message);
      return [];
    }
  }

  // Check all blog posts
  const pattern = path.join(PROJECT_ROOT, 'src/content/blog/**/*.mdx');
  return glob(pattern);
}

/**
 * Check single file
 */
async function checkFile(filePath, options) {
  const relativePath = path.relative(PROJECT_ROOT, filePath);

  try {
    // Get prose statistics
    const stats = await getProseStats(filePath);

    if (options.verbose) {
      console.log(`\n📄 ${relativePath}`);
      console.log(
        `   Prose: ${stats.proseChars} chars (${Math.round((stats.proseChars / stats.totalChars) * 100)}% of total)`
      );
      console.log(`   Code blocks: ${stats.codeBlocks}, Components: ${stats.components}`);
    }

    // Extract prose
    const prose = await extractProseAsText(filePath);

    if (prose.length === 0) {
      console.log(`⚠️  ${relativePath}: No prose content found`);
      return { file: relativePath, matches: [], skipped: true };
    }

    // Check with LanguageTool
    const result = await checkText(prose, {
      language: 'en-US',
      level: options.level,
      disabledRules: DEFAULT_DISABLED_RULES,
      disabledCategories: DEFAULT_DISABLED_CATEGORIES,
    });

    // Filter out low-priority matches if not in picky mode
    let matches = result.matches;
    if (options.level !== 'picky') {
      matches = matches.filter((m) => {
        // Keep errors and important warnings
        const issueType = m.rule.issueType?.toLowerCase() || '';
        return (
          issueType === 'misspelling' || issueType === 'grammar' || m.message.includes('spelling')
        );
      });
    }

    if (options.verbose || matches.length > 0) {
      console.log(formatMatches(matches, relativePath));
    }

    return { file: relativePath, matches, skipped: false };
  } catch (error) {
    console.error(`❌ ${relativePath}: ${error.message}`);
    return { file: relativePath, error: error.message, skipped: false };
  }
}

/**
 * Main execution
 */
async function main() {
  const options = parseArgs();

  console.log('🔍 LanguageTool Prose Validation\n');

  // Check credentials
  if (!process.env.LANGUAGETOOL_USERNAME || !process.env.LANGUAGETOOL_API_KEY) {
    console.error('❌ Missing LanguageTool credentials');
    console.error('\nSet environment variables:');
    console.error('  LANGUAGETOOL_USERNAME=your-email@example.com');
    console.error('  LANGUAGETOOL_API_KEY=your-api-key');
    console.error('\nGet your API key: https://languagetool.org/editor/settings/access-tokens');
    process.exit(1);
  }

  // Get files to check
  const files = await getFilesToCheck(options);

  if (files.length === 0) {
    console.log('ℹ️  No files to check');
    process.exit(0);
  }

  console.log(`Checking ${files.length} file${files.length === 1 ? '' : 's'}...`);
  console.log(`Level: ${options.level}`);
  console.log('');

  // Check all files
  const results = [];
  for (const file of files) {
    const result = await checkFile(file, options);
    results.push(result);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));

  const filesWithIssues = results.filter((r) => !r.skipped && !r.error && r.matches.length > 0);
  const filesWithErrors = results.filter((r) => r.error);
  const skippedFiles = results.filter((r) => r.skipped);
  const totalIssues = results.reduce((sum, r) => sum + (r.matches?.length || 0), 0);

  console.log(`\nFiles checked: ${results.length}`);
  console.log(`Files with issues: ${filesWithIssues.length}`);
  console.log(`Total issues: ${totalIssues}`);

  if (skippedFiles.length > 0) {
    console.log(`Skipped (no prose): ${skippedFiles.length}`);
  }

  if (filesWithErrors.length > 0) {
    console.log(`Errors: ${filesWithErrors.length}`);
  }

  if (totalIssues === 0 && filesWithErrors.length === 0) {
    console.log('\n✅ All files passed prose validation!');
    process.exit(0);
  }

  if (options.strict && totalIssues > 0) {
    console.log('\n❌ Prose validation failed (strict mode)');
    process.exit(1);
  }

  console.log('\n⚠️  Issues found (warnings only)');
  process.exit(0);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
