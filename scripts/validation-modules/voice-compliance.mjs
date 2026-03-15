/**
 * Voice Compliance Validation Module
 *
 * Delegates to legacy validate-voice-compliance.mjs until full migration.
 * Part of the unified validation framework.
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..', '..');

export default async function validateVoiceCompliance(_options = {}) {
  try {
    execSync('node scripts/validate-voice-compliance.mjs', {
      stdio: 'pipe',
      cwd: projectRoot,
    });
    return { success: true, message: 'Voice compliance passed' };
  } catch (error) {
    const output = error.stdout?.toString() || error.message;
    return {
      success: false,
      message: 'Voice compliance failed',
      details: output.split('\n').filter(Boolean),
    };
  }
}
