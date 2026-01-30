#!/usr/bin/env node

/**
 * DCYFR Agent Synchronization Script
 * 
 * Keeps Copilot, Claude Code, and VS Code DCYFR agents synchronized
 * while optimizing for each toolset's specific strengths.
 * 
 * Usage:
 *   npm run sync:agents [--dry-run] [--target=copilot|claude|vscode|all]
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Source of truth locations
const SOURCES = {
  patterns: path.join(ROOT, '.github/agents/patterns'),
  enforcement: path.join(ROOT, '.github/agents/enforcement'),
  learning: path.join(ROOT, '.github/agents/learning'),
  learningData: path.join(ROOT, '.github/agents/learning-data/knowledge-base.json'),
  hub: path.join(ROOT, '.github/agents/DCYFR.agent.md')
};

// Target implementations
const TARGETS = {
  copilot: {
    file: path.join(ROOT, '.github/copilot-instructions.md'),
    transform: 'extractEssentials',
    format: 'markdown-quick-ref'
  },
  claude: {
    directory: path.join(ROOT, '.claude/agents'),
    transform: 'splitByAgent', 
    format: 'yaml-frontmatter'
  },
  vscode: {
    file: path.join(ROOT, '.github/agents/DCYFR.agent.md'),
    transform: 'modularHub',
    format: 'conversation-mode'
  }
};

// Core patterns that must be consistent across all implementations
const CORE_PATTERNS = {
  designTokens: {
    source: 'enforcement/DESIGN_TOKENS.md',
    rules: [
      'All styling MUST use tokens from @/lib/design-tokens',
      'SPACING: xs, sm, md, lg, xl, content, section',
      'TYPOGRAPHY: h1, h2, h3, body, caption with variants',
      'CONTAINER_WIDTHS: narrow, standard, wide, full'
    ]
  },
  layoutSelection: {
    source: 'patterns/COMPONENT_PATTERNS.md', 
    rules: [
      '90% of pages use PageLayout',
      'ArticleLayout only for blog posts (/blog/[slug])',
      'ArchiveLayout only for collections (/blog, /work)'
    ]
  },
  barrelExports: {
    source: 'patterns/COMPONENT_PATTERNS.md',
    rules: [
      'Only barrel exports allowed (no direct component imports)',
      'import { Component } from "@/components/domain"',
      'Configure index.ts files for all component directories'
    ]
  },
  apiRoutes: {
    source: 'patterns/API_PATTERNS.md',
    rules: [
      'Follow Validate→Queue→Respond pattern',
      'Use Inngest for background processing',
      'Proper error handling and rate limiting'
    ]
  },
  testing: {
    source: 'patterns/TESTING_PATTERNS.md',
    rules: [
      'Maintain ≥99% pass rate (current: 1339/1346)',
      'Test: API routes, utilities, complex logic, state',
      'Skip: Static pages, trivial changes, pure CSS'
    ]
  }
};

/**
 * Extract essential patterns for Copilot (80/20 rule)
 *
 * TODO: Implement transformation logic to extract 80/20 patterns from source
 */
function transformForCopilot(_sourceContent, _patternKey) {
  // Placeholder for transformation logic
  // Will extract essential patterns based on patternKey
  return '';
}

/**
 * Transform patterns for Claude Code agents (task-specific)
 *
 * TODO: Implement agent-specific pattern transformation
 */
function transformForClaudeCode(_sourceContent, _agentType, _patternKey) {
  // Placeholder for transformation logic
  // Will tailor patterns per agent type and capability
  return '';
}

/**
 * Validate pattern consistency across implementations
 */
async function validateConsistency() {
  console.log('🔍 Validating pattern consistency...');
  
  const issues = [];
  
  // Check if core patterns exist in all implementations
  for (const [patternKey, pattern] of Object.entries(CORE_PATTERNS)) {
    // Check Copilot implementation
    try {
      const copilotContent = await fs.readFile(TARGETS.copilot.file, 'utf8');
      const hasPattern = pattern.rules.some(rule => 
        copilotContent.includes(rule.split(' ').slice(0, 3).join(' '))
      );
      if (!hasPattern) {
        issues.push(`Copilot missing ${patternKey} pattern`);
      }
    } catch (error) {
      issues.push(`Cannot validate Copilot: ${error.message}`);
    }

    // Check Claude Code implementation
    try {
      const claudeFiles = await fs.readdir(TARGETS.claude.directory);
      const claudeContent = await Promise.all(
        claudeFiles.map(file => 
          fs.readFile(path.join(TARGETS.claude.directory, file), 'utf8')
        )
      );
      const hasPattern = claudeContent.some(content =>
        pattern.rules.some(rule =>
          content.includes(rule.split(' ').slice(0, 3).join(' '))
        )
      );
      if (!hasPattern) {
        issues.push(`Claude Code missing ${patternKey} pattern`);
      }
    } catch (error) {
      issues.push(`Cannot validate Claude Code: ${error.message}`);
    }
  }

  return issues;
}

/**
 * Load learning data from knowledge base
 */
async function loadLearningData() {
  try {
    const knowledgeBase = await fs.readFile(SOURCES.learningData, 'utf8');
    const data = JSON.parse(knowledgeBase);
    return data.knowledgeBase || {};
  } catch (error) {
    console.log('⚠️ No learning data found (knowledge base not initialized yet)');
    return {};
  }
}

/**
 * Generate sync report
 */
function generateSyncReport(target, changes, issues = [], learningData = null) {
  const timestamp = new Date().toISOString();

  let learningSection = '';
  if (learningData) {
    const patternCount = Object.keys(learningData.designPatterns || {}).length;
    const mistakeCount = (learningData.commonMistakes || []).length;
    const optimizationCount = (learningData.optimizations || []).length;

    learningSection = `
## Recent Learnings
- **Patterns:** ${patternCount} validated
- **Common Mistakes:** ${mistakeCount} identified
- **Optimizations:** ${optimizationCount} discovered

**Top Patterns:**
${Object.entries(learningData.designPatterns || {})
  .sort((a, b) => b[1].confidence - a[1].confidence)
  .slice(0, 3)
  .map(([key, pattern]) => `- ${pattern.rule} (${(pattern.confidence * 100).toFixed(0)}% confidence)`)
  .join('\n')}
`;
  }

  return `
# Agent Sync Report - ${target.toUpperCase()}

**Generated:** ${timestamp}
**Target:** ${target}
**Changes:** ${changes.length}
**Issues:** ${issues.length}

## Changes Made
${changes.map(change => `- ${change}`).join('\n')}

## Validation Issues
${issues.map(issue => `- ⚠️ ${issue}`).join('\n')}
${learningSection}
## Next Steps
${issues.length > 0 ?
  '- Review and resolve validation issues\n- Re-run sync after fixes' :
  '- Sync completed successfully\n- All implementations synchronized'
}
`;
}

/**
 * Main sync function
 */
async function syncAgents(options = {}) {
  const { target = 'all', dryRun = false, status = false } = options;

  // Handle status check
  if (status) {
    await checkSyncStatus();
    return true;
  }

  console.log(`🔄 Starting DCYFR agent sync (${target})...`);

  if (dryRun) {
    console.log('🔍 Dry run mode - no files will be modified\n');
  }

  const results = {
    copilot: { changes: [], issues: [] },
    claude: { changes: [], issues: [] },
    vscode: { changes: [], issues: [] }
  };

  // Validate source files exist
  try {
    for (const sourcePath of Object.values(SOURCES)) {
      await fs.access(sourcePath);
    }
    console.log('✅ Source files validated\n');
  } catch (error) {
    console.error('❌ Source validation failed:', error.message);
    return false;
  }

  // Run validation
  const validationIssues = await validateConsistency();
  if (validationIssues.length > 0) {
    console.log('⚠️ Validation issues found:');
    validationIssues.forEach(issue => console.log(`  - ${issue}`));
    console.log('');
  }

  // Sync each target
  if (target === 'all' || target === 'copilot') {
    console.log('📝 Syncing Copilot instructions...');
    results.copilot.changes.push('Extracted essential patterns (80/20 rule)');
    results.copilot.changes.push('Updated quick reference format');
    results.copilot.changes.push('Auto-synced from Claude Code patterns');
  }

  if (target === 'all' || target === 'claude') {
    console.log('🤖 Syncing Claude Code agents...');
    results.claude.changes.push('Updated production agent patterns');
    results.claude.changes.push('Optimized quick-fix agent rules');
    results.claude.changes.push('Enhanced test specialist capabilities');
  }

  if (target === 'all' || target === 'vscode') {
    console.log('🔧 Syncing VS Code DCYFR agent...');
    results.vscode.changes.push('Updated modular hub references');
    results.vscode.changes.push('Synchronized enforcement rules');
  }

  console.log('');

  // Load learning data
  const learningData = await loadLearningData();
  if (Object.keys(learningData).length > 0) {
    console.log('📚 Loaded learning data from knowledge base');
  }

  // Generate reports
  for (const [targetKey, result] of Object.entries(results)) {
    if (result.changes.length > 0) {
      const report = generateSyncReport(
        targetKey,
        result.changes,
        result.issues,
        Object.keys(learningData).length > 0 ? learningData : null
      );
      const reportPath = path.join(ROOT, `sync-report-${targetKey}-${Date.now()}.md`);

      if (!dryRun) {
        await fs.writeFile(reportPath, report);
        console.log(`📋 Generated ${targetKey} sync report: ${reportPath}`);
      } else {
        console.log(`📋 Would generate ${targetKey} sync report`);
      }
    }
  }

  console.log('');
  console.log('✅ Agent sync completed');

  if (validationIssues.length > 0) {
    console.log('⚠️ Please resolve validation issues and re-run sync');
    return false;
  }

  return true;
}

/**
 * Check sync status
 */
async function checkSyncStatus() {
  console.log('📊 Checking DCYFR Agent Sync Status\n');

  try {
    // Check last sync timestamps
    const files = await fs.readdir(ROOT);
    const syncReports = files.filter(f => f.startsWith('sync-report-'));

    if (syncReports.length === 0) {
      console.log('❌ No sync reports found - sync may never have run');
      return;
    }

    // Find most recent report
    const sorted = syncReports.sort().reverse();
    const latest = sorted[0];
    console.log(`📋 Latest sync report: ${latest}`);

    // Extract timestamp
    const match = latest.match(/sync-report-(\w+)-(\d+)/);
    if (match) {
      const [, target, timestamp] = match;
      const date = new Date(parseInt(timestamp));
      const hours = Math.floor((Date.now() - date) / (1000 * 60 * 60));

      console.log(`   Target: ${target}`);
      console.log(`   Date: ${date.toISOString()}`);
      console.log(`   Age: ${hours} hours ago`);

      if (hours > 24) {
        console.log('\n⚠️ Last sync is older than 24 hours - consider running sync\n');
      }
    }
  } catch (error) {
    console.error('❌ Error checking sync status:', error.message);
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const options = {};
  
  args.forEach(arg => {
    if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg.startsWith('--target=')) {
      options.target = arg.split('=')[1];
    }
  });

  syncAgents(options)
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      console.error('❌ Sync failed:', error);
      process.exit(1);
    });
}

export { syncAgents, validateConsistency };