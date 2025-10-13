import { FridgeDocument } from '~/models/Document';
import { searchDocument } from './Search';

// テスト用のドキュメント作成
function createTestDocument(content: string): FridgeDocument {
  return {
    content,
    // 他の必要なプロパティがあれば追加
  } as FridgeDocument;
}

// テスト関数
function testSearchLogic() {
  console.log('=== Search Logic Test ===');

  // テスト1: 単純な文字列検索
  const doc1 = createTestDocument('Hello world. Hello again.');
  const result1 = searchDocument(doc1, 'Hello');

  console.log('Test 1: Simple string search');
  console.log('Content:', doc1.content);
  console.log('Query: "Hello"');
  console.log('Results:', result1);
  console.log('Expected: start=0,end=5 and start=13,end=18');

  // 検証
  if (
    result1.count === 2 &&
    result1.founds[0].start === 0 &&
    result1.founds[0].end === 5 &&
    result1.founds[1].start === 13 &&
    result1.founds[1].end === 18
  ) {
    console.log('✅ Test 1 PASSED');
  } else {
    console.log('❌ Test 1 FAILED');
  }

  console.log('---');

  // テスト2: 正規表現検索
  const doc2 = createTestDocument('cat bat rat');
  const result2 = searchDocument(doc2, /[cbr]at/g);

  console.log('Test 2: RegExp search');
  console.log('Content:', doc2.content);
  console.log('Query: /[cbr]at/g');
  console.log('Results:', result2);
  console.log('Expected: 3 matches at positions 0-3, 4-7, 8-11');

  // 検証
  if (
    result2.count === 3 &&
    result2.founds[0].start === 0 &&
    result2.founds[0].end === 3 &&
    result2.founds[1].start === 4 &&
    result2.founds[1].end === 7 &&
    result2.founds[2].start === 8 &&
    result2.founds[2].end === 11
  ) {
    console.log('✅ Test 2 PASSED');
  } else {
    console.log('❌ Test 2 FAILED');
  }

  console.log('---');

  // テスト3: 範囲検証（マッチした文字列を実際に抽出して確認）
  const doc3 = createTestDocument('The quick brown fox');
  const result3 = searchDocument(doc3, 'quick');

  console.log('Test 3: Range verification');
  console.log('Content:', doc3.content);
  console.log('Query: "quick"');
  console.log('Results:', result3);

  if (result3.count === 1) {
    const foundText = doc3.content.substring(result3.founds[0].start, result3.founds[0].end);
    console.log('Extracted text:', foundText);

    if (foundText === 'quick') {
      console.log('✅ Test 3 PASSED');
    } else {
      console.log('❌ Test 3 FAILED - extracted text does not match');
    }
  } else {
    console.log('❌ Test 3 FAILED - wrong count');
  }

  console.log('=== Test Complete ===');
}

// テスト実行
testSearchLogic();
