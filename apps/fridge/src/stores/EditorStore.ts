import { createMemo, onMount } from 'solid-js';
import { createStore } from 'solid-js/store';
import { SearchResult } from '~/features/search/Search';
import { FridgeDocument } from '~/models/Document';
import { requestBackupSave, restoreBackup } from '~/utils/AutoBackup';

export interface EditorStore {
  currentDocumentId: string | null;
  documents: FridgeDocument[];

  sidebar: boolean;
}

const [editorStore, setEditorStore] = createStore<EditorStore>({
  currentDocumentId: null,
  documents: [],

  sidebar: false,
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

export function removeDocument(id: string) {
  setEditorStore('documents', (docs) => docs.filter((doc) => doc.id !== id));
  if (editorStore.currentDocumentId === id) {
    setEditorStore('currentDocumentId', null);
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

export function setSideBarOpen(open: boolean) {
  setEditorStore('sidebar', open);
}

/**
 * 指定されたドキュメントの検索結果を更新
 */
export function updateDocumentSearchResult(documentId: string, searchResult: SearchResult) {
  const documentIndex = editorStore.documents.findIndex((doc) => doc.id === documentId);
  if (documentIndex !== -1) {
    setEditorStore('documents', documentIndex, 'searchResult', searchResult);
  }
}

/**
 * 指定されたドキュメントの検索結果をクリア
 */
export function clearDocumentSearchResult(documentId: string) {
  const documentIndex = editorStore.documents.findIndex((doc) => doc.id === documentId);
  if (documentIndex !== -1) {
    setEditorStore('documents', documentIndex, 'searchResult', { query: undefined, founds: [], count: 0 });
  }
}

export { editorStore };
