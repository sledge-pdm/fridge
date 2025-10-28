import { FridgeDocument } from '~/models/Document';

export interface FoundSpan {
  start: number;
  end: number;
}

export interface SearchResult {
  query: string | RegExp | undefined;
  founds: FoundSpan[];
  count: number;
}

export function searchDocument(docList: FridgeDocument, query: string | RegExp): SearchResult {
  const queryRegexp: RegExp = typeof query === 'string' ? new RegExp(query, 'g') : query;

  let founds: FoundSpan[] = [];
  let foundStrings;
  let count = 0;

  while ((foundStrings = queryRegexp.exec(doc.content)) !== null) {
    founds.push({
      start: queryRegexp.lastIndex - foundStrings[0].length,
      end: queryRegexp.lastIndex,
    });
    count++;
    if (count > 100) {
      console.log('too many results (>100). abort.');
      break;
    }
  }

  return {
    query,
    founds,
    count,
  };
}
