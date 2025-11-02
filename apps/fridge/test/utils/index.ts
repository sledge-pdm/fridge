// エディタセットアップ関連
export * from './setup-editor';

// カーソル・選択操作関連
export * from './cursor-selection';

// 入力操作関連
export * from './input-operations';

// 検証・アサーション関連
export * from './assertions';

// 便利な統合関数
import { expectValidEditorState } from './assertions';
import { setCursorPosition } from './cursor-selection';
import { typeText } from './input-operations';
import { EditorTestContext, setupEditor, waitForEditorReady } from './setup-editor';

/**
 * 基本的なテストシナリオ用のヘルパー関数
 */
export async function createEditorWithText(initialText: string, title?: string): Promise<EditorTestContext> {
  const context = await setupEditor(initialText, title);
  await waitForEditorReady(context.docElement);
  return context;
}

/**
 * テキスト入力後の状態検証を行うヘルパー
 */
export async function typeAndValidate(context: EditorTestContext, text: string, nodeId?: string, offset?: number): Promise<void> {
  if (nodeId !== undefined && offset !== undefined) {
    await setCursorPosition(context.docElement, nodeId, offset);
  }

  await typeText(text);
  expectValidEditorState(context.docElement);
}

/**
 * 完全なテストシナリオのテンプレート
 */
export interface TestScenario {
  name: string;
  setup: {
    initialContent: string;
    title?: string;
    cursorPosition?: { nodeId: string; offset: number };
  };
  operations: Array<{
    type: 'type' | 'key' | 'select' | 'paste';
    data: any;
  }>;
  expected: {
    content: string;
    nodeCount?: number;
    selection?: { nodeId: string; offset: number };
  };
}

/**
 * テストシナリオを実行するヘルパー
 */
export async function runTestScenario(scenario: TestScenario): Promise<void> {
  const context = await createEditorWithText(scenario.setup.initialContent, scenario.setup.title);

  try {
    // 初期カーソル位置設定
    if (scenario.setup.cursorPosition) {
      await setCursorPosition(context.docElement, scenario.setup.cursorPosition.nodeId, scenario.setup.cursorPosition.offset);
    }

    // 操作実行
    for (const operation of scenario.operations) {
      switch (operation.type) {
        case 'type':
          await typeText(operation.data);
          break;
        // 他の操作タイプも追加可能
      }
    }

    // 結果検証
    expectValidEditorState(context.docElement);

    // 追加の期待値チェックは呼び出し元で実装
  } finally {
    context.cleanup();
  }
}
