import { css } from '@acab/ecsstatic';
import { platform } from '@tauri-apps/plugin-os';
import { createSignal, onMount, Show } from 'solid-js';
import BottomBar from '~/components/bottom_bar/BottomBar';
import DocumentEditor from '~/components/editor/DocumentEditor';
import EditorStartContent from '~/components/editor/Start';
import Sidebar from '~/components/side_bar/Sidebar';
import MenuBar from '~/components/title_bar/MenuBar';
import SPTitleBar from '~/components/title_bar/SPTitleBar';
import TitleBar from '~/components/title_bar/TitleBar';
import { addDocument, fromIndex, newDocument } from '~/features/document/service';
import { loadEditorState } from '~/features/io/editor_state/load';
import { saveDocument } from '~/features/io/save';
import { editorStore, setEditorStore } from '~/stores/EditorStore';

const root = css`
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: var(--color-background);
  padding-top: env(safe-area-inset-top);
  padding-right: env(safe-area-inset-right);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
`;

const titlebar = css`
  display: flex;
  flex-direction: column;
`;

const pageContent = css`
  display: flex;
  flex-direction: row;
  overflow: hidden;
  flex-grow: 1;
`;

export default function Editor() {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key >= '0' && e.key <= '9') {
      e.preventDefault();
      const index = Number(e.key) - 1;
      const doc = fromIndex(index);
      if (doc) {
        setEditorStore('activeDocId', doc.getId());
      }
    }

    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      if (editorStore.activeDocId) saveDocument(editorStore.activeDocId);
    }
  };

  onMount(() => {
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  });

  const [showTitleBar, setShowTitleBar] = createSignal(false);

  onMount(async () => {
    const currentPlatform = platform();
    if (currentPlatform === 'android') setShowTitleBar(false);
    else {
      setShowTitleBar(true);
    }

    const result = await loadEditorState();

    if (result.restored) {
    } else {
      console.warn(result.reason);
      addDocument(newDocument(), true);
    }
  });

  return (
    <div class={root}>
      <div class={titlebar}>
        <Show when={showTitleBar()} fallback={<SPTitleBar />}>
          <TitleBar />
        </Show>
        <MenuBar />
      </div>

      <div class={pageContent}>
        <Show when={editorStore.activeDocId} fallback={<EditorStartContent />}>
          <DocumentEditor docId={editorStore.activeDocId!} />
        </Show>

        <Show when={editorStore.sidebar}>
          <Sidebar />
        </Show>
      </div>

      <BottomBar />
    </div>
  );
}
