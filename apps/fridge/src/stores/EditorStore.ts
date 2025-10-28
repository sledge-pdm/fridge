import { createStore } from 'solid-js/store';

export interface EditorStore {
  sidebar: boolean;
}

const [editorStore, setEditorStore] = createStore<EditorStore>({
  sidebar: false,
});

export { editorStore, setEditorStore };
