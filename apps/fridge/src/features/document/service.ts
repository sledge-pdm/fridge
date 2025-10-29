import { FridgeDocument } from '~/features/document/models/FridgeDocument';
import { saveEditorState } from '~/features/io/editor_state/save';
import { readFromFile } from '~/features/io/read';
import { SearchResult } from '~/features/search/Search';
import { editorStore, setEditorStore } from '~/stores/EditorStore';
import { eventBus } from '~/utils/EventBus';
import { getFileNameWithoutExtension, pathToFileLocation } from '~/utils/FileUtils';

function pathToTitle(path: string): string {
  const location = pathToFileLocation(path);
  return getFileNameWithoutExtension(location?.name) || 'Untitled Document';
}

export function isChanged(doc: FridgeDocument) {
  return false; // pessimistic
}

export async function openDocument(docPath: string): Promise<FridgeDocument> {
  const content = await readFromFile(docPath);
  const title = pathToTitle(docPath);

  console.log(title, content  );

  const doc: FridgeDocument = new FridgeDocument(title, content);

  doc.filePath = docPath;

  addDocument(doc);
  return doc;
}

export function newDocument(): FridgeDocument {
  const doc: FridgeDocument = new FridgeDocument('title', 'content');
  return doc;
}

export function updateDocumentSearchResult(documentId: string, searchResult: SearchResult) {
  setEditorStore('searchStates', (states) => {
    states.set(documentId, searchResult);
    return new Map(states);
  });

  saveEditorState();
}

export function clearDocumentSearchResult(documentId: string) {
  setEditorStore('searchStates', (states) => {
    states.delete(documentId);
    return new Map(states);
  });

  saveEditorState();
}

export function fromIndex(index: number): FridgeDocument | undefined {
  if (index < 0 || editorStore.documents.length <= index) return undefined;
  else return editorStore.documents[index];
}

export function IndexOf(id?: string): number {
  return editorStore.documents.findIndex((d) => d.id === id);
}

export function fromId(id?: string): FridgeDocument | undefined {
  if (!id) return;
  return editorStore.documents.find((d) => d.id === id);
}

export function replaceDocuments(docs: FridgeDocument[], activeId?: string) {
  setEditorStore('documents', docs.slice());
  setEditorStore('activeDocId', activeId ?? docs[0].id);

  saveEditorState();
}

export function addDocument(doc: FridgeDocument, setActive: boolean = true) {
  setEditorStore('documents', (docs) => {
    return [...docs, doc];
  });
  if (setActive) setEditorStore('activeDocId', doc.id);

  saveEditorState();
}

// returns next active index (when it's active doc)
export function removeDocument(id: string): number | undefined {
  const removingDoc = fromId(id);
  if (!removingDoc) return;

  const removingIndex = IndexOf(removingDoc.id);
  setEditorStore('documents', (docs) => {
    return [...docs.filter((doc) => doc.id !== id)];
  });

  const nextIndex = Math.min(removingIndex + 1, editorStore.documents.length - 1);
  if (0 <= nextIndex) {
    const nextDoc = fromIndex(nextIndex);
    setEditorStore('activeDocId', nextDoc?.id);
  }

  if (editorStore.documents.length === 0) {
    setEditorStore('activeDocId', undefined);
  }

  saveEditorState();
}

export function replaceDocument(id: string, doc: FridgeDocument) {
  const index = IndexOf(id);
  if (index < 0) return;

  setEditorStore('documents', index, doc);

  eventBus.emit('doc:changed', { id });

  saveEditorState();
}

export function update(id: string, updates: Partial<FridgeDocument>) {
  if (!id) return;
  const index = IndexOf(id);
  const doc = fromIndex(index);

  if (!doc) return;

  // replaceDocument(id, { ...doc, ...updates });

  eventBus.emit('doc:changed', { id });

  saveEditorState();
}
