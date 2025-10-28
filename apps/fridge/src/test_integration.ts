// 検索機能の統合テスト用スクリプト
import { searchDocument } from './features/search/Search';
import { FridgeDocument } from './models/Document';
import { updateDocumentSearchResult } from './stores/EditorStore';

// テスト用のドキュメントを作成
export function createTestDocument(): FridgeDocument {
  return {
    id: 'test-doc-1',
    title: 'Test Document',
    content: `Hello world! This is a test document.
It contains multiple lines with various content.
We can search for "Hello", "world", "test", and other words.
This should demonstrate the search highlighting functionality.

Some special characters: <script>alert("test")</script>
And some spaces: half-space full-space　mixed content.

The quick brown fox jumps over the lazy dog.
Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
    searchResult: { query: undefined, founds: [], count: 0 },
  };
}

// 検索テスト実行
export function runSearchTest(docList: FridgeDocument, query: string) {
  console.log(`=== Testing search for: "${query}" ===`);
  const result = searchDocument(doc, query);
  console.log('Search result:', result);

  // ストアに結果を保存
  updateDocumentSearchResult(doc.id, result);

  return result;
}

// 複数クエリテスト
export function runMultipleSearchTests(docList: FridgeDocument) {
  const queries = ['Hello', 'test', 'the', 'space', 'fox'];

  queries.forEach((query) => {
    setTimeout(
      () => {
        runSearchTest(doc, query);
      },
      1000 * queries.indexOf(query)
    );
  });
}
