import { documentsManager } from '~/features/document/DocumentsManager';
import { FridgeDocument } from '~/features/document/model';
import { readFromFile } from '~/features/io/read';
import { SearchResult } from '~/features/search/Search';
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
    searchResult: undefined,
  };

  documentsManager.addDocument(doc);
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
  //   const documentIndex = editorStore.documents.findIndex((doc) => doc.id === documentId);
  //   if (documentIndex !== -1) {
  //     setEditorStore('documents', documentIndex, 'searchResult', searchResult);
  //   }
}

export function clearDocumentSearchResult(documentId: string) {
  //   const documentIndex = editorStore.documents.findIndex((doc) => doc.id === documentId);
  //   if (documentIndex !== -1) {
  //     setEditorStore('documents', documentIndex, 'searchResult', { query: undefined, founds: [], count: 0 });
  //   }
}
