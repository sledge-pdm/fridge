import { css } from '@acab/ecsstatic';
import { Icon } from '@sledge/ui';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { createMemo, createSignal, onMount, Show } from 'solid-js';
import { addDocument, fromId, newDocument, openDocument } from '~/features/document/service';
import { showChooseFileDialog } from '~/features/io/choose';
import { editorStore } from '~/stores/EditorStore';
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

const controlButton = css`
  padding: 2px;
  height: 100%;
  margin-left: 12px;
  opacity: 0.5;
  white-space: nowrap;
`;

export default function TitleBar() {
  const activeDoc = createMemo(() => fromId(editorStore.activeDocId));

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
                  gap: ' 2px 12px',
                  'flex-wrap': 'wrap',
                }}
              >
                <p class={titleBarTitle}>{activeDoc()?.getTitle() ?? 'fridge.'}</p>
                <p class={titleBarTitleSub}>{activeDoc()?.filePath ?? ''}</p>
              </div>
            </Show>
          </div>
          <a
            class={controlButton}
            onClick={async () => {
              addDocument(newDocument(), true);
            }}
          >
            + add
          </a>
          <a
            class={controlButton}
            onClick={async () => {
              const path = await showChooseFileDialog();
              if (path) openDocument(path);
            }}
          >
            + open
          </a>
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
                  src={'/icons/title_bar/minimize_10.png'}
                  color={'var(--color-on-background)'}
                  base={10}
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
                  src={isMaximized() ? '/icons/title_bar/quit_maximize_10.png' : '/icons/title_bar/maximize_10.png'}
                  color={'var(--color-on-background)'}
                  base={10}
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
                  src={'/icons/title_bar/close_10.png'}
                  color={'var(--color-on-background)'}
                  base={10}
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
