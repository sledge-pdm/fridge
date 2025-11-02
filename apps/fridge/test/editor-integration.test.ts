import { expect, test } from 'vitest';
import {
  expectDocumentContent,
  expectNodeContent,
  expectNodeCount,
  expectValidEditorState,
  pasteLines,
  pressBackspace,
  pressEnter,
  selectRange,
  setCursorPosition,
  setupEditor,
  typeAndValidate,
  typeText,
  waitForEditorReady,
} from './utils';

/**
 * AST Original:
 * <h1>Test Document</h1>
 * <p>Hello</p>
 *
 * Operation: 段落の「Hello」の末尾に「 World」をタイプ入力
 *
 * AST Expected:
 * <h1>Test Document</h1>
 * <p>Hello World</p>
 */
test('基本的なテキスト入力', async () => {
  const context = await setupEditor('Hello', 'Test Document');
  await waitForEditorReady(context.docElement);

  try {
    // 2番目のノード（段落）の末尾にカーソルを置く
    const paragraphNode = context.docElement.querySelector('[data-type="paragraph"]');
    const nodeId = paragraphNode?.getAttribute('data-node-id');
    expect(nodeId).toBeTruthy();

    await setCursorPosition(context.docElement, nodeId!, 'Hello'.length);
    await typeText(' World');

    // 結果検証`
    expectValidEditorState(context.docElement);
    expectNodeContent(1, 'Hello World', 'paragraph');
  } finally {
    context.cleanup();
  }
});

/**
 * AST Original:
 * <h1>タイトル</h1>
 * <p></p>
 *
 * Operation: 空の段落に「前半部分」をタイプ → Enterキー → 「後半部分」をタイプ
 *
 * AST Expected:
 * <h1>タイトル</h1>
 * <p>前半部分</p>
 * <p>後半部分</p>
 */
test('改行による段落分割', async () => {
  const context = await setupEditor('', 'タイトル');
  await waitForEditorReady(context.docElement);

  try {
    // 2番目のノード（段落）にテキストを入力
    const paragraphNode = context.docElement.querySelector('[data-type="paragraph"]');
    const nodeId = paragraphNode?.getAttribute('data-node-id');
    expect(nodeId).toBeTruthy();

    await setCursorPosition(context.docElement, nodeId!, 0);
    await typeText('前半部分');
    await pressEnter();
    await typeText('後半部分');

    // 結果検証
    expectValidEditorState(context.docElement);
    expectNodeCount(3); // タイトル + 分割された段落2つ
    expectNodeContent(1, '前半部分', 'paragraph');
    expectNodeContent(2, '後半部分', 'paragraph');
  } finally {
    context.cleanup();
  }
});

/**
 * AST Original:
 * <h1>テスト</h1>
 * <p></p>
 *
 * Operation: 空の段落に複数行テキスト「1行目\n2行目\n3行目」を貼り付け
 *
 * AST Expected:
 * <h1>テスト</h1>
 * <p>1行目</p>
 * <p>2行目</p>
 * <p>3行目</p>
 */
test('複数行貼り付けによる段落作成', async () => {
  const context = await setupEditor('', 'テスト');
  await waitForEditorReady(context.docElement);

  try {
    const paragraphNode = context.docElement.querySelector('[data-type="paragraph"]');
    const nodeId = paragraphNode?.getAttribute('data-node-id');
    expect(nodeId).toBeTruthy();

    await setCursorPosition(context.docElement, nodeId!, 0);
    await pasteLines(['1行目', '2行目', '3行目']);

    // 結果検証
    expectValidEditorState(context.docElement);
    expectNodeCount(4); // タイトル + 3つの段落
    expectNodeContent(1, '1行目', 'paragraph');
    expectNodeContent(2, '2行目', 'paragraph');
    expectNodeContent(3, '3行目', 'paragraph');
  } finally {
    context.cleanup();
  }
});

/**
 * AST Original:
 * <h1>タイトル</h1>
 * <p>削除される行1</p>
 * <p>削除される行2</p>
 * <p>残る行</p>
 *
 * Operation: 最初の2つの段落を範囲選択 → バックスペースで削除
 *
 * AST Expected:
 * <h1>タイトル</h1>
 * <p>残る行</p>
 */
test('範囲選択後のバックスペース', async () => {
  const context = await setupEditor('', 'タイトル');
  await waitForEditorReady(context.docElement);

  try {
    // 段落に複数行のテキストを用意
    const paragraphNode = context.docElement.querySelector('[data-type="paragraph"]');
    const nodeId = paragraphNode?.getAttribute('data-node-id');
    expect(nodeId).toBeTruthy();

    await setCursorPosition(context.docElement, nodeId!, 0);
    await pasteLines(['削除される行1', '削除される行2', '残る行']);

    // 最初の2行を選択
    const firstParagraph = context.docElement.querySelectorAll('[data-type="paragraph"]')[0];
    const secondParagraph = context.docElement.querySelectorAll('[data-type="paragraph"]')[1];
    const firstNodeId = firstParagraph?.getAttribute('data-node-id');
    const secondNodeId = secondParagraph?.getAttribute('data-node-id');

    expect(firstNodeId).toBeTruthy();
    expect(secondNodeId).toBeTruthy();

    await selectRange(context.docElement, firstNodeId!, 0, secondNodeId!, 9); // "削除される行2"の末尾まで
    await pressBackspace();

    // 結果検証
    expectValidEditorState(context.docElement);
    expectNodeCount(2); // タイトル + 残った段落
    expectNodeContent(1, '残る行', 'paragraph');
  } finally {
    context.cleanup();
  }
});

/**
 * AST Original:
 * <h1>見出し内容</h1>
 * <p></p>
 *
 * Operation: 見出しの「見出」と「し内容」の間でEnterキーを押下
 *
 * AST Expected:
 * <h1>見出</h1>
 * <p>し内容</p>
 * <p></p>
 */
test('見出しでのEnter押下後の動作', async () => {
  const context = await setupEditor('', '見出し内容');
  await waitForEditorReady(context.docElement);

  try {
    // 見出しの途中でEnterを押す
    const headingNode = context.docElement.querySelector('[data-type="heading"]');
    const nodeId = headingNode?.getAttribute('data-node-id');
    expect(nodeId).toBeTruthy();

    await setCursorPosition(context.docElement, nodeId!, 2); // "見出"の後
    await pressEnter();

    // 結果検証: 見出しが分割され、後半が段落になる
    expectValidEditorState(context.docElement);
    expectNodeCount(3); // 分割された見出し + 新しい段落 + 元の段落
    expectNodeContent(0, '見出', 'heading');
    expectNodeContent(1, 'し内容', 'paragraph');
  } finally {
    context.cleanup();
  }
});

/**
 * AST Original:
 * <h1></h1>
 * <p>初期テキスト</p>
 *
 * Operation: 段落の「初期テキスト」の末尾に「を追加」をタイプ入力
 *
 * AST Expected:
 * <h1></h1>
 * <p>初期テキストを追加</p>
 */
test('統合ヘルパーを使用したテスト', async () => {
  const context = await setupEditor('初期テキスト');
  await waitForEditorReady(context.docElement);

  try {
    const paragraphNode = context.docElement.querySelector('[data-type="paragraph"]');
    const nodeId = paragraphNode?.getAttribute('data-node-id');
    expect(nodeId).toBeTruthy();

    // typeAndValidateヘルパーを使用（「初期テキスト」の末尾に挿入）
    await typeAndValidate(context, 'を追加', nodeId!, '初期テキスト'.length);

    expectDocumentContent('初期テキストを追加');
  } finally {
    context.cleanup();
  }
});
