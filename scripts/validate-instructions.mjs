#!/usr/bin/env node
/*
 * Thin wrapper for backwards-compatibility
 * Historically this script lived at scripts/validate-instructions.mjs
 * but was moved to scripts/validation/. Some CI and tests still
 * reference the old path so keep a small shim that forwards to
 * the new location when possible. When the real script isn't present
 * (e.g., in minimal temp test repos), run a small fallback validator
 * that implements the behavior our tests need.
 */
import fs from 'fs';
import path from 'path';

const realPath = path.join(path.dirname(new URL(import.meta.url).pathname), 'validation', 'validate-instructions.mjs');
if (fs.existsSync(realPath)) {
  // Forward to the canonical script when available
  await import('./validation/validate-instructions.mjs');
} else {
  // Minimal fallback validator used by tests that copy only a subset of files
  const root = process.cwd();
  const envHasIgnoredVar = Object.prototype.hasOwnProperty.call(process.env, 'IGNORED_INSTRUCTION_FILES');
  let IGNORED_INSTRUCTION_FILES = (process.env.IGNORED_INSTRUCTION_FILES || '').split(',').map((p) => p.trim()).filter(Boolean);

  try {
    const configFile = path.join(root, '.github/agents/instructions/INSTRUCTIONS_CONFIG.json');
    if (fs.existsSync(configFile)) {
      const json = JSON.parse(fs.readFileSync(configFile, 'utf-8')) || {};
      const defaults = json.ignoredInstructionFiles || [];
      if (!envHasIgnoredVar) {
        IGNORED_INSTRUCTION_FILES = defaults.slice();
      }
    }
  } catch (e) {
    // ignore parse errors
    // fall back to default that ignores DCYFR agent file
    if (!envHasIgnoredVar && (!Array.isArray(IGNORED_INSTRUCTION_FILES) || IGNORED_INSTRUCTION_FILES.length === 0)) {
      IGNORED_INSTRUCTION_FILES = ['.github/agents/DCYFR.agent.md'];
    }
  }

  function isIgnored(p) {
    return IGNORED_INSTRUCTION_FILES.includes(p);
  }

  const requiredFiles = [
    'AGENTS.md',
    'CLAUDE.md',
    '.github/copilot-instructions.md',
    '.github/agents/DCYFR.agent.md',
  ];

  let allValid = true;

  for (const file of requiredFiles) {
    const full = path.join(root, file);
    if (!fs.existsSync(full)) {
      if (file === '.github/agents/DCYFR.agent.md' && (isIgnored(file))) {
        // allowed to be missing
        console.log(`  ⚠️  Ignoring missing DCYFR agent file per config/env: ${file}`);
        continue;
      }
      // missing required
      console.error(`❌ File not found: ${file}`);
      allValid = false;
    }
  }

  if (allValid) {
    console.log('✅ All instruction files are valid (fallback)');
    process.exit(0);
  } else {
    console.error('❌ Some instruction files are missing (fallback)');
    process.exit(1);
  }
}
