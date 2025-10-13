import { SearchResult } from '~/features/search/Search';
import { readFromFile } from '~/io/read';
import { addDocument } from '~/stores/EditorStore';
import { PathToFileLocation } from '~/utils/FileUtils';

export interface FridgeDocument {
  id: string;
  title: string;
  content: string;

  // file association
  associatedFilePath?: string;

  // search result
  searchResult?: SearchResult;
}

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
