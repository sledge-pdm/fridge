// @refresh reload
import { MetaProvider } from '@solidjs/meta';
import { Route, Router } from '@solidjs/router';
import Editor from './routes/editor';

import { applyTheme } from '@sledge/theme';
import '@sledge/theme/src/global.css';
import { listen } from '@tauri-apps/api/event';
import { getCurrentWebview } from '@tauri-apps/api/webview';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { platform } from '@tauri-apps/plugin-os';
import { createEffect, onCleanup, onMount } from 'solid-js';
import { addDocument, newDocument } from '~/features/document/service';
import { loadEditorState } from '~/features/io/editor_state/load';
import { saveEditorState } from '~/features/io/editor_state/save';
import { configStore } from '~/stores/ConfigStore';
import { reportCriticalError, zoomForIntegerize } from '~/utils/WindowUtils';

export default function App() {
  // グローバルエラーハンドラーを設定
  const handleGlobalError = (event: ErrorEvent) => {
    console.error('Global error caught:', event.error);
    reportCriticalError(event.error || new Error(event.message));
  };

  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    console.error('Unhandled promise rejection caught:', event.reason);
    reportCriticalError(event.reason instanceof Error ? event.reason : new Error(String(event.reason)));
  };

  onMount(() => {
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
  });

  onCleanup(() => {
    window.removeEventListener('error', handleGlobalError);
    window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  });

  const applyThemeToHtml = (osTheme?: 'dark' | 'light') => {
    if (osTheme && configStore.theme === 'os') {
      applyTheme(osTheme);
    } else {
      applyTheme(configStore.theme);
    }
  };

  createEffect(() => {
    configStore.theme;
    applyThemeToHtml();
  });

  onMount(async () => {
    applyThemeToHtml();

    const currentPlatform = platform();

    if (currentPlatform !== 'android') {
      listen('tauri://theme-changed', (e) => {
        applyThemeToHtml();
      });

      const webview = getCurrentWebview();
      const window = getCurrentWindow();

      await webview.setZoom(zoomForIntegerize(await window.scaleFactor()));

      window.onScaleChanged(async ({ payload }) => {
        const { scaleFactor, size } = payload;
        console.log('scale changed to:', scaleFactor, 'dprzoom: ', zoomForIntegerize(scaleFactor));
        await webview.setZoom(zoomForIntegerize(scaleFactor));
      });

      window.onCloseRequested(async (e) => {
        await saveEditorState();
      });
    }

    const result = await loadEditorState();
    
    if (result.restored) {
    } else {
      console.warn(result.reason);
      addDocument(newDocument(), true);
    }
  });

  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <title>Fridge</title>
          {props.children}
        </MetaProvider>
      )}
    >
      <Route path='/editor' component={Editor} />
    </Router>
  );
}
