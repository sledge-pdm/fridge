import { ecsstatic } from '@acab/ecsstatic/vite';
import path from 'path';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  plugins: [solidPlugin(), ecsstatic()],
  build: {
    outDir: 'dist',
    // Tauri uses Chromium on Windows and WebKit on macOS and Linux
    target: process.env.TAURI_ENV_PLATFORM == 'windows' ? 'chrome105' : 'safari13',
    // don't minify for debug builds
    minify: !process.env.TAURI_ENV_DEBUG ? 'esbuild' : false,
    // produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_ENV_DEBUG,
  },
  clearScreen: false,
  server: {
    // make sure this port matches the devUrl port in tauri.conf.json file
    port: 5174,
    // Tauri expects a fixed port, fail if that port is not available
    strictPort: true,
    // if the host Tauri is expecting is set, use it
    host: host || false,
    hmr: host
      ? {
          protocol: 'ws',
          host,
          port: 1421,
        }
      : undefined,

    watch: {
      ignored: ['**/src-tauri/**', '**/.vite-inspect/**'],
    },
  },
  optimizeDeps: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    include: [
      // Tauri APIs - 個別にpre-bundlingして高速化
      '@tauri-apps/api/app',
      '@tauri-apps/api/core',
      '@tauri-apps/api/event',
      '@tauri-apps/api/path',
      // '@tauri-apps/api/fs',
      // '@tauri-apps/api/dialog',
      // Tauri プラグイン
      '@tauri-apps/plugin-os',
      // 外部ライブラリ
      'mitt',
      'uuid',
      'interactjs',
      'msgpackr',
      // SolidJS関連（よく使用されるもの）
      '@solid-primitives/map',
      '@solid-primitives/mouse',
      '@solid-primitives/timer',
    ],
    exclude: [
      '@solid-primitives/raf',
      // WASMモジュールはpre-bundlingから除外
      '@sledge/wasm',
    ],
  },
  publicDir: '../../assets/',
  resolve: {
    alias: {
      '~': path.join(__dirname, 'src'),
      '@sledge/core': path.join(__dirname, '../../packages/core'),
      '@sledge/theme': path.join(__dirname, '../../packages/theme'),
      '@sledge/ui': path.join(__dirname, '../../packages/ui'),
    },
  },
});
