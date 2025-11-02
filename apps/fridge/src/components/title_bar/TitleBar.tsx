import { css } from '@acab/ecsstatic';
import { Icon } from '@sledge/ui';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { createSignal, onMount, Show } from 'solid-js';
import TitleBarMenuItem from '~/components/title_bar/TitleBarMenuItem';
import { addDocument, newDocument, openDocument } from '~/features/document/service';
import { showChooseFileDialog } from '~/features/io/open';
import { saveDocument } from '~/features/io/save';
import { editorStore } from '~/stores/EditorStore';
import {
  titleBarControlButtonContainer,
  titleBarControlButtonImg,
  titleBarControlCloseButtonContainer,
  titleBarControls,
  titleBarRoot,
  titleBarTitleContainer,
} from '~/styles/title_bar/title_bar';
import '~/styles/title_bar/title_bar_region.css';

const menuItemsContainer = css`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 100%;
  margin-left: 24px;
  gap: 16px;
`;

export default function TitleBar() {
  const [isMaximizable, setIsMaximizable] = createSignal(false);
  const [isMinimizable, setIsMinimizable] = createSignal(false);
  const [isClosable, setIsClosable] = createSignal(false);
  const [isMaximized, setMaximized] = createSignal(false);
  const [isDecorated, setIsDecorated] = createSignal(true);

  onMount(async () => {
    const window = getCurrentWindow();
    setIsMaximizable(await window.isMaximizable());
    setIsMinimizable(await window.isMinimizable());
    setIsClosable(await window.isClosable());
    setMaximized(await window.isMaximized());
    setIsDecorated(await window.isDecorated());
  });

  getCurrentWindow().onResized(async () => {
    setMaximized(await getCurrentWindow().isMaximized());
  });

  return (
    <header>
      <Show when={!isDecorated()}>
        <nav class={titleBarRoot} data-tauri-drag-region>
          <div class={menuItemsContainer} data-tauri-drag-region-exclude>
            <TitleBarMenuItem
              label='File.'
              menu={[
                {
                  type: 'item',
                  label: 'new document',
                  onSelect: () => {
                    addDocument(newDocument(), true);
                  },
                },
                {
                  type: 'item',
                  label: 'open document',
                  onSelect: async () => {
                    const path = await showChooseFileDialog();
                    if (path) openDocument(path);
                  },
                },
                {
                  type: 'item',
                  label: 'save document',
                  onSelect: () => {
                    if (editorStore.activeDocId) saveDocument(editorStore.activeDocId);
                  },
                },
              ]}
            />
          </div>
          <div class={titleBarTitleContainer}>
            {/* <Show when={location.pathname.startsWith('/editor')} fallback={<p class={titleBarTitle}>{windowTitle()}</p>}>
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
            </Show> */}
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
