#!/usr/bin/env node
/**
 * Setup LanguageTool Custom Dictionary
 *
 * @fileoverview Add technical terms to LanguageTool custom dictionary
 * to reduce false positives for dcyfr-labs content.
 *
 * Usage:
 *   npm run prose:setup-dictionary          # Add all technical terms
 *   npm run prose:setup-dictionary -- --dry-run  # Preview only
 *   npm run prose:list-dictionary          # List current dictionary
 */

import dotenv from 'dotenv';
import { addWord, listWords } from './lib/languagetool-client.mjs';
import fs from 'fs';

// Explicitly load .env.local
dotenv.config({ path: '.env.local' });

/**
 * Technical terms to add to custom dictionary
 */
const TECHNICAL_TERMS = [
  // Frameworks & Libraries
  'Next.js',
  'React',
  'TypeScript',
  'JavaScript',
  'Tailwind',
  'Playwright',
  'Vitest',

  // Tools & Services
  'Redis',
  'Inngest',
  'Sentry',
  'GitHub',
  'VSCode',
  'ESLint',
  'Prettier',
  'MDX',
  'PostgreSQL',
  'OAuth',

  // dcyfr-specific
  'dcyfr',
  'DCYFR',
  'PageLayout',
  'ArchiveLayout',
  'ArticleLayout',

  // Web/Dev Terms
  'API',
  'CLI',
  'CI/CD',
  'HTTP',
  'HTTPS',
  'JSON',
  'YAML',
  'CSS',
  'HTML',
  'DOM',
  'npm',
  'npx',
  'webhook',
  'websocket',

  // Security
  'auth',
  'JWT',
  'CORS',
  'CSRF',
  'XSS',
  'SSRF',
  'CVE',
  'CodeQL',
  'OWASP',
  'TLS',
  'AMSI',

  // Technical Concepts
  'async',
  'await',
  'middleware',
  'serverless',
  'frontend',
  'backend',
  'fullstack',
  'monorepo',
  'microservices',
  'refactor',
  'linter',
  'transpiler',
  'bundler',

  // File formats
  'tsx',
  'jsx',
  'mjs',
  'cjs',
  'config',
  'env',

  // Common abbreviations
  'UI',
  'UX',
  'SEO',
  'RSS',
  'SVG',
  'PDF',
  'URL',

  // System/Config Files (Phase 1 - Jan 2026)
  'authorized_keys',
  'bashrc',
  'bash_profile',
  'systemd',
  'cron',

  // Additional Security Terms
  'WAF',
  'GHSA',

  // Tool/Platform Names
  'Resend',
  'GreyNoise',
  'Censys',
  'HackerOne',
  'Datadog',
  'Dynatrace',
  'Cloudflare',
  'Akamai',

  // Technical Patterns
  'cryptocurrency',
  'botnet',
  'ransomware',
  'backdoor',
];

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  return {
    dryRun: args.includes('--dry-run'),
    list: args.includes('--list'),
  };
}

/**
 * Setup dictionary
 */
async function setupDictionary(options) {
  console.log('📚 LanguageTool Dictionary Setup\n');

  // Check credentials
  if (!process.env.LANGUAGETOOL_USERNAME || !process.env.LANGUAGETOOL_API_KEY) {
    console.error('❌ Missing LanguageTool credentials');
    console.error('\nSet environment variables:');
    console.error('  LANGUAGETOOL_USERNAME=your-email@example.com');
    console.error('  LANGUAGETOOL_API_KEY=your-api-key');
    process.exit(1);
  }

  // List current dictionary
  if (options.list) {
    console.log('📖 Current Dictionary Contents:\n');
    try {
      const result = await listWords({ limit: 500 });
      if (result.words.length === 0) {
        console.log('  (empty)');
      } else {
        result.words.sort().forEach((word) => console.log(`  - ${word}`));
        console.log(`\n  Total: ${result.words.length} words`);
      }
    } catch (error) {
      console.error('❌ Failed to list dictionary:', error.message);
      process.exit(1);
    }
    return;
  }

  // Add technical terms
  console.log(`Adding ${TECHNICAL_TERMS.length} technical terms to dictionary...\n`);

  if (options.dryRun) {
    console.log('🔍 DRY RUN - Would add:');
    TECHNICAL_TERMS.forEach((term) => console.log(`  - ${term}`));
    console.log('\nRun without --dry-run to apply changes');
    return;
  }

  let added = 0;
  let skipped = 0;
  let errors = 0;

  for (const term of TECHNICAL_TERMS) {
    try {
      const result = await addWord(term);
      if (result.added) {
        console.log(`  ✅ Added: ${term}`);
        added++;
      } else {
        console.log(`  ⏭️  Skipped (already exists): ${term}`);
        skipped++;
      }
    } catch (error) {
      console.error(`  ❌ Failed to add "${term}": ${error.message}`);
      errors++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Added: ${added}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Errors: ${errors}`);
  console.log(`Total: ${TECHNICAL_TERMS.length}`);

  if (errors > 0) {
    console.log('\n⚠️  Some terms failed to add');
    process.exit(1);
  }

  console.log('\n✅ Dictionary setup complete!');
}

/**
 * Main execution
 */
async function main() {
  const options = parseArgs();
  await setupDictionary(options);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
