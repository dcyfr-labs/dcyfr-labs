import { spawnSync } from 'child_process';
import { mkdtempSync, cpSync, rmSync } from 'fs';
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
    cpSync(src, dest, { recursive: true });
  }
  // Copy the instructions config so the script knows to ignore DCYFR
  try {
    cpSync(join(process.cwd(), '.github/agents/instructions/INSTRUCTIONS_CONFIG.json'), join(tempRoot, '.github/agents/instructions/INSTRUCTIONS_CONFIG.json'), { recursive: true });
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
