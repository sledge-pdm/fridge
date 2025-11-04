import { css } from '@acab/ecsstatic';
import TitleBarMenuItem from '~/components/title_bar/TitleBarMenuItem';
import { addDocument, newDocument, openDocument } from '~/features/document/service';
import { showChooseFileDialog } from '~/features/io/open';
import { saveDocument } from '~/features/io/save';
import { editorStore } from '~/stores/EditorStore';
import { titleBarRoot, titleBarTitleContainer } from '~/styles/title_bar/title_bar';
import '~/styles/title_bar/title_bar_region.css';

const menuItemsContainer = css`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 100%;
  margin-left: 24px;
  gap: 16px;
`;

export default function SPTitleBar() {
  return (
    <header>
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
      </nav>
    </header>
  );
}
