import { createEffect, createSignal, onMount, Show } from 'solid-js';
import EditorBottomBar from '~/components/editor/EditorBottomBar';
import EditorStartContent from '~/components/editor/EditorStartContent';
import EditorTextArea from '~/components/editor/EditorTextArea';
import Sidebar from '~/components/side_bar/Sidebar';
import { FridgeDocument } from '~/features/document/model';
import { fromId, fromIndex, update } from '~/features/document/service';
import { editorStore, setEditorStore } from '~/stores/EditorStore';

import '~/styles/editor.css';
import { flexCol, pageRoot } from '~/styles/styles';
import { eventBus, Events } from '~/utils/EventBus';

export default function Editor() {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key >= '0' && e.key <= '9') {
      e.preventDefault();
      const index = Number(e.key) - 1;
      const doc = fromIndex(index);
      if (doc) {
        setEditorStore('activeDocId', doc.id);
      }
    }
  };

  const [activeDoc, setActiveDoc] = createSignal<FridgeDocument | undefined>(fromId(editorStore.activeDocId));

  createEffect(() => {
    const activeId = editorStore.activeDocId;
    setActiveDoc(fromId(activeId));
  });
  const handleDocUpdate = (e: Events['doc:changed']) => {
    setActiveDoc(fromId(editorStore.activeDocId));
  };

  onMount(() => {
    window.addEventListener('keydown', handleKeyDown);
    eventBus.on('doc:changed', handleDocUpdate);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      eventBus.off('doc:changed', handleDocUpdate);
    };
  });

  return (
    <div class={pageRoot} style={{ overflow: 'hidden', 'box-sizing': 'border-box' }}>
      <Show when={editorStore.sidebar}>
        <div class={flexCol} style={{ position: 'relative', overflow: 'hidden', 'min-height': '0' }}>
          <Sidebar />
        </div>
      </Show>

      <div class={flexCol} style={{ position: 'relative', 'flex-grow': 1, overflow: 'hidden', 'min-height': '0' }}>
        <Show when={editorStore.activeDocId} fallback={<EditorStartContent />}>
          <div class='input_scroll'>
            <input
              class='title_input'
              onInput={(e) => {
                const title = (e.target as HTMLInputElement).value;
                if (!title.trim()) return;
                if (editorStore.activeDocId) update(editorStore.activeDocId, { title, associatedFilePath: undefined });
              }}
              value={activeDoc()?.title ?? ''}
            />

            <EditorTextArea
              docId={() => activeDoc()?.id}
              content={() => activeDoc()?.content ?? ''}
              onInput={(value) => {
                if (editorStore.activeDocId) update(editorStore.activeDocId, { content: value });
              }}
            />
          </div>
        </Show>
        <EditorBottomBar />
      </div>
    </div>
  );
}
