import { css } from '@acab/ecsstatic';
import { fonts } from '@sledge/theme';
import { createMemo, createSignal, onMount, Show } from 'solid-js';
import EditorTextArea from '~/components/EditorTextArea';
import Sidebar from '~/components/side_bar/Sidebar';
import { showChooseFileDialog } from '~/io/choose';
import { newDocument, openDocument } from '~/models/Document';
import { addDocument, editorStore, getCurrentDocument, updateCurrentDocument } from '~/stores/EditorStore';

import '~/styles/editor.css';
import { flexCol, flexRow, pageRoot } from '~/styles/styles';

const nothingContainer = css`
  display: flex;
  padding: 36px;
  flex-direction: column;
  flex: 1 1 0;
  min-height: 0;
  overflow: auto;
  box-sizing: border-box;
`;
const nothingTitle = css`
  font-size: 48px;
  font-family: ZFB31;
  margin-bottom: 16px;
`;
const nothingText = css`
  font-size: 8px;
  margin-bottom: 12px;
  font-family: ZFB08;
`;

export default function Editor() {
  const [timeType, setTimeType] = createSignal<'morning' | 'day' | 'night'>();

  onMount(() => {
    const hourInDay = new Date().getHours();
    if (3 < hourInDay && hourInDay < 10) setTimeType('morning');
    else if (10 <= hourInDay && hourInDay < 17) setTimeType('day');
    else if ((17 <= hourInDay && hourInDay < 24) || hourInDay <= 3) setTimeType('night');
  });

  const greet = createMemo(() => {
    switch (timeType()) {
      case 'morning':
        return 'GOOD MORNING.';
      case 'day':
        return 'HELLO.';
      case 'night':
        return 'GOOD EVENING.';
      default:
        return 'HI.';
    }
  });

  return (
    <div class={pageRoot} style={{ overflow: 'hidden', 'box-sizing': 'border-box' }}>
      <Show when={editorStore.sidebar}>
        <div class={flexCol} style={{ position: 'relative', overflow: 'hidden', 'min-height': '0' }}>
          <Sidebar />
        </div>
      </Show>

      <div class={flexCol} style={{ position: 'relative', 'flex-grow': 1, overflow: 'hidden', 'min-height': '0' }}>
        <Show
          when={editorStore.currentDocumentId && getCurrentDocument()}
          fallback={
            <div class={nothingContainer}>
              <p class={nothingTitle}>{greet()}</p>
              <p class={nothingText}>Start writing by:</p>
              <a
                class={nothingText}
                onClick={() => {
                  addDocument(newDocument());
                }}
              >
                {editorStore.currentDocumentId}
                &gt; new document.
              </a>
              {JSON.stringify(getCurrentDocument() ?? 'undefined')}
              <a
                class={nothingText}
                onClick={async () => {
                  const path = await showChooseFileDialog();
                  if (path) openDocument(path);
                }}
              >
                &gt; open existing files.
              </a>
            </div>
          }
        >
          <div class='input_scroll'>
            <input
              style={{
                padding: '32px 36px 0px 36px',
                'font-size': '24px',
                'font-family': `${fonts.ZFB09},${fonts.PM12}`,
                border: 'none',
                outline: 'none',
                width: '100%',
                'box-sizing': 'border-box',
                color: 'var(--color-on-background)',
              }}
              onInput={(e) => {
                const title = (e.target as HTMLInputElement).value;
                if (!title.trim()) return;
                updateCurrentDocument({ title, associatedFilePath: undefined });
              }}
              value={getCurrentDocument()?.title}
            />
            <EditorTextArea
              onInput={(value) => {
                updateCurrentDocument({ content: value });
              }}
            />
          </div>

          <div
            class={flexRow}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '24px',
              'align-items': 'center',
              padding: '0 12px',
              'border-top': `1px solid var(--color-border-secondary)`,
              background: 'var(--color-background)',
            }}
          >
            <p>{getCurrentDocument()?.associatedFilePath || ''}</p>
            <p style={{ 'margin-left': 'auto' }}>{getCurrentDocument()?.content.length} letters.</p>
          </div>
        </Show>
      </div>
    </div>
  );
}
