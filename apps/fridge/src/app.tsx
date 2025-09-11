// @refresh reload
import { MetaProvider } from '@solidjs/meta';
import { Route, Router } from '@solidjs/router';
import Editor from './routes/editor/index';

import { flexCol, h100 } from '@sledge/core';
import { getTheme } from '@sledge/theme';
import { listen } from '@tauri-apps/api/event';
import { getCurrentWebview } from '@tauri-apps/api/webview';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { createEffect, onCleanup, onMount } from 'solid-js';
import { newDocument } from '~/models/Document';
import { configStore } from '~/stores/ConfigStore';
import { addDocument, useRestoreEditorStore } from '~/stores/EditorStore';
import { flushBackup } from '~/utils/AutoBackup';
import { reportCriticalError, zoomForIntegerize } from '~/utils/WindowUtils';

export default function App() {
  // 自動復元を起動時に実行
  useRestoreEditorStore();
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

  const applyThemeToHtml = () => {
    let cls = getTheme(configStore.theme);
    const html = document.documentElement;
    if (prevThemeClass && html.classList.contains(prevThemeClass)) {
      html.classList.remove(prevThemeClass);
    }
    html.classList.add(cls);
    prevThemeClass = cls;
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

    addDocument(newDocument());
  });

  // ウィンドウ終了要求時にバックアップをフラッシュ
  onMount(async () => {
    const unlisten = await listen('tauri://close-requested', async () => {
      await flushBackup();
    });
    onCleanup(() => {
      unlisten();
    });
  });

  createEffect(() => applyThemeToHtml());

  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <title>Sledge</title>
          <div
            class={[flexCol, h100].join(' ')}
            // onContextMenu={(e) => {
            //   e.preventDefault();
            // }}
          >
            {/* <TitleBar /> */}
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
