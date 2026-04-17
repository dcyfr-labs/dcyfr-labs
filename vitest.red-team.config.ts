import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  css: { postcss: {} },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    environment: 'node',
    setupFiles: ['./tests/vitest.setup.ts'],
    include: ['src/__tests__/red-team/**/*.red-team.test.ts'],
    testTimeout: 30000,
    reporters: ['default', 'json'],
    outputFile: 'red-team-results.json',
    env: { NODE_ENV: 'test' },
    pool: 'threads',
    poolOptions: { threads: { minThreads: 1, maxThreads: 4 } },
  },
});
