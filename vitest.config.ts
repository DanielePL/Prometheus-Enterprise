import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    testTimeout: 10000,
    coverage: {
      provider: 'v8',
      include: ['src/services/**', 'src/config/**', 'src/contexts/**', 'src/lib/errors.ts', 'src/components/ErrorBoundary.tsx'],
    },
  },
});
