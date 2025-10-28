import { documentsManager } from '~/features/document/DocumentsManager';
import { FridgeDocument } from '~/features/document/model';

export const EDITOR_STATE_FILENAME = 'editor_state.json';

export interface SavedEditorState {
  documents: FridgeDocument[];
  activeId: string | undefined;
}

export function getCurrentEditorState(): SavedEditorState {
  return { documents: documentsManager.getDocs(), activeId: documentsManager.getActiveId() };
}
