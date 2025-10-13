import { Icon } from '@sledge/ui';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { createSignal, onMount, Show } from 'solid-js';
import ThemeDropdown from '~/components/ThemeDropdown';
import { getCurrentDocument } from '~/stores/EditorStore';
import { flexRow } from '~/styles/styles';
import {
  titleBarControlButtonContainer,
  titleBarControlButtonImg,
  titleBarControlCloseButtonContainer,
  titleBarControls,
  titleBarRoot,
  titleBarTitle,
  titleBarTitleContainer,
  titleBarTitleSub,
} from '~/styles/title_bar/title_bar';
import '~/styles/title_bar/title_bar_region.css';

export default function TitleBar() {
  const [isMaximizable, setIsMaximizable] = createSignal(false);
  const [isMinimizable, setIsMinimizable] = createSignal(false);
  const [isClosable, setIsClosable] = createSignal(false);
  const [isMaximized, setMaximized] = createSignal(false);
  const [isDecorated, setIsDecorated] = createSignal(true);
  const [windowTitle, setWindowTitle] = createSignal('');

  onMount(async () => {
    const window = getCurrentWindow();
    setIsMaximizable(await window.isMaximizable());
    setIsMinimizable(await window.isMinimizable());
    setIsClosable(await window.isClosable());
    setMaximized(await window.isMaximized());
    setIsDecorated(await window.isDecorated());
    setWindowTitle(await window.title());
  });

  getCurrentWindow().onResized(async () => {
    setMaximized(await getCurrentWindow().isMaximized());
  });

  return (
    <header>
      <Show when={!isDecorated()}>
        <nav class={titleBarRoot} data-tauri-drag-region>
          <div class={titleBarTitleContainer}>
            <Show when={location.pathname.startsWith('/editor')} fallback={<p class={titleBarTitle}>{windowTitle()}</p>}>
              <div
                class={flexRow}
                style={{
                  'align-items': 'baseline',
                  gap: '12px',
                }}
              >
                <p class={titleBarTitle}>{getCurrentDocument()?.title}</p>
                <p class={titleBarTitleSub}>{getCurrentDocument()?.associatedFilePath ?? ''}</p>
              </div>
            </Show>
          </div>
          <div style={{ 'pointer-events': 'all', 'margin-right': '8px' }} data-tauri-drag-region-exclude>
            <ThemeDropdown />
          </div>
          <div class={titleBarControls} data-tauri-drag-region-exclude>
            <Show when={isMinimizable()}>
              <div
                class={titleBarControlButtonContainer}
                onClick={async (e) => {
                  e.preventDefault();
                  await getCurrentWindow().minimize();
                }}
                data-tauri-drag-region-exclude
              >
                <Icon
                  class={titleBarControlButtonImg}
                  src={'/icons/title_bar/minimize_2.png'}
                  color={'var(--color-on-background)'}
                  base={12}
                  data-tauri-drag-region-exclude
                />
              </div>
            </Show>

            <Show when={isMaximizable()}>
              <div
                class={titleBarControlButtonContainer}
                onClick={async (e) => {
                  e.preventDefault();
                  await getCurrentWindow().toggleMaximize();
                }}
                data-tauri-drag-region-exclude
              >
                <Icon
                  class={titleBarControlButtonImg}
                  src={isMaximized() ? '/icons/title_bar/quit_maximize_2.png' : '/icons/title_bar/maximize_2.png'}
                  color={'var(--color-on-background)'}
                  base={12}
                  data-tauri-drag-region-exclude
                />
              </div>
            </Show>

            <Show when={isClosable()}>
              <div
                class={titleBarControlCloseButtonContainer}
                onClick={async (e) => {
                  e.preventDefault();
                  await getCurrentWindow().close();
                }}
                data-tauri-drag-region-exclude
              >
                <Icon
                  class={titleBarControlButtonImg}
                  src={'/icons/title_bar/close_2.png'}
                  color={'var(--color-on-background)'}
                  base={12}
                  data-tauri-drag-region-exclude
                />
              </div>
            </Show>
          </div>
        </nav>
      </Show>
    </header>
  );
}
