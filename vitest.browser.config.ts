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
    include: ['test/browser/**/*.test.ts', 'test/browser/**/*.test.tsx'],
    exclude: ['**/dist/**', '**/node_modules/**', '**/target/**'],
    browser: {
      enabled: true,
      provider: playwright(),
      // https://vitest.dev/guide/browser/playwright
      instances: [{ browser: 'chromium' } /** { browser: 'webkit' } */],
      headless: true, // CI等ではtrue推奨
    },
  },
  ssr: { resolve: { conditions: ['browser'] } },
  resolve: {
    conditions: ['browser'],
    alias: {
      '~': path.resolve(__dirname, 'src'),
    },
  },
});
