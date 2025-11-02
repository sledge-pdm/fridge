import { page, userEvent } from 'vitest/browser';
import { getCurrentSerializedSelection, restoreSelectionMapped, SerializedSelection } from '~/features/selection/SelectionMapper';

/**
 * 指定されたノードの指定された位置にカーソルを設定します
 * @param nodeId ノードID
 * @param offset テキスト内のオフセット位置
 */
export async function setCursorPosition(docElement: HTMLElement, nodeId: string, offset: number): Promise<void> {
  const targetElement = docElement.querySelector(`[data-node-id="${nodeId}"]`);
  if (!targetElement) {
    throw new Error(`ノードID "${nodeId}" の要素が見つかりません`);
  }

  // テキストノードを取得
  const textNode = getFirstTextNode(targetElement);
  if (!textNode) {
    throw new Error(`ノード "${nodeId}" 内にテキストノードが見つかりません`);
  }

  // 範囲を作成してカーソル位置を設定
  const range = document.createRange();
  const actualOffset = Math.min(offset, textNode.textContent?.length || 0);
  range.setStart(textNode, actualOffset);
  range.setEnd(textNode, actualOffset);

  // 選択範囲を設定
  const selection = window.getSelection();
  if (selection) {
    selection.removeAllRanges();
    selection.addRange(range);
  }

  // フォーカスを確実にする
  const docEl = document.getElementById('editor-doc-el');
  if (docEl) {
    docEl.focus();
  } else {
    await userEvent.click(page.getByTestId('editor-container'));
  }
}

/**
 * 現在のカーソル位置から指定された文字数だけ選択を拡張します
 * @param direction 方向 ('left' | 'right')
 * @param count 文字数
 */
export async function extendSelectionByChars(direction: 'left' | 'right', count: number): Promise<void> {
  const arrowKey = direction === 'right' ? 'ArrowRight' : 'ArrowLeft';

  for (let i = 0; i < count; i++) {
    await userEvent.keyboard(`{Shift>}${arrowKey}{/Shift}`);
  }
}

/**
 * 現在のカーソル位置から指定された行数だけ選択を拡張します
 * @param direction 方向 ('up' | 'down')
 * @param count 行数
 */
export async function extendSelectionByLines(direction: 'up' | 'down', count: number): Promise<void> {
  const arrowKey = direction === 'down' ? 'ArrowDown' : 'ArrowUp';

  for (let i = 0; i < count; i++) {
    await userEvent.keyboard(`{Shift>}${arrowKey}{/Shift}`);
  }
}

/**
 * 現在のカーソル位置から単語単位で選択を拡張します
 * @param direction 方向 ('left' | 'right')
 * @param count 単語数
 */
export async function extendSelectionByWords(direction: 'left' | 'right', count: number): Promise<void> {
  const arrowKey = direction === 'right' ? 'ArrowRight' : 'ArrowLeft';

  for (let i = 0; i < count; i++) {
    await userEvent.keyboard(`{Shift>}{Control>}${arrowKey}{/Control}{/Shift}`);
  }
}

/**
 * 指定された範囲を選択します
 * @param startNodeId 開始ノードID
 * @param startOffset 開始オフセット
 * @param endNodeId 終了ノードID
 * @param endOffset 終了オフセット
 */
export async function selectRange(
  docElement: HTMLElement,
  startNodeId: string,
  startOffset: number,
  endNodeId: string,
  endOffset: number
): Promise<void> {
  const startElement = docElement.querySelector(`[data-node-id="${startNodeId}"]`);
  const endElement = docElement.querySelector(`[data-node-id="${endNodeId}"]`);

  if (!startElement || !endElement) {
    throw new Error('指定されたノードの要素が見つかりません');
  }

  const startTextNode = getFirstTextNode(startElement);
  const endTextNode = getFirstTextNode(endElement);

  if (!startTextNode || !endTextNode) {
    throw new Error('指定されたノード内にテキストノードが見つかりません');
  }

  const range = document.createRange();
  range.setStart(startTextNode, Math.min(startOffset, startTextNode.textContent?.length || 0));
  range.setEnd(endTextNode, Math.min(endOffset, endTextNode.textContent?.length || 0));

  const selection = window.getSelection();
  if (selection) {
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

/**
 * 全てのコンテンツを選択します（Ctrl+A相当）
 */
export async function selectAll(): Promise<void> {
  await userEvent.keyboard('{Control>}a{/Control}');
}

/**
 * 選択範囲をクリアします
 */
export async function clearSelection(): Promise<void> {
  const selection = window.getSelection();
  if (selection) {
    selection.removeAllRanges();
  }
}

/**
 * 現在の選択状態を取得します
 */
export function getCurrentSelection(docElement: HTMLElement): SerializedSelection | null {
  return getCurrentSerializedSelection(docElement);
}

/**
 * 選択状態を復元します
 */
export function restoreSelection(docElement: HTMLElement, selection: SerializedSelection): void {
  restoreSelectionMapped(docElement, selection);
}

/**
 * 要素内の最初のテキストノードを取得します
 */
function getFirstTextNode(element: Element): Text | null {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      // 空白のみのテキストノードは無視
      if (node.nodeValue && node.nodeValue.trim().length > 0) {
        return NodeFilter.FILTER_ACCEPT;
      }
      return NodeFilter.FILTER_REJECT;
    },
  });

  let textNode = walker.nextNode() as Text | null;

  // テキストノードが見つからない場合、空のテキストノードを作成して挿入
  if (!textNode) {
    textNode = document.createTextNode('');
    element.appendChild(textNode);
  }

  return textNode;
}

/**
 * 現在の選択範囲の情報を取得します（デバッグ用）
 */
export function getSelectionInfo(): {
  hasSelection: boolean;
  rangeCount: number;
  anchorOffset: number;
  focusOffset: number;
  isCollapsed: boolean;
  selectedText: string;
} | null {
  const selection = window.getSelection();
  if (!selection) return null;

  return {
    hasSelection: selection.rangeCount > 0,
    rangeCount: selection.rangeCount,
    anchorOffset: selection.anchorOffset,
    focusOffset: selection.focusOffset,
    isCollapsed: selection.isCollapsed,
    selectedText: selection.toString(),
  };
}
