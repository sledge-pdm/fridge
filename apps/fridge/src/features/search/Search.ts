import { FridgeDocument } from '~/features/document/FridgeDocument';

export interface FoundSpan {
  start: number;
  end: number;
}

export interface SearchResult {
  query: string | RegExp | undefined;
  founds: FoundSpan[];
  count: number;
}

export function searchDocument(doc: FridgeDocument, query: string | RegExp): SearchResult {
  const queryRegexp: RegExp = typeof query === 'string' ? new RegExp(query, 'g') : query;

  let founds: FoundSpan[] = [];
  let foundStrings;
  let count = 0;

  while ((foundStrings = queryRegexp.exec(doc.getContent())) !== null) {
    founds.push({
      start: queryRegexp.lastIndex - foundStrings[0].length,
      end: queryRegexp.lastIndex,
    });
    count++;
    if (count > 1000) {
      console.log('too many results (>1000). abort.');
      break;
    }
  }

  return {
    query,
    founds,
    count,
  };
}
