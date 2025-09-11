import { createMemo } from 'solid-js';
import { createStore } from 'solid-js/store';
import { FridgeDocument } from '~/models/Document';

export interface EditorStore {
  currentDocumentId: string | null;
  documents: FridgeDocument[];
}

const [editorStore, setEditorStore] = createStore<EditorStore>({
  currentDocumentId: null,
  documents: [],
});

export const getCurrentDocument = createMemo(() => editorStore.documents.find((doc) => doc.id === editorStore.currentDocumentId));

export function setCurrentDocument(id: string | null) {
  setEditorStore('currentDocumentId', id);
}

export function addDocument(doc: FridgeDocument, setCurrent: boolean = true) {
  setEditorStore('documents', (docs) => [...docs, doc]);
  if (setCurrent) {
    setEditorStore('currentDocumentId', doc.id);
  }
}

export function updateCurrentDocument(updates: Partial<FridgeDocument>) {
  if (!editorStore.currentDocumentId) return;
  updateDocument(editorStore.currentDocumentId, updates);
}

export function updateDocument(id: string, updates: Partial<FridgeDocument>) {
  setEditorStore(
    'documents',
    (doc) => doc.id === id,
    (doc) => ({ ...doc, ...updates })
  );
}

export { editorStore };
