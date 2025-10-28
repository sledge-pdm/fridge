import { createStore } from 'solid-js/store';
import { FridgeDocument } from '~/features/document/model';

export interface EditorStore {
  documents: FridgeDocument[];
  activeDocId?: string;
  sidebar: boolean;
}

const [editorStore, setEditorStore] = createStore<EditorStore>({
  documents: [],
  activeDocId: undefined,
  sidebar: false,
});

export { editorStore, setEditorStore };
