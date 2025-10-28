// @refresh reload
import { MetaProvider } from '@solidjs/meta';
import { Route, Router } from '@solidjs/router';
import Editor from './routes/editor';

import { applyTheme } from '@sledge/theme';
import '@sledge/theme/src/global.css';
import { listen } from '@tauri-apps/api/event';
import { getCurrentWebview } from '@tauri-apps/api/webview';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { createEffect, onCleanup, onMount } from 'solid-js';
import MenuBar from '~/components/title_bar/MenuBar';
import TitleBar from '~/components/title_bar/TitleBar';
import { documentsManager } from '~/features/document/DocumentsManager';
import { newDocument } from '~/features/document/service';
import { loadEditorState } from '~/features/io/editor_state/load';
import { configStore } from '~/stores/ConfigStore';
import { flexCol } from '~/styles/styles';
import { reportCriticalError, zoomForIntegerize } from '~/utils/WindowUtils';

export default function App() {
  // 自動復元を起動時に実行
  loadEditorState();

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

  // listenEvent('onSettingsSaved', () => {
  //   loadGlobalSettings();
  // });

  // テーマクラスを html 要素に付与して、Portal や body 直下にもトークンが届くようにする
  let prevThemeClass: string | undefined;

  const applyThemeToHtml = (osTheme?: 'dark' | 'light') => {
    if (osTheme && configStore.theme === 'os') {
      applyTheme(osTheme);
    } else {
      applyTheme(configStore.theme);
    }
  };

  listen('tauri://theme-changed', (e) => {
    applyThemeToHtml();
  });

  onMount(async () => {
    applyThemeToHtml();

    const webview = getCurrentWebview();
    const window = getCurrentWindow();

    await webview.setZoom(zoomForIntegerize(await window.scaleFactor()));

    window.onScaleChanged(async ({ payload }) => {
      const { scaleFactor, size } = payload;
      console.log('scale changed to:', scaleFactor, 'dprzoom: ', zoomForIntegerize(scaleFactor));
      await webview.setZoom(zoomForIntegerize(scaleFactor));
    });

    // await checkForUpdates();

    documentsManager.addDocument(newDocument());
  });

  onMount(async () => {
    const unlisten = await listen('tauri://close-requested', async () => {});
    onCleanup(() => {
      unlisten();
    });
  });

  createEffect(() => applyThemeToHtml());

  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <title>Fridge</title>
          <div class={flexCol} style={{ height: '100%' }}>
            <TitleBar />
            <MenuBar />
            <main>{props.children}</main>
            {/* <DebugViewer /> */}
          </div>
        </MetaProvider>
      )}
    >
      <Route path='/editor' component={Editor} />
    </Router>
  );
}
