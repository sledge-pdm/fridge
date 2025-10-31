import { playwright } from '@vitest/browser-playwright';
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
    include: ['apps/fridge/test/browser/**/*.test.ts', 'apps/sledge/fridge/test/browser/**/*.test.tsx'],
    exclude: ['**/dist/**', '**/node_modules/**', '**/target/**'],
    browser: {
      enabled: true,
      provider: playwright(),
      // https://vitest.dev/guide/browser/playwright
      instances: [{ browser: 'chromium' }, { browser: 'webkit' }],
    },
  },
  ssr: { resolve: { conditions: ['browser'] } },
  resolve: {
    conditions: ['browser'],
    alias: {
      '~': path.resolve(__dirname, 'apps/fridge/src'),
      '@sledge/core': path.resolve(__dirname, 'packages/core'),
      '@sledge/theme': path.resolve(__dirname, 'packages/theme'),
      '@sledge/ui': path.resolve(__dirname, 'packages/ui'),
    },
  },
});
