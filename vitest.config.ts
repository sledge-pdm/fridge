import dotenv from 'dotenv';
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [],
  test: {
    environment: 'node',
    globals: true,
    env: dotenv.config({ path: '.env.vitest' }).parsed,
    setupFiles: [path.resolve(__dirname, 'vitest.setup.ts')],
    include: ['apps/fridge/test/**/*.test.ts', 'apps/sledge/fridge/**/*.test.tsx'],
    exclude: ['**/dist/**', '**/node_modules/**', '**/target/**'],
    coverage: {
      reporter: ['text', 'html'],
    },
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'apps/fridge/src'),
      '@sledge/core': path.resolve(__dirname, 'packages/core'),
      '@sledge/theme': path.resolve(__dirname, 'packages/theme'),
      '@sledge/ui': path.resolve(__dirname, 'packages/ui'),
    },
  },
});
