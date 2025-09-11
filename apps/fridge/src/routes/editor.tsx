import { flexCol, flexRow } from '@sledge/core';
import { pageRoot, PM12, vars, ZFB09, ZFB31 } from '@sledge/theme';
import DocumentsList from '~/components/DocumentsList';
import EditorTextArea from '~/components/EditorTextArea';
import { showChooseFileDialog } from '~/io/choose';
import { overwrite, saveToFile } from '~/io/save';
import { newDocument, openDocument } from '~/models/Document';
import { addDocument, getCurrentDocument, removeDocument, updateCurrentDocument } from '~/stores/EditorStore';

export default function Editor() {
  return (
    <div class={pageRoot} style={{ overflow: 'hidden', 'box-sizing': 'border-box' }}>
      <div
        class={flexCol}
        style={{
          'box-sizing': 'border-box',
          height: '100%',
          width: 'auto',
          'min-width': '300px',
          gap: '16px',
          padding: '36px 32px',
          overflow: 'hidden',
          'border-right': `1px solid ${vars.color.border}`,
        }}
      >
        <p
          style={{
            'font-size': '24px',
            'font-family': ZFB31,
          }}
        >
          FRIDGE.
        </p>
        <div class={flexRow} style={{ gap: '8px', 'flex-wrap': 'wrap' }}>
          <button
            onClick={() => {
              addDocument(newDocument());
            }}
          >
            + add.
          </button>
          <button
            onClick={() => {
              const currentId = getCurrentDocument()?.id;
              if (currentId) removeDocument(currentId);
            }}
          >
            - remove.
          </button>
          <button
            onClick={async () => {
              const path = await showChooseFileDialog();
              if (path) {
                openDocument(path);
              }
            }}
          >
            + open.
          </button>
          <button
            onClick={async () => {
              const current = getCurrentDocument();
              if (!current) return;
              if (current.associatedFilePath) {
                overwrite(current);
              } else {
                const path = await saveToFile(getCurrentDocument()?.content || '', `${getCurrentDocument()?.title || 'untitled'}.txt`);
                if (path) updateCurrentDocument({ associatedFilePath: path });
              }
            }}
          >
            save.
          </button>
        </div>

        <DocumentsList />
      </div>
      <div class={flexCol} style={{ height: '100%', 'flex-grow': 1, overflow: 'hidden' }}>
        <div class={flexCol} style={{ height: '100%', 'flex-grow': 1, overflow: 'auto', padding: '16px' }}>
          <input
            style={{
              padding: '24px 16px 0px 16px',
              'font-size': '24px',
              'font-family': `${ZFB09},${PM12}`,
              border: 'none',
              outline: 'none',
              width: '100%',
              'box-sizing': 'border-box',
              color: vars.color.onBackground,
            }}
            onInput={(e) => {
              const title = (e.target as HTMLInputElement).value;
              if (!title.trim()) return;
              updateCurrentDocument({ title });
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
            height: '24px',
            'align-items': 'center',
            padding: '0 12px',
            'border-top': `1px solid ${vars.color.border}`,
          }}
        >
          <p>{getCurrentDocument()?.associatedFilePath || ''}</p>
          <p style={{ 'margin-left': 'auto' }}>{getCurrentDocument()?.content.length} letters.</p>
        </div>
      </div>
    </div>
  );
}
