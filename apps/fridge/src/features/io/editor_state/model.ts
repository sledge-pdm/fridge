import { SerializedDocument, serializeDocument } from '~/features/document/serialize';
import { editorStore } from '~/stores/EditorStore';

export const EDITOR_STATE_FILENAME = 'editor_state.json';

export interface SavedEditorState {
  documents: SerializedDocument[];
  activeId: string | undefined;
}

export function getCurrentEditorState(): SavedEditorState {
  return { documents: editorStore.documents.map((doc) => serializeDocument(doc)), activeId: editorStore.activeDocId };
}
