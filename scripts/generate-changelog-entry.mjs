#!/usr/bin/env node

/**
 * Generate changelog entry from git commits using Conventional Commits
 *
 * Usage:
 *   node generate-changelog-entry.mjs \
 *     --version "2026.02.12" \
 *     --previous "2026.02.05" \
 *     --commits-file "commits.txt" \
 *     --output "changelog-entry.md"
 */

import fs from 'fs';
import { parseArgs } from 'util';

// Parse command line arguments
const { values } = parseArgs({
  options: {
    version: { type: 'string' },
    previous: { type: 'string' },
    'commits-file': { type: 'string' },
    output: { type: 'string' },
  }
});

// Read commits from file
const commitsText = fs.readFileSync(values['commits-file'], 'utf-8');
const commits = commitsText.split('\n').filter(Boolean);

// Initialize categories following Keep a Changelog format
const categories = {
  added: [],
  changed: [],
  deprecated: [],
  removed: [],
  fixed: [],
  security: [],
  dependencies: []
};

const breakingChanges = [];

// Parse each commit using Conventional Commits format
commits.forEach(commit => {
  // Extract hash and message
  const parts = commit.split(' ');
  const hash = parts[0];
  const message = parts.slice(1).join(' ');

  // Parse conventional commit format: type(scope)!?: description
  const match = message.match(/^(\w+)(!?)(?:\(([^)]+)\))?: (.+)$/);

  if (!match) {
    // Non-conventional commit - categorize as technical change
    categories.changed.push({ hash, message, scope: null });
    return;
  }

  const [, type, breaking, scope, description] = match;

  // Track breaking changes
  if (breaking === '!') {
    breakingChanges.push({ type, scope, description, hash });
  }

  // Categorize by conventional commit type
  switch (type) {
    case 'feat':
      categories.added.push({ scope, description, hash });
      break;

    case 'fix':
      categories.fixed.push({ scope, description, hash });
      break;

    case 'refactor':
    case 'perf':
      categories.changed.push({ scope, description, hash });
      break;

    case 'chore':
      if (description.match(/deps?:|dependencies/i)) {
        categories.dependencies.push({ scope, description, hash });
      } else {
        categories.changed.push({ scope, description, hash });
      }
      break;

    case 'docs':
      categories.changed.push({ scope, description: `Documentation - ${description}`, hash });
      break;

    case 'style':
      categories.changed.push({ scope, description: `Styling - ${description}`, hash });
      break;

    case 'test':
      categories.changed.push({ scope, description: `Testing - ${description}`, hash });
      break;

    case 'security':
    case 'sec':
      categories.security.push({ scope, description, hash });
      break;

    case 'revert':
      categories.fixed.push({ scope, description: `Revert - ${description}`, hash });
      break;

    default:
      // Unknown type - add to changed
      categories.changed.push({ scope, description, hash });
  }
});

// Generate markdown entry
let entry = `## [${values.version}] - ${new Date().toISOString().split('T')[0]}\n\n`;

// Breaking changes section (if any)
if (breakingChanges.length > 0) {
  entry += `### ⚠️ BREAKING CHANGES\n\n`;
  breakingChanges.forEach(({ scope, description, hash }) => {
    const scopeLabel = scope ? `**${scope}**` : '**Core**';
    entry += `- ${scopeLabel} - ${description}\n`;
  });
  entry += '\n';
}

// Helper to format a section
const formatSection = (title, items) => {
  if (items.length === 0) return '';

  let section = `### ${title}\n\n`;

  items.forEach(({ scope, description, message, hash }) => {
    const text = description || message;
    const scopeLabel = scope ? `**${scope}**` : '';
    const prefix = scopeLabel ? `${scopeLabel} - ` : '';
    section += `- ${prefix}${text}\n`;
  });

  return section + '\n';
};

// Add sections in Keep a Changelog order
entry += formatSection('Added', categories.added);
entry += formatSection('Changed', categories.changed);
entry += formatSection('Deprecated', categories.deprecated);
entry += formatSection('Removed', categories.removed);
entry += formatSection('Fixed', categories.fixed);
entry += formatSection('Security', categories.security);

// Dependencies section (if any)
if (categories.dependencies.length > 0) {
  entry += formatSection('Dependencies', categories.dependencies);
}

// Add comparison link footer
if (values.previous) {
  entry += `---\n\n`;
  entry += `**Full Changelog**: [${values.previous}...${values.version}](https://github.com/dcyfr/dcyfr-labs/compare/v${values.previous}...v${values.version})\n\n`;
}

// Write to output file
fs.writeFileSync(values.output, entry);

// Log summary
console.log(`✅ Generated changelog entry for ${values.version}`);
console.log(`📝 Sections:`);
console.log(`   - Added: ${categories.added.length}`);
console.log(`   - Changed: ${categories.changed.length}`);
console.log(`   - Fixed: ${categories.fixed.length}`);
console.log(`   - Security: ${categories.security.length}`);
console.log(`   - Dependencies: ${categories.dependencies.length}`);
if (breakingChanges.length > 0) {
  console.log(`   ⚠️  Breaking Changes: ${breakingChanges.length}`);
}
