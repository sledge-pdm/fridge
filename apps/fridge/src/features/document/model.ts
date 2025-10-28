import { SearchResult } from '~/features/search/Search';

export interface FridgeDocument {
  id: string;
  title: string;
  content: string;

  // file association
  associatedFilePath?: string;
  // search result
  searchResult?: SearchResult;
}
