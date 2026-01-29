import dotenv from 'dotenv';
import path from 'path';
import solid from 'vite-plugin-solid';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [solid()],
  test: {
    environment: 'node',
    globals: true,
    env: dotenv.config({ path: '.env.vitest' }).parsed,
    setupFiles: [path.resolve(__dirname, 'vitest.setup.ts')],
    include: ['test/non-browser/**/*.test.ts', 'test/non-browser/**/*.test.tsx'],
    exclude: ['**/dist/**', '**/node_modules/**', '**/target/**'],
  },
  optimizeDeps: {
    include: ['@acab/ecsstatic'],
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'asrc'),
    },
  },
});
