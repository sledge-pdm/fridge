import { css } from '@acab/ecsstatic';
import { createMemo, Show } from 'solid-js';
import { addDocument, fromId, newDocument, openDocument } from '~/features/document/service';
import { showChooseFileDialog } from '~/features/io/choose';
import { editorStore } from '~/stores/EditorStore';
import { flexRow } from '~/styles/styles';
import { titleBarRootSp, titleBarTitle, titleBarTitleContainerSp } from '~/styles/title_bar/title_bar';
import '~/styles/title_bar/title_bar_region.css';

const controlButton = css`
  padding: 2px;
  height: 100%;
  margin-left: 12px;
  opacity: 0.5;
  white-space: nowrap;
`;
export default function SPTitleBar() {
  const activeDoc = createMemo(() => fromId(editorStore.activeDocId));

  return (
    <header>
      <nav class={titleBarRootSp} data-tauri-drag-region>
        <div class={titleBarTitleContainerSp}>
          <Show when={location.pathname.startsWith('/editor')}>
            <div
              class={flexRow}
              style={{
                'align-items': 'baseline',
                gap: ' 2px 12px',
                'flex-wrap': 'wrap',
              }}
            >
              <p class={titleBarTitle}>{activeDoc()?.title ?? 'fridge.'}</p>
              {/* <p class={titleBarTitleSub}>{activeDoc()?.associatedFilePath ?? ''}</p> */}
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
          </Show>
        </div>
      </nav>
    </header>
  );
}
