#!/usr/bin/env node
/**
 * Agent Delegation Middleware
 *
 * Automatically delegates tasks to specialist agents based on file patterns,
 * content analysis, and declared triggers in .claude/agents/DCYFR.md.
 *
 * Usage:
 *   Called automatically by Claude Code PreToolUse hooks
 *   node scripts/agent-delegation-middleware.mjs --file=<path> --operation=<type> --agent=<name>
 *
 * @see .claude/agents/DCYFR.md delegate_to array
 * @see docs/ai/agent-compliance-remediation-plan.md Phase 2
 */

import fs from 'node:fs';

// Parse CLI args
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, val] = arg.replace(/^--/, '').split('=');
  acc[key] = val || true;
  return acc;
}, {});

const file = args.file || '';
const operation = args.operation || 'write'; // write|edit|read
const agent = args.agent || 'unknown';
const jsonOutput = args.json === 'true' || args.json === true;

if (!file) {
  console.error('❌ Usage: --file=<path> [--operation=write|edit|read] [--agent=<name>] [--json]');
  process.exit(1);
}

// Delegation patterns (from .claude/agents/DCYFR.md)
const DELEGATION_PATTERNS = {
  'test-specialist': {
    name: 'Test Specialist',
    triggers: [
      { type: 'file_pattern', pattern: /\.(test|spec)\.(ts|tsx|js|jsx)$/ },
      { type: 'file_pattern', pattern: /^tests\// },
      { type: 'file_pattern', pattern: /^e2e\// },
      { type: 'operation', value: 'test_coverage' },
      { type: 'operation', value: 'test_fix' },
    ],
    command: 'claude-code --agent=test-specialist',
    description: 'Test coverage maintenance and quality assurance',
  },

  'quick-fix': {
    name: 'Quick Fix',
    triggers: [
      { type: 'operation', value: 'design_token_fix' },
      { type: 'operation', value: 'import_fix' },
      { type: 'operation', value: 'formatting' },
      { type: 'file_size', max: 200 }, // Small files only
    ],
    command: 'claude-code --agent=quick-fix --model=haiku',
    description: 'Fast pattern fixes and token compliance',
  },

  'frontend-developer': {
    name: 'Frontend Developer',
    triggers: [
      { type: 'file_pattern', pattern: /src\/components\/.*\.(tsx|jsx)$/ },
      { type: 'file_pattern', pattern: /src\/app\/.*\/page\.tsx$/ },
      { type: 'operation', value: 'ui_component' },
      { type: 'operation', value: 'responsive_design' },
    ],
    command: 'claude-code --agent=frontend-developer',
    description: 'React UI components, responsive design, accessibility',
  },

  'typescript-pro': {
    name: 'TypeScript Pro',
    triggers: [
      { type: 'file_pattern', pattern: /\.(ts|tsx)$/ },
      { type: 'operation', value: 'type_definitions' },
      { type: 'operation', value: 'generics' },
      { type: 'content', keyword: 'type' },
      { type: 'content', keyword: 'interface' },
    ],
    command: 'claude-code --agent=typescript-pro',
    description: 'Advanced type system, generic constraints, strict typing',
  },

  'accessibility-specialist': {
    name: 'Accessibility Specialist',
    triggers: [
      { type: 'operation', value: 'accessibility' },
      { type: 'operation', value: 'a11y' },
      { type: 'content', keyword: 'aria-' },
      { type: 'content', keyword: 'role=' },
    ],
    command: 'claude-code --agent=accessibility-specialist',
    description: 'WCAG 2.1 AA compliance, focus states, screen readers',
  },
};

// Match file/operation against delegation patterns
function shouldDelegate(file, operation, content = '') {
  const matches = [];

  for (const [agentKey, config] of Object.entries(DELEGATION_PATTERNS)) {
    const triggerMatches = config.triggers.filter((trigger) => {
      switch (trigger.type) {
        case 'file_pattern':
          return trigger.pattern.test(file);

        case 'operation':
          return operation === trigger.value;

        case 'file_size':
          try {
            const stats = fs.statSync(file);
            return stats.size <= trigger.max * 1024; // KB to bytes
          } catch {
            return false;
          }

        case 'content':
          return content.includes(trigger.keyword);

        default:
          return false;
      }
    });

    if (triggerMatches.length > 0) {
      matches.push({
        agent: agentKey,
        name: config.name,
        command: config.command,
        description: config.description,
        matchedTriggers: triggerMatches.length,
        confidence: triggerMatches.length / config.triggers.length,
      });
    }
  }

  // Sort by confidence (most triggers matched)
  matches.sort((a, b) => b.confidence - a.confidence);

  return matches;
}

// Main execution
const content = file && fs.existsSync(file) ? fs.readFileSync(file, 'utf-8') : '';
const delegationMatches = shouldDelegate(file, operation, content);

if (jsonOutput) {
  console.log(
    JSON.stringify(
      {
        file,
        operation,
        agent,
        delegationMatches,
        shouldDelegate: delegationMatches.length > 0,
        recommendation: delegationMatches[0] || null,
      },
      null,
      2
    )
  );
} else {
  console.log(`🤖 Agent Delegation Analysis`);
  console.log(`   File: ${file}`);
  console.log(`   Operation: ${operation}`);
  console.log(`   Current Agent: ${agent}`);
  console.log('');

  if (delegationMatches.length === 0) {
    console.log('✅ No delegation needed - continue with current agent');
  } else {
    console.log(`💡 Delegation Recommended (${delegationMatches.length} matches):\n`);

    delegationMatches.forEach((match, idx) => {
      console.log(`${idx + 1}. ${match.name} (${Math.round(match.confidence * 100)}% confidence)`);
      console.log(`   Command: ${match.command}`);
      console.log(`   Reason: ${match.description}`);
      console.log(`   Triggers matched: ${match.matchedTriggers}`);
      console.log('');
    });

    const top = delegationMatches[0];
    if (top.confidence >= 0.5) {
      console.log(`🎯 Recommended Action:`);
      console.log(`   Delegate to: ${top.name}`);
      console.log(`   Command: ${top.command}`);
      console.log(`   Confidence: ${Math.round(top.confidence * 100)}%`);
    } else {
      console.log(`⚠️  Low confidence - manual agent selection recommended`);
    }
  }
}

// Exit code: 0 = no delegation, 1 = delegation recommended
process.exit(delegationMatches.length > 0 && delegationMatches[0].confidence >= 0.5 ? 1 : 0);
