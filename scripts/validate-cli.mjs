#!/usr/bin/env node

/**
 * Unified Validation CLI
 * 
 * Single entry point for all validation tasks across the project.
 * Provides a consistent interface for running validation checks.
 * 
 * Usage:
 *   npm run validate <command>
 *   npm run validate all
 * 
 * Commands:
 *   allowlist      - Validate PII allowlist (audit + validate)
 *   contrast       - Validate WCAG color contrast ratios
 *   content        - Validate markdown content structure
 *   design-tokens  - Validate design token usage
 *   emojis         - Validate emoji usage restrictions
 *   feeds          - Validate RSS/Atom feeds
 *   sitemap        - Validate sitemap.xml completeness
 *   botid          - Validate BotID configuration
 *   frontmatter    - Validate markdown frontmatter
 *   post-ids       - Validate blog post ID uniqueness
 *   structured-data - Validate structured data (JSON-LD)
 *   instructions   - Validate instruction files
 *   mermaid        - Lint mermaid diagrams
 *   reports-pii    - Check reports for PII
 *   all            - Run all validations
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Map of commands to their script paths
const validators = {
  allowlist: {
    scripts: [
      'validation/audit-allowlist.mjs',
      'validation/validate-allowlist.mjs',
    ],
    description: 'Validate PII allowlist (audit + validate)',
  },
  contrast: {
    scripts: ['validate-color-contrast.mjs'],
    description: 'Validate WCAG color contrast ratios',
  },
  content: {
    scripts: ['validation/validate-markdown-content.mjs'],
    description: 'Validate markdown content structure',
  },
  'design-tokens': {
    scripts: ['validation/validate-design-tokens.mjs'],
    description: 'Validate design token usage',
  },
  emojis: {
    scripts: ['validate-emojis.mjs'],
    description: 'Validate emoji usage restrictions',
  },
  feeds: {
    scripts: ['validate-feeds.mjs'],
    description: 'Validate RSS/Atom feeds',
  },
  sitemap: {
    scripts: ['validate-sitemap.mjs'],
    description: 'Validate sitemap.xml completeness',
  },
  botid: {
    scripts: ['validation/validate-botid-setup.mjs'],
    description: 'Validate BotID configuration',
  },
  frontmatter: {
    scripts: ['validation/validate-frontmatter.mjs'],
    description: 'Validate markdown frontmatter',
  },
  'post-ids': {
    scripts: ['validation/validate-post-ids.mjs'],
    description: 'Validate blog post ID uniqueness',
  },
  'structured-data': {
    scripts: ['validation/validate-structured-data.mjs'],
    description: 'Validate structured data (JSON-LD)',
  },
  instructions: {
    scripts: ['validation/validate-instructions.mjs'],
    description: 'Validate instruction files',
  },
  mermaid: {
    scripts: ['validation/lint-mermaid-diagrams.mjs'],
    description: 'Lint mermaid diagrams',
  },
  'reports-pii': {
    scripts: ['validation/check-reports-for-pii.mjs'],
    description: 'Check reports for PII',
  },
};

// All validators for 'all' command
const allValidators = Object.keys(validators).sort();

function printHelp() {
  console.log('Unified Validation CLI\n');
  console.log('Usage: npm run validate <command>\n');
  console.log('Commands:');
  allValidators.forEach((cmd) => {
    const info = validators[cmd];
    console.log(`  ${cmd.padEnd(18)} - ${info.description}`);
  });
  console.log(`  ${'all'.padEnd(18)} - Run all validations\n`);
  console.log('Examples:');
  console.log('  npm run validate contrast');
  console.log('  npm run validate design-tokens');
  console.log('  npm run validate all\n');
}

function runValidator(command) {
  const info = validators[command];
  if (!info) {
    console.error(`❌ Unknown command: ${command}`);
    printHelp();
    process.exit(1);
  }

  console.log(`\n🔍 Running: ${info.description}\n`);

  let hasErrors = false;
  for (const script of info.scripts) {
    try {
      const fullPath = path.join(__dirname, script);
      execSync(`node "${fullPath}"`, { stdio: 'inherit' });
    } catch (error) {
      hasErrors = true;
      // Continue to next validator even if one fails
    }
  }

  return hasErrors;
}

function runAllValidators() {
  console.log('🚀 Running all validations...\n');
  let hasErrors = false;
  let passed = 0;
  let failed = 0;

  for (const cmd of allValidators) {
    try {
      runValidator(cmd);
      passed++;
    } catch (error) {
      failed++;
      hasErrors = true;
    }
  }

  console.log(`\n📊 Validation Summary:`);
  console.log(`  ✅ Passed: ${passed}`);
  console.log(`  ❌ Failed: ${failed}\n`);

  if (hasErrors) {
    process.exit(1);
  }
}

// Main logic
const command = process.argv[2];

if (!command || command === '--help' || command === '-h') {
  printHelp();
  process.exit(0);
}

if (command === 'all') {
  runAllValidators();
} else {
  const hasErrors = runValidator(command);
  if (hasErrors) {
    process.exit(1);
  }
}
