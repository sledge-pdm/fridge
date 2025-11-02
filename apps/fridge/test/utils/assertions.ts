import { expect } from 'vitest';
import { FridgeDocument } from '~/features/document/models/FridgeDocument';
import { parseDocFromDOM } from '~/features/document/parser';
import { getCurrentSelection } from './cursor-selection';
import { getCurrentDocument } from './setup-editor';

/**
 * AST整合性検証の結果
 */
export interface ASTConsistencyResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * DOM-AST整合性をチェックします
 * @param docElement contenteditable要素
 * @returns 整合性検証結果
 */
export function checkDOMToASTConsistency(docElement: HTMLElement): ASTConsistencyResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // DOMからASTを生成
    const astFromDOM = parseDocFromDOM(docElement);
    if (!astFromDOM) {
      errors.push('DOMからASTへの変換に失敗しました');
      return { isValid: false, errors, warnings };
    }

    // 現在のストアからドキュメントを取得
    const currentDoc = getCurrentDocument();
    if (!currentDoc) {
      errors.push('現在のドキュメントが見つかりません');
      return { isValid: false, errors, warnings };
    }

    // テキスト内容の一致をチェック
    const domText = astFromDOM.toPlain();
    const storeText = currentDoc.toPlain();

    if (domText !== storeText) {
      errors.push(`テキスト内容が一致しません:DOM="${domText}", Store="${storeText}"`);
    }

    // ノード数の一致をチェック
    if (astFromDOM.children.length !== currentDoc.children.length) {
      errors.push(`ノード数が一致しません: DOM=${astFromDOM.children.length}, Store=${currentDoc.children.length}`);
    }

    // 各ノードの詳細チェック
    for (let i = 0; i < Math.min(astFromDOM.children.length, currentDoc.children.length); i++) {
      const domNode = astFromDOM.children[i];
      const storeNode = currentDoc.children[i];

      if (domNode.type !== storeNode.type) {
        errors.push(`ノード${i}のタイプが一致しません: DOM="${domNode.type}", Store="${storeNode.type}"`);
      }

      if (domNode.toPlain() !== storeNode.toPlain()) {
        errors.push(`ノード${i}のテキストが一致しません: DOM="${domNode.toPlain()}", Store="${storeNode.toPlain()}"`);
      }

      // ノードIDの重複チェック
      const duplicateIds = astFromDOM.children.map((node) => node.id).filter((id, index, array) => array.indexOf(id) !== index);

      if (duplicateIds.length > 0) {
        errors.push(`重複したノードIDが見つかりました: ${duplicateIds.join(', ')}`);
      }
    }
  } catch (error) {
    errors.push(`整合性チェック中にエラーが発生しました: ${error}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * ラウンドトリップテスト（AST -> DOM -> AST）を実行します
 * @param originalDoc 元のドキュメント
 * @param docElement contenteditable要素
 */
export function checkRoundTripConsistency(originalDoc: FridgeDocument, docElement: HTMLElement): ASTConsistencyResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // DOMから再構築されたASTを取得
    const reconstructedDoc = parseDocFromDOM(docElement);
    if (!reconstructedDoc) {
      errors.push('DOMからASTの再構築に失敗しました');
      return { isValid: false, errors, warnings };
    }

    // テキスト内容の一致
    if (originalDoc.toPlain() !== reconstructedDoc.toPlain()) {
      errors.push('ラウンドトリップ後のテキスト内容が変更されました');
    }

    // ノード構造の一致
    if (originalDoc.children.length !== reconstructedDoc.children.length) {
      errors.push('ラウンドトリップ後のノード数が変更されました');
    }

    // ノードIDの安定性チェック
    for (let i = 0; i < Math.min(originalDoc.children.length, reconstructedDoc.children.length); i++) {
      const originalNode = originalDoc.children[i];
      const reconstructedNode = reconstructedDoc.children[i];

      if (originalNode.id !== reconstructedNode.id) {
        errors.push(`ノード${i}のIDが変更されました: ${originalNode.id} -> ${reconstructedNode.id}`);
      }

      if (originalNode.type !== reconstructedNode.type) {
        errors.push(`ノード${i}のタイプが変更されました: ${originalNode.type} -> ${reconstructedNode.type}`);
      }
    }
  } catch (error) {
    errors.push(`ラウンドトリップテスト中にエラーが発生しました: ${error}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 選択状態の整合性をチェックします
 * @param docElement contenteditable要素
 * @param expectedSelection 期待される選択状態
 */
export function checkSelectionConsistency(
  docElement: HTMLElement,
  expectedSelection?: {
    nodeId: string;
    offset: number;
    hasSelection?: boolean;
    isCollapsed?: boolean;
  }
): ASTConsistencyResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const currentSelection = getCurrentSelection(docElement);
    const browserSelection = window.getSelection();

    if (expectedSelection) {
      if (!currentSelection) {
        errors.push('選択状態が期待されましたが、選択されていません');
      } else {
        if (currentSelection.start.nodeId !== expectedSelection.nodeId) {
          errors.push(`選択開始ノードが一致しません: 期待="${expectedSelection.nodeId}", 実際="${currentSelection.start.nodeId}"`);
        }

        if (currentSelection.start.offset !== expectedSelection.offset) {
          errors.push(`選択開始位置が一致しません: 期待=${expectedSelection.offset}, 実際=${currentSelection.start.offset}`);
        }
      }
    }

    // ブラウザ選択状態との整合性
    if (browserSelection) {
      const hasSelection = browserSelection.rangeCount > 0;
      const isCollapsed = browserSelection.isCollapsed;

      if (expectedSelection?.hasSelection !== undefined && hasSelection !== expectedSelection.hasSelection) {
        errors.push(`選択の有無が一致しません: 期待=${expectedSelection.hasSelection}, 実際=${hasSelection}`);
      }

      if (expectedSelection?.isCollapsed !== undefined && isCollapsed !== expectedSelection.isCollapsed) {
        errors.push(`選択の折り畳み状態が一致しません: 期待=${expectedSelection.isCollapsed}, 実際=${isCollapsed}`);
      }
    }
  } catch (error) {
    errors.push(`選択状態チェック中にエラーが発生しました: ${error}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * エディタの状態を包括的に検証します
 */
export function validateEditorState(docElement: HTMLElement): ASTConsistencyResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  // DOM-AST整合性チェック
  const domAstResult = checkDOMToASTConsistency(docElement);
  allErrors.push(...domAstResult.errors);
  allWarnings.push(...domAstResult.warnings);

  // 選択状態チェック
  const selectionResult = checkSelectionConsistency(docElement);
  allErrors.push(...selectionResult.errors);
  allWarnings.push(...selectionResult.warnings);

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}

/**
 * AST整合性チェックのカスタムマッチャー
 */
export function expectValidEditorState(docElement: HTMLElement): void {
  const result = validateEditorState(docElement);

  if (!result.isValid) {
    const errorMessage = [
      'エディタ状態の検証に失敗しました:',
      ...result.errors.map((error) => `  - ${error}`),
      ...(result.warnings.length > 0 ? ['警告:'] : []),
      ...result.warnings.map((warning) => `  - ${warning}`),
    ].join('\n');

    throw new Error(errorMessage);
  }
}

/**
 * ドキュメントの内容をアサートします
 * @param expectedText 期待されるテキスト内容
 */
export function expectDocumentContent(expectedText: string): void {
  const currentDoc = getCurrentDocument();
  expect(currentDoc?.toPlain()).toBe(expectedText);
}

/**
 * ドキュメントのノード数をアサートします
 * @param expectedCount 期待されるノード数
 */
export function expectNodeCount(expectedCount: number): void {
  const currentDoc = getCurrentDocument();
  expect(currentDoc?.children.length).toBe(expectedCount);
}

/**
 * 指定されたノードの内容をアサートします
 * @param nodeIndex ノードのインデックス
 * @param expectedText 期待されるテキスト内容
 * @param expectedType 期待されるノードタイプ
 */
export function expectNodeContent(nodeIndex: number, expectedText: string, expectedType?: string): void {
  const currentDoc = getCurrentDocument();
  const node = currentDoc?.children[nodeIndex];

  expect(node).toBeDefined();
  expect(node?.toPlain()).toBe(expectedText);

  if (expectedType) {
    expect(node?.type).toBe(expectedType);
  }
}

/**
 * DOM要素の属性をアサートします
 * @param docElement contenteditable要素
 * @param selector 要素セレクター
 * @param attribute 属性名
 * @param expectedValue 期待される属性値
 */
export function expectElementAttribute(docElement: HTMLElement, selector: string, attribute: string, expectedValue: string): void {
  const element = docElement.querySelector(selector);
  expect(element).toBeTruthy();
  expect(element?.getAttribute(attribute)).toBe(expectedValue);
}
