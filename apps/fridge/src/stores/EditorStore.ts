import { createMemo, onMount } from 'solid-js';
import { createStore } from 'solid-js/store';
import { FridgeDocument } from '~/models/Document';
import { requestBackupSave, restoreBackup } from '~/utils/AutoBackup';

export interface EditorStore {
  currentDocumentId: string | null;
  documents: FridgeDocument[];
}

const [editorStore, setEditorStore] = createStore<EditorStore>({
  currentDocumentId: null,
  documents: [],
});

// ストア状態を外部からまとめて適用（復元時など）
export function applyEditorPartial(data: Partial<EditorStore>) {
  if (data.currentDocumentId !== undefined) setEditorStore('currentDocumentId', data.currentDocumentId);
  if (data.documents !== undefined) setEditorStore('documents', data.documents as FridgeDocument[]);
}

export const getCurrentDocument = createMemo(() => editorStore.documents.find((doc) => doc.id === editorStore.currentDocumentId));

export function setCurrentDocument(id: string | null) {
  setEditorStore('currentDocumentId', id);
  requestBackupSave();
}

export function addDocument(doc: FridgeDocument, setCurrent: boolean = true) {
  setEditorStore('documents', (docs) => [...docs, doc]);
  if (setCurrent) {
    setEditorStore('currentDocumentId', doc.id);
  }
  requestBackupSave();
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
  requestBackupSave();
}

// 初回マウント時に復元（Solidコンポーネント環境で呼ぶ想定）
export function useRestoreEditorStore() {
  onMount(async () => {
    const result = await restoreBackup((data) => applyEditorPartial(data));
    if (!result.restored) {
      // 復元不要/失敗は静かに無視
    }
  });
}

export { editorStore };
