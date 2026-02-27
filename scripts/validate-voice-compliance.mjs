#!/usr/bin/env node
/**
 * Voice Compliance Validation Script
 *
 * Scans all .claude/agents/*.agent.md files for brand voice consistency.
 * Checks:
 * - Presence of "## Voice & Identity" section
 * - Absence of anti-pattern language from brand_voice.anti_patterns
 * - Reports per-agent pass/warn/fail and overall compliance %
 *
 * Usage:
 *   node scripts/validate-voice-compliance.mjs
 *   node scripts/validate-voice-compliance.mjs --threshold 90
 *   node scripts/validate-voice-compliance.mjs --mode warn
 *
 * Exit codes:
 *   0 - All checks passed (or warnings only in warn mode)
 *   1 - Compliance below threshold (in error mode)
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
// Script lives in dcyfr-labs/scripts/
// In monorepo: workspace root is two levels up (.claude/agents/ lives there)
// In isolated CI (Vercel): repo root is one level up (.github/agents/ lives there)
const REPO_ROOT = join(__dirname, '..');
const WORKSPACE_ROOT = join(__dirname, '..', '..');

/**
 * Resolve the agents directory: prefers workspace-level .claude/agents/ (monorepo dev),
 * falls back to repo-level .github/agents/ (Vercel / standalone CI).
 */
function resolveAgentsDir() {
  const candidates = [
    join(WORKSPACE_ROOT, '.claude', 'agents'),
    join(REPO_ROOT, '.claude', 'agents'),
    join(REPO_ROOT, '.github', 'agents'),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

const AGENTS_DIR = resolveAgentsDir();

/**
 * Resolve the DCYFR context file for brand voice anti-patterns.
 */
function resolveContextFile() {
  const candidates = [
    join(WORKSPACE_ROOT, '.github', 'context', 'DCYFR_CONTEXT.json'),
    join(REPO_ROOT, '.github', 'context', 'DCYFR_CONTEXT.json'),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

const CONTEXT_FILE = resolveContextFile();

// Parse CLI arguments
const args = process.argv.slice(2);
const thresholdArg = args.indexOf('--threshold');
const modeArg = args.indexOf('--mode');
const THRESHOLD = thresholdArg !== -1 ? parseInt(args[thresholdArg + 1], 10) : 90;
const GATE_MODE = modeArg !== -1 ? args[modeArg + 1] : 'error'; // 'warn' or 'error'

/**
 * Load brand_voice anti-patterns from DCYFR_CONTEXT.json
 * @returns {string[]}
 */
function loadAntiPatterns() {
  if (!CONTEXT_FILE) {
    console.warn(
      '⚠️  DCYFR_CONTEXT.json not found in any candidate path — anti-pattern checks disabled'
    );
    return [];
  }
  try {
    const context = JSON.parse(readFileSync(CONTEXT_FILE, 'utf8'));
    return context?.brand_voice?.anti_patterns ?? [];
  } catch {
    console.warn('⚠️  Could not load DCYFR_CONTEXT.json — anti-pattern checks disabled');
    return [];
  }
}

/**
 * Rules that check for violating content in agent bodies.
 * Each rule has a pattern (regex) and severity.
 */
const ANTI_PATTERN_VIOLATIONS = [
  // Never use condescending language
  {
    pattern: /\b(obviously|clearly|just|simply|easily)\b/gi,
    message:
      'Potentially condescending language detected — avoid "obviously", "just", "simply", "clearly", "easily"',
    severity: 'warn',
  },
  // Never gatekeep
  {
    pattern: /\b(you should know|as everyone knows|obviously|goes without saying)\b/gi,
    message: 'Potential gatekeeping language detected',
    severity: 'warn',
  },
  // Check for sarcasm indicators
  {
    pattern: /\b(lol|smh|facepalm|seriously though)\b/gi,
    message: 'Potentially sarcastic language detected — maintain professional empathy',
    severity: 'warn',
  },
];

/**
 * @typedef {{ file: string, hasVoiceSection: boolean, violations: Array<{line: number, message: string, severity: string}>, status: 'pass' | 'warn' | 'fail' }} AgentResult
 */

/**
 * Analyze a single agent file
 * @param {string} filepath
 * @param {string} filename
 * @returns {AgentResult}
 */
function analyzeAgent(filepath, filename) {
  const content = readFileSync(filepath, 'utf8');
  const lines = content.split('\n');

  const hasVoiceSection =
    /^## Voice & Identity/m.test(content) || /^## Voice and Identity/m.test(content);

  const violations = [];

  // Only check instruction body (after frontmatter)
  const bodyStart = content.indexOf('\n---\n', content.indexOf('---\n') + 4) + 4;
  const body = bodyStart > 4 ? content.slice(bodyStart) : content;
  const bodyLines = body.split('\n');

  for (const rule of ANTI_PATTERN_VIOLATIONS) {
    bodyLines.forEach((line, idx) => {
      if (rule.pattern.test(line)) {
        violations.push({
          line: idx + 1,
          message: rule.message,
          severity: rule.severity,
          match: line.trim().slice(0, 80),
        });
      }
    });
  }

  const hasErrors = violations.some((v) => v.severity === 'error');
  const hasWarnings = violations.some((v) => v.severity === 'warn');
  const status = !hasVoiceSection ? 'fail' : hasErrors ? 'fail' : hasWarnings ? 'warn' : 'pass';

  return {
    file: filename,
    hasVoiceSection,
    violations,
    status,
  };
}

/**
 * Print the result for a single agent.
 */
function printAgentResult(result) {
  const icon = result.status === 'pass' ? '✅' : result.status === 'warn' ? '⚠️ ' : '❌';
  const voiceIcon = result.hasVoiceSection ? '🗣️' : '  ';
  console.log(`${icon} ${voiceIcon} ${result.file}`);

  if (!result.hasVoiceSection) {
    console.log(`     ↳ Missing "## Voice & Identity" section`);
  }

  for (const v of result.violations) {
    const sevIcon = v.severity === 'error' ? '🔴' : '🟡';
    console.log(`     ${sevIcon} Line ${v.line}: ${v.message}`);
    if (v.match) console.log(`        "${v.match}"`);
  }
}

/**
 * Exit the process based on compliance gate result.
 */
function exitBasedOnCompliance(compliancePercent, results) {
  const msg = `❌ Voice compliance gate FAILED — ${compliancePercent}% < ${THRESHOLD}% threshold`;
  if (compliancePercent >= THRESHOLD) {
    console.log(`\n✅ Voice compliance gate PASSED (${compliancePercent}% ≥ ${THRESHOLD}%)\n`);
    process.exit(0);
  } else if (GATE_MODE === 'warn') {
    console.warn(`\n⚠️  ${msg} (warning mode — not blocking)\n`);
    console.warn('   Agents missing voice sections:');
    results
      .filter((r) => !r.hasVoiceSection)
      .forEach((r) => {
        console.warn(`   - ${r.file}`);
      });
    process.exit(0);
  } else {
    console.error(`\n${msg}\n`);
    console.error('   Agents missing voice sections:');
    results
      .filter((r) => !r.hasVoiceSection)
      .forEach((r) => {
        console.error(`   - ${r.file}`);
      });
    console.error('\n   Add "## Voice & Identity" sections to fix compliance.\n');
    process.exit(1);
  }
}

/**
 * Run the compliance check
 */
function run() {
  const antiPatterns = loadAntiPatterns();

  // Discover agent files
  if (!AGENTS_DIR) {
    console.warn(
      '⚠️  No agents directory found in any candidate path — voice compliance check skipped'
    );
    console.warn('   Checked: workspace/.claude/agents, repo/.claude/agents, repo/.github/agents');
    process.exit(0);
  }

  let agentFiles;
  try {
    agentFiles = readdirSync(AGENTS_DIR)
      .filter((f) => f.endsWith('.agent.md'))
      .sort();
  } catch {
    console.error(`❌ Could not read agents directory: ${AGENTS_DIR}`);
    process.exit(1);
  }

  if (agentFiles.length === 0) {
    console.warn('⚠️  No agent files found in .claude/agents/');
    process.exit(0);
  }

  console.log(`\n🔍 DCYFR Voice Compliance Check`);
  console.log(`${'─'.repeat(60)}`);
  console.log(`Scanning ${agentFiles.length} agents in ${AGENTS_DIR}`);
  console.log(`Threshold: ${THRESHOLD}%  |  Mode: ${GATE_MODE}`);
  console.log(`Brand anti-patterns loaded: ${antiPatterns.length}`);
  console.log(`${'─'.repeat(60)}\n`);

  const results = agentFiles.map((filename) => {
    const filepath = join(AGENTS_DIR, filename);
    return analyzeAgent(filepath, filename);
  });

  // Print per-agent results
  for (const result of results) {
    printAgentResult(result);
  }

  // Calculate compliance
  const passing = results.filter((r) => r.status === 'pass' || r.status === 'warn').length;
  const failing = results.filter((r) => r.status === 'fail').length;
  const withVoice = results.filter((r) => r.hasVoiceSection).length;
  const compliancePercent = Math.round((withVoice / agentFiles.length) * 100);

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`📊 Results:`);
  console.log(`   Total agents:     ${agentFiles.length}`);
  console.log(`   With voice section: ${withVoice} / ${agentFiles.length}`);
  console.log(`   Passing:          ${passing}`);
  console.log(`   Failing:          ${failing}`);
  console.log(`   Compliance:       ${compliancePercent}%  (threshold: ${THRESHOLD}%)`);

  exitBasedOnCompliance(compliancePercent, results);
}

run();
