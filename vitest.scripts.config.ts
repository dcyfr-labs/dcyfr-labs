import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    include: ['scripts/__tests__/**/*.{test,spec}.mjs'],
    environment: 'node',
    // Use thread pool for parallel execution of script tests
    pool: 'threads',
    // Allow Vitest to use 75% of available cores for faster parallelism
    // maxThreads removed: not supported by current vitest InlineConfig types; rely on 'pool' and CI worker settings
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
})
