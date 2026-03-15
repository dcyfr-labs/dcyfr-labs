/**
 * Emoji Usage Validation Module
 *
 * Delegates to legacy validate-emojis.mjs until full migration.
 * Part of the unified validation framework.
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..', '..');

export default async function validateEmojis(_options = {}) {
  try {
    execSync('node scripts/validate-emojis.mjs', {
      stdio: 'pipe',
      cwd: projectRoot,
    });
    return { success: true, message: 'Emoji validation passed' };
  } catch (error) {
    const output = error.stdout?.toString() || error.message;
    return {
      success: false,
      message: 'Emoji validation failed',
      details: output.split('\n').filter(Boolean),
    };
  }
}
