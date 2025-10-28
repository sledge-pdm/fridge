import { FridgeDocument } from '~/features/document/model';
import { saveEditorState } from '~/features/io/editor_state/save';
import { readFromFile } from '~/features/io/read';
import { SearchResult } from '~/features/search/Search';
import { editorStore, setEditorStore } from '~/stores/EditorStore';
import { eventBus } from '~/utils/EventBus';
import { PathToFileLocation } from '~/utils/FileUtils';

function pathToTitle(path: string): string {
  const location = PathToFileLocation(path);
  return location?.name?.replace('.txt', '') || 'Untitled Document';
}

export async function openDocument(path: string): Promise<FridgeDocument> {
  const content = await readFromFile(path);
  const title = pathToTitle(path);

  const doc: FridgeDocument = {
    id: crypto.randomUUID(),
    title,
    content,
    associatedFilePath: path,
  };

  addDocument(doc);
  return doc;
}

export function newDocument(id?: string, title: string = '', content: string = ''): FridgeDocument {
  if (!id) {
    id = crypto.randomUUID();
  }
  if (!title) {
    title = 'Untitled Document';
  }

  return {
    id,
    title,
    content,
  };
}

export function updateDocumentSearchResult(documentId: string, searchResult: SearchResult) {
  setEditorStore('searchStates', (states) => {
    states.set(documentId, searchResult);
    return new Map(states);
  });
}

export function clearDocumentSearchResult(documentId: string) {
  setEditorStore('searchStates', (states) => {
    states.delete(documentId);
    return new Map(states);
  });
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

  saveEditorState();

  const nextIndex = removingIndex - 1;
  if (0 <= nextIndex && nextIndex < editorStore.documents.length) {
    const nextDoc = fromIndex(nextIndex);
    setEditorStore('activeDocId', nextDoc?.id);
  }
}

export function replaceDocument(id: string, doc: FridgeDocument) {
  const index = IndexOf(id);
  if (index < 0) return;

  setEditorStore('documents', index, doc);

  saveEditorState();
}

export function update(id: string, updates: Partial<FridgeDocument>) {
  if (!id) return;
  const index = IndexOf(id);
  const doc = fromIndex(index);

  if (!doc) return;

  replaceDocument(id, { ...doc, ...updates });

  eventBus.emit('doc:changed', { id });

  saveEditorState();
}
