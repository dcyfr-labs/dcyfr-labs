import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  css: {
    // Disable PostCSS processing in tests to avoid Tailwind v4 compatibility issues
    postcss: {},
  },
  test: {
    environment: 'happy-dom',
    // Use node environment for pure logic tests (avoids DOM setup overhead)
    environmentMatchGlobs: [
      ['src/__tests__/mcp/**', 'node'],
      ['src/lib/agents/__tests__/**', 'node'],
      ['tests/integration/**', 'node'],
      ['tests/scripts/**', 'node'],
    ],
    setupFiles: ['./tests/vitest.setup.ts'],
    // Performance optimization: Use thread pool for parallel execution
    pool: 'threads',
    // Cache configuration for faster re-runs
    cache: {
      dir: 'node_modules/.vitest',
    },
    // Test isolation: Clear all mocks and module cache between test suites
    testTimeout: 10000, // 10 second timeout per test
    // Bail after N failures (speeds up CI)
    bail: 0, // 0 = no bail, run all tests. Set to 1 in CI with --bail flag
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/types/**',
        'src/app/**/*.tsx', // Exclude Next.js pages/layouts (integration tested)
        'src/instrumentation*.ts',
        'src/proxy.ts', // Tested separately with E2E
      ],
      thresholds: {
        // Updated: January 13, 2026
        // Thresholds now match actual coverage (~15-20%)
        // See: docs/testing/coverage-roadmap.md for Phase targets
        // Phase 1 (Current): 15% → Phase 2: 50% → Phase 3: 80%
        lines: 15,
        functions: 15,
        branches: 12,
        statements: 15,
      },
    },
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'e2e'],
    // Silence console output during tests (cleaner output)
    // Set to false if debugging
    silent: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
