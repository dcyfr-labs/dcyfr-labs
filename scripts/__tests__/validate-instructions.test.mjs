import { spawnSync } from 'child_process';
import { mkdtempSync, cpSync, rmSync, mkdirSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import assert from 'assert';

// Creates a minimal copy of the repo files we need and runs the validation
function runValidationWithFiles(filesToCopy = []) {
  const tempRoot = mkdtempSync(join(tmpdir(), 'ai-instructions-'));
  // Copy files
  for (const file of filesToCopy) {
    const src = join(process.cwd(), file);
    const dest = join(tempRoot, file);
    // ensure parent dirs
    const dir = join(dest, '..');
    try { mkdirSync(dir, { recursive: true }); } catch {}
    cpSync(src, dest, { recursive: true });
  }
  // Copy the instructions config so the script knows to ignore DCYFR
  try {
    const destDir = join(tempRoot, '.github/agents/instructions');
    mkdirSync(destDir, { recursive: true });
    cpSync(join(process.cwd(), '.github/agents/instructions/INSTRUCTIONS_CONFIG.json'), join(destDir, 'INSTRUCTIONS_CONFIG.json'));
  } catch {}
  // Copy the script as well
  cpSync(join(process.cwd(), 'scripts/validate-instructions.mjs'), join(tempRoot, 'scripts/validate-instructions.mjs'));

  // Run the script
  const result = spawnSync('node', ['scripts/validate-instructions.mjs'], { cwd: tempRoot, env: { ...process.env } });
  // Clean up
  try { rmSync(tempRoot, { recursive: true }); } catch {}
  return result;
}

test('validate-instructions allows missing DCYFR agent file', () => {
  const files = ['AGENTS.md', 'CLAUDE.md', '.github/copilot-instructions.md'];
  const result = runValidationWithFiles(files);
  assert.strictEqual(result.status, 0, `Expected validation to pass when DCYFR file is missing, but got status ${result.status} and stderr: ${result.stderr?.toString()}`);
});

test('validate-instructions fails when required file is missing', () => {
  // Copy AGENTS and CLAUDE but omit copilot
  const files = ['AGENTS.md', 'CLAUDE.md'];
  const result = runValidationWithFiles(files);
  assert.notStrictEqual(result.status, 0, 'Expected validation to fail when a required instruction file is missing');
});

test('env var overrides config default', () => {
  const tempRoot = mkdtempSync(join(tmpdir(), 'ai-instructions-'));
  // prepare files
  const files = ['AGENTS.md', 'CLAUDE.md', '.github/copilot-instructions.md'];
  for (const file of files) {
    const src = join(process.cwd(), file);
    const dest = join(tempRoot, file);
    const dir = join(dest, '..');
    try { mkdirSync(dir, { recursive: true }); } catch {}
    cpSync(src, dest, { recursive: true });
  }
  // copy config, then set env var to override to something else
  const destDir = join(tempRoot, '.github/agents/instructions');
  mkdirSync(destDir, { recursive: true });
  cpSync(join(process.cwd(), '.github/agents/instructions/INSTRUCTIONS_CONFIG.json'), join(destDir, 'INSTRUCTIONS_CONFIG.json'));

  // Ensure the validation script is present in the temp repo (mirrors runValidationWithFiles)
  cpSync(join(process.cwd(), 'scripts/validate-instructions.mjs'), join(tempRoot, 'scripts/validate-instructions.mjs'));

  // run validation with env var overriding to ignore nothing
  const result1 = spawnSync('node', ['scripts/validate-instructions.mjs'], { cwd: tempRoot, env: { ...process.env, IGNORED_INSTRUCTION_FILES: '' } });
  // It should fail (since DCYFR agent is missing and not ignored)
  assert.notStrictEqual(result1.status, 0, 'Expected failure when no ignored files set');

  // Now run with env var set to skip DCYFR file
  const result2 = spawnSync('node', ['scripts/validate-instructions.mjs'], { cwd: tempRoot, env: { ...process.env, IGNORED_INSTRUCTION_FILES: '.github/agents/DCYFR.agent.md' } });
  assert.strictEqual(result2.status, 0, 'Expected validation to pass when IGNORED_INSTRUCTION_FILES env var skips DCYFR');
  try { rmSync(tempRoot, { recursive: true }); } catch {}
});
