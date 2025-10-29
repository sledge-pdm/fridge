// @refresh reload
import { MetaProvider } from '@solidjs/meta';
import { Route, Router } from '@solidjs/router';
import Editor from './routes/editor';

import { css } from '@acab/ecsstatic';
import { applyTheme } from '@sledge/theme';
import '@sledge/theme/src/global.css';
import { listen } from '@tauri-apps/api/event';
import { getCurrentWebview } from '@tauri-apps/api/webview';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { platform } from '@tauri-apps/plugin-os';
import { createEffect, createSignal, onCleanup, onMount, Show } from 'solid-js';
import MenuBar from '~/components/title_bar/MenuBar';
import SPTitleBar from '~/components/title_bar/SPTitleBar';
import TitleBar from '~/components/title_bar/TitleBar';
import { addDocument, newDocument } from '~/features/document/service';
import { configStore } from '~/stores/ConfigStore';
import { reportCriticalError, zoomForIntegerize } from '~/utils/WindowUtils';

const appRoot = css`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
`;

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

  const [showTitleBar, setShowTitleBar] = createSignal(false);

  onMount(async () => {
    applyThemeToHtml();

    const currentPlatform = platform();

    if (currentPlatform === 'android') setShowTitleBar(false);
    else {
      setShowTitleBar(true);

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
      // await checkForUpdates();
    }

    // const result = await loadEditorState();
    // if (result.restored) {
    // } else {
    //   console.warn(result.reason);
    //   addDocument(newDocument(), true);
    // }
    addDocument(newDocument(), true);
  });

  // onMount(async () => {
  //   const unlisten = await listen('tauri://close-requested', async () => {});
  //   onCleanup(() => {
  //     unlisten();
  //   });
  // });

  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <title>Fridge</title>
          <div class={appRoot} style={{ height: '100%' }}>
            <Show when={showTitleBar()} fallback={<SPTitleBar />}>
              <TitleBar />
            </Show>
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
