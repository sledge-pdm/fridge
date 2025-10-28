import { FridgeDocument } from '~/features/document/model';
import { editorStore } from '~/stores/EditorStore';

export const EDITOR_STATE_FILENAME = 'editor_state.json';

export interface SavedEditorState {
  documents: FridgeDocument[];
  activeId: string | undefined;
}

export function getCurrentEditorState(): SavedEditorState {
  return { documents: editorStore.documents, activeId: editorStore.activeDocId };
}
