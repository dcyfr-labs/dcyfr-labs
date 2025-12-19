import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
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
        // Temporary thresholds during Phase 1 coverage buildout
        // Current: 0.63% → Target: Phase 1 (25%), Phase 2 (50%), Phase 3 (80%)
        // Will raise incrementally as tests are added
        // See: docs/testing/coverage-roadmap.md
        lines: 0.5,
        functions: 0.5,
        branches: 0.4,
        statements: 0.5,
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
})

