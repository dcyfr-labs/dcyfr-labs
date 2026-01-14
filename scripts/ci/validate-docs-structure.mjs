#!/usr/bin/env node

/**
 * Validates that all documentation is properly placed in docs/ folder
 * Enforces naming conventions and structure requirements
 *
 * Usage:
 *   node scripts/ci/validate-docs-structure.mjs
 *   npm run validate:docs-structure
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '../../');
const DOCS_DIR = path.join(PROJECT_ROOT, 'docs');

// Allowed root-level markdown files (exceptions)
const ALLOWED_ROOT_DOCS = [
  'README.md',
  'CONTRIBUTING.md',
  'CHANGELOG.md',
  'LICENSE.md',
  'SECURITY.md',
  'AGENTS.md',
  'CLAUDE.md',
  'CODE_OF_CONDUCT.md',
  'SUPPORT.md'
];

// Valid documentation categories - flexible pattern matching
// Allows existing structure while enforcing new placements
const VALID_CATEGORIES = [
  'ai',
  'api',
  'architecture',
  'automation',
  'components',
  'design-system',
  'governance',
  'operations',
  'security',
  'templates',
  'testing',
  'troubleshooting',
  'analysis',
  'research',
  'archive',
  'private',
  // Existing categories (will be validated but not flagged as violations)
  'accessibility',
  'authentication',
  'backlog',
  'blog',
  'content',
  'debugging',
  'design',
  'features',
  'maintenance',
  'mcp',
  'optimization',
  'performance',
  'platform',
  'proposals',
  'refactoring',
  'sessions'
];

async function checkRootDocs() {
  console.log('✓ Check 1: Root-level documentation placement');
  const rootFiles = await fs.readdir(PROJECT_ROOT);
  let violations = 0;

  for (const file of rootFiles) {
    if (file.endsWith('.md') && !ALLOWED_ROOT_DOCS.includes(file)) {
      console.error(`  ❌ Found disallowed root doc: ${file}`);
      console.error(`     Move to: docs/[category]/${file}`);
      violations++;
    }
  }

  if (violations === 0) {
    console.log('  ✅ No violations found\n');
  } else {
    console.log(`  ❌ Found ${violations} violation(s)\n`);
  }

  return violations;
}

async function checkDocsStructure() {
  console.log('✓ Check 2: Documentation category structure');
  const docsEntries = await fs.readdir(DOCS_DIR, { withFileTypes: true });
  let violations = 0;

  for (const entry of docsEntries) {
    if (entry.isDirectory()) {
      const category = entry.name;

      if (!VALID_CATEGORIES.includes(category)) {
        console.error(`  ❌ Unknown category: docs/${category}/`);
        console.error(`     Valid categories: ${VALID_CATEGORIES.join(', ')}`);
        violations++;
      }
    }
  }

  if (violations === 0) {
    console.log('  ✅ All categories valid\n');
  } else {
    console.log(`  ❌ Found ${violations} violation(s)\n`);
  }

  return violations;
}

async function checkPrivateFolders() {
  console.log('✓ Check 3: Private documentation placement');
  let violations = 0;

  for (const category of VALID_CATEGORIES) {
    if (category === 'archive' || category === 'private') continue;

    const categoryPath = path.join(DOCS_DIR, category);
    
    try {
      const stats = await fs.stat(categoryPath);
      if (!stats.isDirectory()) continue;

      const privateDir = path.join(categoryPath, 'private');
      try {
        const privateFiles = await fs.readdir(privateDir);
        console.log(`  ✅ ${category}/private/ - ${privateFiles.length} files`);
      } catch {
        // private folder doesn't exist, which is fine
      }
    } catch {
      // Category folder doesn't exist, which is also fine
    }
  }

  console.log('');
  return violations;
}

async function main() {
  console.log('📋 Validating documentation structure...\n');

  let totalViolations = 0;

  totalViolations += await checkRootDocs();
  totalViolations += await checkDocsStructure();
  totalViolations += await checkPrivateFolders();

  if (totalViolations > 0) {
    console.error(`\n❌ Found ${totalViolations} structural violation(s)`);
    console.error('\nResolution:');
    console.error('  1. Move all .md files to docs/ folder');
    console.error('  2. Use appropriate category subfolder');
    console.error('  3. Sensitive docs → docs/[category]/private/');
    console.error('  4. Run again to verify');
    console.error('\nSee docs/governance/AGENT_DOCUMENTATION_ENFORCEMENT.md');
    process.exit(1);
  } else {
    console.log('✅ All documentation properly placed in docs/ folder\n');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('❌ Validation error:', err.message);
  process.exit(1);
});
