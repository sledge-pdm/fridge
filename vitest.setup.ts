// Minimal mocks for UI/Tauri dependent modules so unit tests can run in Node.
import { vi } from 'vitest';

// Mock @acab/ecsstatic CSS-in-JS library for tests
vi.mock('@acab/ecsstatic', () => ({
  css: vi.fn((strings: TemplateStringsArray) => `mock-css-${strings.join('')}`),
}));

// Mock mitt-based event bus to no-op emit/on during unit tests (avoid importing the real module entirely)
vi.mock('~/utils/EventBus', () => ({
  eventBus: {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  },
}));

// Tauri APIs are not needed for these unit tests; stub them generally to prevent import errors if accidentally referenced.
vi.mock('@tauri-apps/api/path', () => ({ appCacheDir: vi.fn(async () => 'C:/Documents') }));
vi.mock('@tauri-apps/plugin-os', () => ({
  platform: vi.fn(async () => 'windows'),
  arch: vi.fn(async () => 'x86_64'),
  type: vi.fn(async () => 'Windows'),
  version: vi.fn(async () => '10.0.22000'),
}));
vi.mock('@tauri-apps/plugin-fs', () => ({
  exists: vi.fn(),
  mkdir: vi.fn(),
  writeFile: vi.fn(),
  readFile: vi.fn(),
  readTextFile: vi.fn(),
  writeTextFile: vi.fn(),
}));
vi.mock('@tauri-apps/plugin-dialog', () => ({ confirm: vi.fn(async () => true), message: vi.fn() }));
vi.mock('@sledge/ui', () => ({}));
vi.mock('@sledge/theme', () => ({
  themeOptions: [
    { label: 'os theme', value: 'os' },
    { label: 'light', value: 'light' },
    { label: 'dark', value: 'dark' },
  ],
  applyTheme: vi.fn(),
  watchOSTheme: vi.fn(),
}));

// ブラウザ環境でのDOM設定
if (typeof document !== 'undefined') {
  // テスト用のベースHTML構造を確保
  if (!document.body) {
    document.documentElement.appendChild(document.createElement('body'));
  }

  // 必要なCSS変数を設定（テスト用の最小限）
  document.documentElement.style.setProperty('--color-background', '#ffffff');
  document.documentElement.style.setProperty('--color-text', '#000000');
}
