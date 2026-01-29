import { createStore } from 'solid-js/store';
import { SidebarContents } from '~/components/side_bar/Sidebar';
import { FridgeDocument } from '~/features/document/FridgeDocument';
import { SearchResult } from '~/features/search/Search';

export interface EditorStore {
  documents: FridgeDocument[];
  activeDocId?: string;

  sidebar: SidebarContents | undefined;

  searchStates: Map<string, SearchResult | undefined>;
}

const [editorStore, setEditorStore] = createStore<EditorStore>({
  documents: [],
  activeDocId: undefined,

  sidebar: undefined,
  searchStates: new Map(),
});

export { editorStore, setEditorStore };
