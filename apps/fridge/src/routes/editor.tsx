import { Show } from 'solid-js';
import EditorBottomBar from '~/components/editor/EditorBottomBar';
import EditorStartContent from '~/components/editor/EditorStartContent';
import EditorTextArea from '~/components/editor/EditorTextArea';
import EditorTitleInput from '~/components/editor/EditorTitleInput';
import Sidebar from '~/components/side_bar/Sidebar';
import { documentsManager } from '~/features/document/DocumentsManager';
import { useActiveDoc } from '~/features/document/useDocuments';
import { editorStore } from '~/stores/EditorStore';

import '~/styles/editor.css';
import { flexCol, pageRoot } from '~/styles/styles';

export default function Editor() {
  const { activeDoc } = useActiveDoc();

  return (
    <div class={pageRoot} style={{ overflow: 'hidden', 'box-sizing': 'border-box' }}>
      <Show when={editorStore.sidebar}>
        <div class={flexCol} style={{ position: 'relative', overflow: 'hidden', 'min-height': '0' }}>
          <Sidebar />
        </div>
      </Show>

      <div class={flexCol} style={{ position: 'relative', 'flex-grow': 1, overflow: 'hidden', 'min-height': '0' }}>
        <Show when={activeDoc()} fallback={<EditorStartContent />}>
          <div class='input_scroll'>
            <EditorTitleInput doc={activeDoc()!} />
            <EditorTextArea
              defaultValue={activeDoc()!.content}
              onInput={(value) => {
                documentsManager.updateActive({ content: value });
              }}
            />
          </div>
        </Show>
        <EditorBottomBar />
      </div>
    </div>
  );
}
