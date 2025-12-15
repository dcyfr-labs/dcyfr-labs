#!/usr/bin/env node

/**
 * Validates instruction file consistency and completeness
 * Run: node scripts/validate-instructions.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Heuristically locate the repository root (the directory containing AGENTS.md or package.json).
// This ensures the script works whether it's executed from scripts/, scripts/validation/, or
// a temporary test directory where the file layout may differ.
let rootDir = path.resolve(__dirname);
for (let i = 0; i < 6; i++) {
  if (fs.existsSync(path.join(rootDir, 'AGENTS.md')) || fs.existsSync(path.join(rootDir, 'package.json'))) {
    break;
  }
  const parent = path.dirname(rootDir);
  if (parent === rootDir) break;
  rootDir = parent;
}

// Allow overriding files to ignore via environment variable for CI/preview branches
const envHasIgnoredVar = Object.prototype.hasOwnProperty.call(process.env, 'IGNORED_INSTRUCTION_FILES');
let IGNORED_INSTRUCTION_FILES = (process.env.IGNORED_INSTRUCTION_FILES || '').split(',').map((p) => p.trim()).filter(Boolean);

// Also allow repo-level default list via .github/agents/instructions/INSTRUCTIONS_CONFIG.json
try {
  const configFile = path.join(rootDir, '.github/agents/instructions/INSTRUCTIONS_CONFIG.json');
  if (fs.existsSync(configFile)) {
    const json = JSON.parse(fs.readFileSync(configFile, 'utf-8')) || {};
    const defaults = json.ignoredInstructionFiles || [];
    // If an env var is provided (even if empty), it takes precedence; otherwise fall back to defaults.
    if (!envHasIgnoredVar) {
      IGNORED_INSTRUCTION_FILES = defaults.slice();
    }
  }
} catch (e) {
  // ignore config parse errors; env var will still work but log a warning for maintainers
  log(`  ⚠️  Could not parse INSTRUCTIONS_CONFIG.json - ignoring defaults: ${e.message}`, 'yellow');
}

// Define all instruction files and their required sections
const INSTRUCTION_FILES = {
  hub: {
    path: 'AGENTS.md',
    type: 'hub',
    requiredSections: [
      '🎯 Quick Navigation',
      '📋 Instruction Files Registry',
      '🔄 Agent Selection Logic',
      '🔗 Instruction File Relationships',
      '📊 Instruction File Comparison',
      '🔄 Synchronization & Maintenance',
    ],
    requiredLinks: [
      '.github/copilot-instructions.md',
      'CLAUDE.md',
      '.github/agents/DCYFR.agent.md',
    ],
    description: 'Central hub for all AI agents and instructions',
  },

  claude: {
    path: 'CLAUDE.md',
    type: 'claude',
    requiredSections: [
      'Current Focus',
      'Quick Reference',
      'Essential Patterns',
      'Design System Rules',
      'Key Constraints',
      'Workflow Guidelines',
    ],
    requiredKeywords: [
      'PageLayout',
      'design tokens',
      'Next.js',
      'mdx',
    ],
    description: 'General Claude instructions and project context',
  },

  copilot: {
    path: '.github/copilot-instructions.md',
    type: 'copilot',
    requiredSections: [
      'Quick Reference',
      'Essential Commands',
      'Quick Start',
      'Component Patterns',
      'Decision Trees',
    ],
    requiredLinks: [
      'docs/ai/quick-reference.md',
      'docs/ai/component-patterns.md',
      'docs/templates/',
    ],
    description: 'GitHub Copilot quick reference instructions',
  },

  dcyfr: {
    path: '.github/agents/DCYFR.agent.md',
    type: 'agent',
    requiredSections: [
      'What This Agent Does',
      'When to Use This Agent',
      'Boundaries & Rules',
      'Workflow Examples',
      'Expected Outputs',
    ],
    requiredKeywords: [
      'mandatory',
      'design tokens',
      'test',
      'validation',
      'decision tree',
    ],
    description: 'DCYFR specialized agent instructions',
  },
};

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filename, config) {
  const filepath = path.join(rootDir, config.path);

  // Check file exists (optional files are allowed to be missing)
  if (!fs.existsSync(filepath)) {
    const ignored = IGNORED_INSTRUCTION_FILES.includes(config.path);
    if (config.optional || ignored) {
      log(`  ⚠️  Optional/ignored file missing (ok): ${config.path}`, 'yellow');
      return true;
    }
    log(`  ❌ File not found: ${config.path}`, 'red');
    return false;
  }

  const content = fs.readFileSync(filepath, 'utf-8');
  let fileValid = true;

  // Check required sections
  if (config.requiredSections) {
    for (const section of config.requiredSections) {
      if (!content.includes(section)) {
        log(`  ❌ Missing section: "${section}"`, 'red');
        fileValid = false;
      }
    }
  }

  // Check required keywords
  if (config.requiredKeywords) {
    for (const keyword of config.requiredKeywords) {
      if (!content.toLowerCase().includes(keyword.toLowerCase())) {
        log(`  ⚠️  Missing keyword: "${keyword}"`, 'yellow');
      }
    }
  }

  // Check required links
  if (config.requiredLinks) {
    for (const link of config.requiredLinks) {
      // Skip checking links that are optional or explicitly ignored
      const linkConfig = Object.values(INSTRUCTION_FILES).find((c) => c.path === link);
      const isIgnored = IGNORED_INSTRUCTION_FILES.includes(link);
      if (linkConfig && (linkConfig.optional || isIgnored)) {
        // intentionally ignored link - skip
        continue;
      }
      // Check for markdown link format with this path
      if (!content.includes(link)) {
        log(`  ⚠️  Missing link to: "${link}"`, 'yellow');
      }
    }
  }

  if (fileValid) {
    log(`  ✅ ${config.description}`, 'green');
  }

  return fileValid;
}

function validateRelationships() {
  log('\n📊 Checking file relationships...', 'blue');

  const agentsPath = path.join(rootDir, 'AGENTS.md');
  const agentsContent = fs.readFileSync(agentsPath, 'utf-8');

  let relationshipsValid = true;

  // Verify all files mentioned in AGENTS.md actually exist
  // Build the list of file references from INSTRUCTION_FILES but filter out optional ones
  const fileReferences = [];
  for (const config of Object.values(INSTRUCTION_FILES)) {
    // Skip optional or explicitly ignored files
    if (config.path && !config.optional && !IGNORED_INSTRUCTION_FILES.includes(config.path)) {
      fileReferences.push(config.path);
    }
  }

  for (const fileRef of fileReferences) {
    const fullPath = path.join(rootDir, fileRef);
    if (!fs.existsSync(fullPath)) {
      log(`  ❌ AGENTS.md references non-existent file: ${fileRef}`, 'red');
      relationshipsValid = false;
    } else {
      log(`  ✅ File exists: ${fileRef}`, 'green');
    }
  }

  return relationshipsValid;
}

function validateMetadata() {
  log('\n📋 Checking metadata consistency...', 'blue');

  const agentsPath = path.join(rootDir, 'AGENTS.md');
  const agentsContent = fs.readFileSync(agentsPath, 'utf-8');

  let metadataValid = true;

  // Check that each file has a metadata section in AGENTS.md
  // Build metadata checks from INSTRUCTION_FILES, ignoring optional ones
  const requiredMetadata = [];
  for (const config of Object.values(INSTRUCTION_FILES)) {
    const filename = path.basename(config.path);
    if (!config.optional && !IGNORED_INSTRUCTION_FILES.includes(config.path)) {
      requiredMetadata.push({ file: filename, type: config.type });
    }
  }

  for (const item of requiredMetadata) {
    if (!agentsContent.includes(item.file)) {
      log(`  ❌ Missing metadata reference for: ${item.file}`, 'red');
      metadataValid = false;
    } else {
      log(`  ✅ Metadata documented: ${item.file}`, 'green');
    }
  }

  return metadataValid;
}

function validateDecisionTree() {
  log('\n🌳 Checking decision tree validity...', 'blue');

  const agentsPath = path.join(rootDir, 'AGENTS.md');
  const agentsContent = fs.readFileSync(agentsPath, 'utf-8');

  let decisionTreeValid = true;

  // Extract decision tree section
  const decisionStart = agentsContent.indexOf('### Decision Tree:');
  const decisionEnd = agentsContent.indexOf('### Quick Rules');

  if (decisionStart === -1) {
    log(`  ❌ Decision tree not found in AGENTS.md`, 'red');
    decisionTreeValid = false;
  } else {
    const decisionTree = agentsContent.substring(decisionStart, decisionEnd);

    // Verify all referenced instructions are real
    const instructionRefs = ['GitHub Copilot', 'Claude', 'DCYFR'];
    for (const ref of instructionRefs) {
      if (!decisionTree.includes(ref)) {
        log(`  ⚠️  Decision tree missing reference to: ${ref}`, 'yellow');
      } else {
        log(`  ✅ Decision tree includes: ${ref}`, 'green');
      }
    }
  }

  return decisionTreeValid;
}

function main() {
  log('\n🔍 Validating instruction file system...\n', 'blue');

  let allValid = true;

  // Check each instruction file
  for (const [key, config] of Object.entries(INSTRUCTION_FILES)) {
    log(`Validating ${config.type.toUpperCase()}: ${config.path}`, 'blue');
    if (!checkFile(key, config)) {
      allValid = false;
    }
  }

  // Check relationships
  if (!validateRelationships()) {
    allValid = false;
  }

  // Check metadata
  if (!validateMetadata()) {
    allValid = false;
  }

  // Check decision tree
  if (!validateDecisionTree()) {
    allValid = false;
  }

  // Summary
  log('\n' + '='.repeat(50), 'gray');
  if (allValid) {
    log('✅ All instruction files are valid!', 'green');
    log('\n📝 Next steps:', 'blue');
    log('  • Review decision tree logic manually');
    log('  • Check for broken links (npm run validate-links)');
    log('  • Verify sync status in AGENTS.md');
    process.exit(0);
  } else {
    log('❌ Some instruction files have issues', 'red');
    log('\n📝 Next steps:', 'blue');
    log('  • Fix the errors listed above');
    log('  • Re-run this validation script');
    log('  • See AGENT_MANAGEMENT.md for guidance');
    process.exit(1);
  }
}

main();
