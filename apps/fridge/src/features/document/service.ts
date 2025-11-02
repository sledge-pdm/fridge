import { FridgeDocument } from '~/features/document/FridgeDocument';
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

export async function openDocument(docPath: string): Promise<FridgeDocument> {
  const content = await readFromFile(docPath);
  const title = pathToTitle(docPath);

  const doc: FridgeDocument = new FridgeDocument(title, content, docPath);

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

export function refreshContentOnLoad(docId: string) {
  const doc = fromId(docId);
  if (doc) setEditorStore('documents', IndexOf(doc.getId()), 'setContentOnLoad', doc.getContent());
}

export function fromIndex(index: number): FridgeDocument | undefined {
  if (index < 0 || editorStore.documents.length <= index) return undefined;
  else return editorStore.documents[index];
}

export function IndexOf(id?: string): number {
  return editorStore.documents.findIndex((d) => d.getId() === id);
}

export function fromId(id?: string): FridgeDocument | undefined {
  if (!id) return;
  return editorStore.documents.find((d) => d.getId() === id);
}

export function replaceDocuments(docs: FridgeDocument[], activeId?: string) {
  console.log(docs);

  setEditorStore('documents', docs.slice());
  setEditorStore('activeDocId', activeId ?? docs[0].getId());

  docs.forEach((d) => {
    eventBus.emit('doc:changed', { id: d.getId() });
  });

  saveEditorState();
}

export function addDocument(doc: FridgeDocument, setActive: boolean = true) {
  setEditorStore('documents', (docs) => {
    return [...docs, doc];
  });
  if (setActive) setEditorStore('activeDocId', doc.getId());

  saveEditorState();
}

// returns next active index (when it's active doc)
export function removeDocument(id: string): number | undefined {
  const removingDoc = fromId(id);
  if (!removingDoc) return;

  const removingIndex = IndexOf(removingDoc.getId());
  setEditorStore('documents', (docs) => {
    return [...docs.filter((doc) => doc.getId() !== id)];
  });

  const nextIndex = Math.min(removingIndex + 1, editorStore.documents.length - 1);
  if (0 <= nextIndex) {
    const nextDoc = fromIndex(nextIndex);
    setEditorStore('activeDocId', nextDoc?.getId());
  }

  if (editorStore.documents.length === 0) {
    setEditorStore('activeDocId', undefined);
  }

  saveEditorState();
}