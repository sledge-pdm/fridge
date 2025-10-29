import { FoundSpan } from '../search/Search';
import { SpanMarkup } from './SpanMarkup';

function testSpanMarkup() {
  console.log('=== SpanMarkup Test ===');

  // テスト1: 基本的なテキスト処理
  const markup1 = new SpanMarkup();
  const result1 = markup1.toHTML('Hello world');
  console.log('Test 1: Basic text');
  console.log('Input: "Hello world"');
  console.log('Output:', result1);
  console.log('Expected: "Hello world" (escaped)');
  console.log('---');

  // テスト2: スペース可視化
  const markup2 = new SpanMarkup({ showHalfSpace: true, showFullSpace: true });
  const result2 = markup2.toHTML('Hello world　test');
  console.log('Test 2: Space visualization');
  console.log('Input: "Hello world　test"');
  console.log('Output:', result2);
  console.log('Expected: Half-space and full-space markers');
  console.log('---');

  // テスト3: 改行マーカー
  const markup3 = new SpanMarkup({ showNewline: true });
  const result3 = markup3.toHTML('Line 1\nLine 2\nLine 3');
  console.log('Test 3: Newline markers');
  console.log('Input: "Line 1\\nLine 2\\nLine 3"');
  console.log('Output:', result3);
  console.log('Expected: Newline markers between lines');
  console.log('---');

  // テスト4: 検索ハイライト
  const markup4 = new SpanMarkup({ highlightSearch: true });
  const testText = 'Hello, beautiful world!';
  console.log('Debug: Text length:', testText.length);
  console.log('Debug: "world" position:', testText.indexOf('world'));
  const searchSpans: FoundSpan[] = [
    { start: 0, end: 5 }, // "Hello"
    { start: 17, end: 22 }, // "world" (correct position)
  ];
  const result4 = markup4.toHTML(testText, searchSpans);
  console.log('Test 4: Search highlighting');
  console.log('Input: "Hello, beautiful world!"');
  console.log('Search spans:', searchSpans);
  console.log('Output:', result4);
  console.log('Expected: "Hello" and "world" highlighted');
  console.log('---');

  // テスト5: 複合テスト（全オプション有効）
  const markup5 = new SpanMarkup({
    showHalfSpace: true,
    showFullSpace: true,
    showNewline: true,
    highlightSearch: true,
  });
  const complexSearchSpans: FoundSpan[] = [
    { start: 6, end: 12 }, // "world　"
  ];
  const result5 = markup5.toHTML('Hello world　test\nNext line', complexSearchSpans);
  console.log('Test 5: Complex markup');
  console.log('Input: "Hello world　test\\nNext line"');
  console.log('Search spans:', complexSearchSpans);
  console.log('Output:', result5);
  console.log('Expected: All features combined');
  console.log('---');

  // テスト6: 空文字列
  const markup6 = new SpanMarkup();
  const result6 = markup6.toHTML('');
  console.log('Test 6: Empty string');
  console.log('Input: ""');
  console.log('Output:', result6);
  console.log('Expected: Zero-width space character');
  console.log('---');

  // テスト7: HTMLエスケープ
  const markup7 = new SpanMarkup();
  const result7 = markup7.toHTML('<script>alert("test")</script>');
  console.log('Test 7: HTML escaping');
  console.log('Input: "<script>alert(\\"test\\")</script>"');
  console.log('Output:', result7);
  console.log('Expected: HTML entities escaped');
  console.log('---');

  // テスト8: オプション更新
  const markup8 = new SpanMarkup();
  const before = markup8.toHTML('Hello world');
  markup8.updateOptions({ showHalfSpace: true });
  const after = markup8.toHTML('Hello world');
  console.log('Test 8: Option updates');
  console.log('Before option update:', before);
  console.log('After enabling showHalfSpace:', after);
  console.log('Expected: Different output after option change');

  console.log('=== SpanMarkup Test Complete ===');
}

// テスト実行
testSpanMarkup();
