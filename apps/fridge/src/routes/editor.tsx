import { onMount, Show } from 'solid-js';
import BottomBar from '~/components/bottom_bar/BottomBar';
import EditorStartContent from '~/components/editor/EditorStartContent';
import EditorTextArea from '~/components/editor/EditorTextArea';
import Sidebar from '~/components/side_bar/Sidebar';
import { fromId, fromIndex } from '~/features/document/service';
import { overwrite } from '~/features/io/save';
import { editorStore, setEditorStore } from '~/stores/EditorStore';

import '~/styles/editor.css';
import { pageContent, pageRoot } from '~/styles/styles';

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

    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      const active = fromId(editorStore.activeDocId);
      if (active) overwrite(active);
    }
  };

  onMount(() => {
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  });

  return (
    <div class={pageRoot}>
      <div class={pageContent}>
        <Show when={editorStore.activeDocId} fallback={<EditorStartContent />}>
          <div class='input_scroll'>
            <EditorTextArea docId={editorStore.activeDocId} />
          </div>
        </Show>
        <BottomBar />
      </div>

      <Show when={editorStore.sidebar}>
        <Sidebar />
      </Show>
    </div>
  );
}
