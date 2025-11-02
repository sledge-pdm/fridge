import { render } from 'solid-js/web';
import EditorTextArea from '~/components/editor/EditorTextArea';
import { FridgeDocument } from '~/features/document/models/FridgeDocument';
import { addDocument, fromId, removeDocument } from '~/features/document/service';
import { editorStore } from '~/stores/EditorStore';

export interface EditorTestContext {
  container: HTMLElement;
  docElement: HTMLElement;
  overlayElement: HTMLElement;
  docId: string;
  cleanup: () => void;
}

/**
 * テスト用のエディタ環境をセットアップします
 * @param initialContent 初期コンテンツ（省略時は空の段落）
 * @param title 初期タイトル（省略可能）
 * @returns エディタのテストコンテキスト
 */
export async function setupEditor(initialContent: string = '', title?: string): Promise<EditorTestContext> {
  // テストコンテナを作成
  const container = document.createElement('div');
  container.setAttribute('data-testid', 'editor-container');
  document.body.appendChild(container);

  // 新しいドキュメントを作成してストアに追加
  const doc = new FridgeDocument(title, initialContent);
  const docId = doc.id;
  addDocument(doc, true);

  // エディタコンポーネントをレンダリング
  const dispose = render(() => EditorTextArea({ docId }), container);

  // DOM要素を取得（レンダリング完了まで待機）
  const waitForElements = async (): Promise<{ docElement: HTMLElement; overlayElement: HTMLElement }> => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const timeout = 2000; // 2秒でタイムアウト

      const checkElements = () => {
        const elapsed = Date.now() - startTime;

        if (elapsed > timeout) {
          reject(new Error(`エディタDOM要素が${timeout}ms以内に作成されませんでした`));
          return;
        }

        const docElement = container.querySelector('#editor-doc-el') as HTMLElement;
        const overlayElement = container.querySelector('#editor-doc-overlay-el') as HTMLElement;

        if (docElement && overlayElement) {
          resolve({ docElement, overlayElement });
        } else {
          setTimeout(checkElements, 10);
        }
      };
      checkElements();
    });
  };

  const { docElement, overlayElement } = await waitForElements();

  // デバッグ情報を出力
  console.log('Setup completed:', {
    hasDocElement: !!docElement,
    hasOverlayElement: !!overlayElement,
    contenteditable: docElement?.getAttribute('contenteditable'),
    docElementId: docElement?.id,
    innerHTML: docElement?.innerHTML.slice(0, 200) + '...',
  });

  // テスト環境でcontenteditable属性を手動で設定
  if (docElement && docElement.getAttribute('contenteditable') !== 'true') {
    docElement.setAttribute('contenteditable', 'true');
    console.log('Manually set contenteditable=true');
  }

  const cleanup = () => {
    dispose();
    removeDocument(docId);
    document.body.removeChild(container);
  };

  return {
    container,
    docElement,
    overlayElement,
    docId,
    cleanup,
  };
}

/**
 * 現在アクティブなドキュメントを取得します
 */
export function getCurrentDocument(): FridgeDocument | undefined {
  return fromId(editorStore.activeDocId);
}

/**
 * 指定されたドキュメントIDのドキュメントを取得します
 */
export function getDocumentById(docId: string): FridgeDocument | undefined {
  return fromId(docId);
}

/**
 * エディタが初期化されるまで待機します
 */
export async function waitForEditorReady(docElement: HTMLElement, timeout = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const checkReady = () => {
      const elapsed = Date.now() - startTime;

      if (elapsed > timeout) {
        reject(
          new Error(
            `エディタが${timeout}ms以内に準備完了しませんでした。contenteditable=${docElement?.getAttribute('contenteditable')}, hasElement=${!!docElement}`
          )
        );
        return;
      }

      if (docElement && docElement.getAttribute('contenteditable') === 'true') {
        resolve();
      } else {
        setTimeout(checkReady, 10);
      }
    };
    checkReady();
  });
}
