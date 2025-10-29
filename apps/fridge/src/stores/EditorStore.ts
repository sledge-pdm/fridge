import { createStore } from 'solid-js/store';
import { FridgeDocument } from '~/features/document/model';
import { SearchResult } from '~/features/search/Search';

export interface EditorStore {
  documents: FridgeDocument[];
  activeDocId?: string;

  sidebar: boolean;

  searchStates: Map<string, SearchResult | undefined>;
}

const [editorStore, setEditorStore] = createStore<EditorStore>({
  documents: [],
  activeDocId: undefined,

  sidebar: false,
  searchStates: new Map(),
});

export { editorStore, setEditorStore };
