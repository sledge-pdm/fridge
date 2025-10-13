import { fonts } from '@sledge/theme';
import { Show } from 'solid-js';
import EditorTextArea from '~/components/EditorTextArea';
import Sidebar from '~/components/Sidebar';
import { editorStore, getCurrentDocument, updateCurrentDocument } from '~/stores/EditorStore';

import '~/styles/editor.css';
import { flexCol, flexRow, pageRoot } from '~/styles/styles';

export default function Editor() {
  return (
    <div class={pageRoot} style={{ overflow: 'hidden', 'box-sizing': 'border-box' }}>
      <Show when={editorStore.sidebar}>
        <Sidebar />
      </Show>

      <div class={flexCol} style={{ position: 'relative', 'flex-grow': 1, overflow: 'hidden', 'min-height': '0' }}>
        <div class='input_scroll'>
          <input
            style={{
              padding: '36px 28px 0px 28px',
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
            'border-top': `1px solid var(--color-border)`,
            background: 'var(--color-background)',
          }}
        >
          <p>{getCurrentDocument()?.associatedFilePath || ''}</p>
          <p style={{ 'margin-left': 'auto' }}>{getCurrentDocument()?.content.length} letters.</p>
        </div>
      </div>
    </div>
  );
}
