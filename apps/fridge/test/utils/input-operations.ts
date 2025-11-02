import { page, userEvent } from 'vitest/browser';

/**
 * 指定されたテキストを入力します
 * @param text 入力するテキスト
 */
export async function typeText(text: string): Promise<void> {
  const docElement = document.getElementById('editor-doc-el');

  if (!docElement) {
    throw new Error('エディタのdoc要素が見つかりません');
  }

  await userEvent.keyboard(text);

  // DOM更新とストア更新の完了を待機
  await new Promise((resolve) => requestAnimationFrame(resolve));
  await new Promise((resolve) => setTimeout(resolve, 100));
}

/**
 * Enterキーを押します（改行）
 * @param modifiers 修飾キー ('shift' | 'ctrl' | 'alt')
 */
export async function pressEnter(modifiers?: 'shift' | 'ctrl' | 'alt'): Promise<void> {
  const docElement = document.getElementById('editor-doc-el');

  if (!docElement) {
    throw new Error('エディタのdoc要素が見つかりません');
  }

  // エディタ要素にフォーカスを確実に当てる
  docElement.focus();

  // KeyboardEventを使用して直接keydownイベントを発火
  const keydownEvent = new KeyboardEvent('keydown', {
    key: 'Enter',
    code: 'Enter',
    keyCode: 13,
    which: 13,
    bubbles: true,
    cancelable: true,
    shiftKey: modifiers === 'shift',
    ctrlKey: modifiers === 'ctrl',
    altKey: modifiers === 'alt',
  });

  // keyupイベントも発火
  const keyupEvent = new KeyboardEvent('keyup', {
    key: 'Enter',
    code: 'Enter',
    keyCode: 13,
    which: 13,
    bubbles: true,
    cancelable: true,
    shiftKey: modifiers === 'shift',
    ctrlKey: modifiers === 'ctrl',
    altKey: modifiers === 'alt',
  });

  docElement.dispatchEvent(keydownEvent);
  docElement.dispatchEvent(keyupEvent);

  // キーイベントが処理される時間を待機
  await new Promise((resolve) => setTimeout(resolve, 100));
}

/**
 * Backspaceキーを押します
 * @param count 押す回数
 */
export async function pressBackspace(count: number = 1): Promise<void> {
  const docElement = document.getElementById('editor-doc-el');

  if (!docElement) {
    throw new Error('エディタのdoc要素が見つかりません');
  }

  // エディタ要素にフォーカスを確実に当てる
  docElement.focus();

  for (let i = 0; i < count; i++) {
    await userEvent.keyboard('Backspace');
    // キーイベントが処理される時間を待機
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
}

/**
 * Deleteキーを押します
 * @param count 押す回数
 */
export async function pressDelete(count: number = 1): Promise<void> {
  for (let i = 0; i < count; i++) {
    await userEvent.keyboard('Delete');
  }
}

/**
 * Tabキーを押します
 * @param shift Shift+Tabの場合はtrue
 */
export async function pressTab(shift: boolean = false): Promise<void> {
  if (shift) {
    await userEvent.keyboard('{Shift>}Tab{/Shift}');
  } else {
    await userEvent.keyboard('Tab');
  }
}

/**
 * 矢印キーを押します
 * @param direction 方向
 * @param count 押す回数
 * @param modifiers 修飾キー
 */
export async function pressArrowKey(
  direction: 'up' | 'down' | 'left' | 'right',
  count: number = 1,
  modifiers?: {
    shift?: boolean;
    ctrl?: boolean;
    alt?: boolean;
  }
): Promise<void> {
  const arrowKey = {
    up: 'ArrowUp',
    down: 'ArrowDown',
    left: 'ArrowLeft',
    right: 'ArrowRight',
  }[direction];

  let keySequence = '';
  if (modifiers?.shift) keySequence += '{Shift>}';
  if (modifiers?.ctrl) keySequence += '{Control>}';
  if (modifiers?.alt) keySequence += '{Alt>}';

  keySequence += arrowKey;

  if (modifiers?.alt) keySequence += '{/Alt}';
  if (modifiers?.ctrl) keySequence += '{/Control}';
  if (modifiers?.shift) keySequence += '{/Shift}';

  for (let i = 0; i < count; i++) {
    await userEvent.keyboard(keySequence);
  }
}

/**
 * Homeキーを押します
 * @param ctrl Ctrl+Homeの場合はtrue（文書の先頭へ）
 */
export async function pressHome(ctrl: boolean = false): Promise<void> {
  if (ctrl) {
    await userEvent.keyboard('{Control>}Home{/Control}');
  } else {
    await userEvent.keyboard('Home');
  }
}

/**
 * Endキーを押します
 * @param ctrl Ctrl+Endの場合はtrue（文書の末尾へ）
 */
export async function pressEnd(ctrl: boolean = false): Promise<void> {
  if (ctrl) {
    await userEvent.keyboard('{Control>}End{/Control}');
  } else {
    await userEvent.keyboard('End');
  }
}

/**
 * PageUpキーを押します
 */
export async function pressPageUp(): Promise<void> {
  await userEvent.keyboard('PageUp');
}

/**
 * PageDownキーを押します
 */
export async function pressPageDown(): Promise<void> {
  await userEvent.keyboard('PageDown');
}

/**
 * クリップボード操作を行います
 */
export async function cutToClipboard(): Promise<void> {
  await userEvent.keyboard('{Control>}x{/Control}');
}

export async function copyToClipboard(): Promise<void> {
  await userEvent.keyboard('{Control>}c{/Control}');
}

export async function pasteFromClipboard(): Promise<void> {
  await userEvent.keyboard('{Control>}v{/Control}');
}

/**
 * 全選択を行います
 */
export async function selectAllContent(): Promise<void> {
  await userEvent.keyboard('{Control>}a{/Control}');
}

/**
 * Undo操作を行います
 */
export async function undo(): Promise<void> {
  await userEvent.keyboard('{Control>}z{/Control}');
}

/**
 * Redo操作を行います
 */
export async function redo(): Promise<void> {
  await userEvent.keyboard('{Control>}y{/Control}');
}

/**
 * 指定されたテキストをクリップボードに設定してから貼り付けます
 * @param text 貼り付けるテキスト
 */
export async function pasteText(text: string): Promise<void> {
  const docElement = document.getElementById('editor-doc-el');

  if (!docElement) {
    throw new Error('エディタのdoc要素が見つかりません');
  }

  // エディタ要素にフォーカスを当てる
  docElement.focus();

  // 現在の選択範囲を取得/作成
  const selection = window.getSelection();
  if (!selection) {
    throw new Error('選択状態を取得できません');
  }

  // DataTransferを作成してテキストを設定
  const dataTransfer = new DataTransfer();
  dataTransfer.setData('text/plain', text);

  // pasteイベントを発火
  const pasteEvent = new ClipboardEvent('paste', {
    bubbles: true,
    cancelable: true,
    clipboardData: dataTransfer,
  });

  docElement.dispatchEvent(pasteEvent);

  // イベント処理を待機
  await new Promise((resolve) => setTimeout(resolve, 150));
}

/**
 * 複数行テキストを貼り付けます
 * @param lines 行の配列
 */
export async function pasteLines(lines: string[]): Promise<void> {
  const text = lines.join('\n');
  await pasteText(text);

  // 複数行ペーストは複雑な処理を伴うため十分に待機
  await new Promise((resolve) => setTimeout(resolve, 500));

  // DOM更新の完了を確実にするために追加の処理時間を待機
  await new Promise((resolve) => requestAnimationFrame(resolve));
  await new Promise((resolve) => setTimeout(resolve, 100));
}

/**
 * IME入力のシミュレーション（日本語入力など）
 * @param romaji ローマ字入力
 * @param hiragana ひらがな変換結果
 * @param kanji 漢字変換結果（省略可能）
 */
export async function imeInput(romaji: string, hiragana: string, kanji?: string): Promise<void> {
  // IME入力開始
  const editorElement = page.getByTestId('editor-container');

  // 実際のIME入力は複雑なので、単純化してcompositionイベントを想定
  await userEvent.type(editorElement, romaji);

  // 変換確定の場合
  if (kanji) {
    // 変換処理（実際のIMEでは複雑な処理）
    await pressEnter(); // 変換確定
  }
}

/**
 * 特定のキーコンビネーションを押します
 * @param combination キーコンビネーション（例: 'Ctrl+Shift+A'）
 */
export async function pressKeyCombo(combination: string): Promise<void> {
  // 簡単なパーサー（例: 'Ctrl+Shift+A' -> '{Control>}{Shift>}A{/Shift}{/Control}'）
  const parts = combination.split('+');
  let keySequence = '';
  const modifiers: string[] = [];

  for (let i = 0; i < parts.length - 1; i++) {
    const mod = parts[i].toLowerCase();
    if (mod === 'ctrl' || mod === 'control') {
      modifiers.push('Control');
    } else if (mod === 'shift') {
      modifiers.push('Shift');
    } else if (mod === 'alt') {
      modifiers.push('Alt');
    }
  }

  // 修飾キーを開始
  for (const mod of modifiers) {
    keySequence += `{${mod}>}`;
  }

  // メインキー
  keySequence += parts[parts.length - 1];

  // 修飾キーを終了（逆順）
  for (let i = modifiers.length - 1; i >= 0; i--) {
    keySequence += `{/${modifiers[i]}}`;
  }

  await userEvent.keyboard(keySequence);
}
