/**
 * Frontmatter Validation Module
 *
 * Delegates to legacy validate-frontmatter.mjs until full migration.
 * Part of the unified validation framework.
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..', '..');

export default async function validateFrontmatter(_options = {}) {
  try {
    execSync('node scripts/validate-frontmatter.mjs', {
      stdio: 'pipe',
      cwd: projectRoot,
    });
    return { success: true, message: 'Frontmatter validation passed' };
  } catch (error) {
    const output = error.stdout?.toString() || error.message;
    return {
      success: false,
      message: 'Frontmatter validation failed',
      details: output.split('\n').filter(Boolean),
    };
  }
}
