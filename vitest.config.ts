import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  cacheDir: 'node_modules/.vitest',
  plugins: [react()],
  css: {
    // Disable PostCSS processing in tests to avoid Tailwind v4 compatibility issues
    postcss: {},
  },
  test: {
    environment: 'happy-dom',
    setupFiles: ['./tests/vitest.setup.ts'],
    // Performance optimization: Use thread pool for parallel execution
    pool: 'threads',
    poolOptions: {
      threads: {
        minThreads: 2,
        maxThreads: 8,
      },
    },
    // Force NODE_ENV=test regardless of shell environment
    // Vitest only sets this when not already defined; force it here
    // so production code that branches on NODE_ENV works correctly in tests.
    env: {
      NODE_ENV: 'test',
    },
    // Route pure-logic tests to lighter node environment (no DOM overhead)
    environmentMatchGlobs: [
      ['src/**/agents/**/*.test.ts', 'node'],
      ['src/__tests__/lib/**/*.test.ts', 'node'],
    ],
    // Cache: uses Vite's cacheDir (set at top level)
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
