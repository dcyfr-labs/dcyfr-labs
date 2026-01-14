import { defineConfig } from 'vitest/config';
import path from 'path';

/**
 * Vitest Configuration for Build/Script Tests
 *
 * Separate configuration for testing build scripts and utilities.
 * Uses Node.js environment (no React/browser dependencies).
 *
 * Usage:
 * npm run test:scripts       # Single run
 * npm run test:scripts:watch # Watch mode
 *
 * Note: For active test development, consider consolidating this with
 * the main vitest.config.ts using environment detection.
 */

export default defineConfig({
  test: {
    globals: true,
    include: ['scripts/__tests__/**/*.{test,spec}.{ts,mjs}'],
    environment: 'node',
    // Use thread pool for parallel execution of script tests
    pool: 'threads',
    // Cache directory for faster re-runs
    cache: {
      dir: 'node_modules/.vitest-scripts',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
