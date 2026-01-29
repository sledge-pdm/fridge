
# Vitest Browser Mode & Interactivity API まとめ

## 概要
- Vitestのbrowser modeは、実際のブラウザ環境（Playwright/WebdriverIO/Preview）でテストを実行し、window/document等のグローバルにアクセス可能。
- DOM操作やユーザー操作（クリック・入力・選択・DnD・クリップボード等）を「本物のブラウザ挙動」として再現できる。
- テストは`vitest/browser`の`userEvent`や`page` APIを使って記述する。

## セットアップ例
```ts
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
	test: {
		browser: {
			provider: playwright(),
			enabled: true,
			instances: [
				{ browser: 'chromium' },
			],
			headless: true, // CI等ではtrue推奨
		},
	},
});
```

## 主要API（`vitest/browser`）
- `userEvent`: 実際のユーザー操作を再現するAPI群
- `page`: DOM要素の取得や画面操作用のロケータAPI

### userEventの主なメソッド
| 操作 | メソッド例 | 備考 |
|---|---|---|
| クリック | `await userEvent.click(el)` | 単/複/三連クリックも可 |
| 入力 | `await userEvent.type(el, 'abc')`<br>`await userEvent.fill(el, 'abc')` | typeはキーイベント、fillは値直接セット |
| キーボード | `await userEvent.keyboard('{Enter}')` | IMEや修飾キーも対応 |
| タブ移動 | `await userEvent.tab()` | Shift+Tabも可 |
| 選択肢選択 | `await userEvent.selectOptions(el, 'val')` | select要素用 |
| ホバー | `await userEvent.hover(el)`<br>`await userEvent.unhover(el)` | |
| DnD | `await userEvent.dragAndDrop(src, dst)` | draggable属性必須 |
| クリア | `await userEvent.clear(el)` | 入力欄の内容消去 |
| コピー/カット/貼付 | `await userEvent.copy()`<br>`await userEvent.cut()`<br>`await userEvent.paste()` | 選択状態必須 |

### pageの主なメソッド
- `page.getByRole`, `page.getByLabelText`, `page.getByText` などで要素取得
- `page.viewport(width, height)` で画面サイズ変更
- `page.screenshot()` でスクリーンショット

## テスト記述例
```ts
import { test, expect } from 'vitest';
import { page, userEvent } from 'vitest/browser';

test('contenteditableでの入力', async () => {
	const editor = page.getByTestId('editor');
	await userEvent.click(editor);
	await userEvent.keyboard('Hello');
	await expect.element(editor).toHaveTextContent('Hello');
});

test('Enterキーで改行', async () => {
	const editor = page.getByTestId('editor');
	await userEvent.click(editor);
	await userEvent.keyboard('abc');
	await userEvent.keyboard('{Enter}def');
	await expect.element(editor).toHaveTextContent(/abc.*def/s);
});

test('複数行選択→カット→貼付', async () => {
	const editor = page.getByTestId('editor');
	await userEvent.click(editor);
	await userEvent.keyboard('line1{Enter}line2{Enter}line3');
	// 2行選択（例: Shift+↓）
	await userEvent.keyboard('{Shift>}{ArrowUp}{/Shift}');
	await userEvent.cut();
	await userEvent.paste();
	// 内容検証
});
```

## 注意点
- 必ず`userEvent`経由で操作すること（`@testing-library/user-event`は使わない）
- contenteditableや特殊なノード構造では、fill/type/keyboard/dragAndDrop/clipboard系APIを適切に使い分ける
- Playwright/WebdriverIOの制約や挙動差異にも注意

---
より詳細なAPIやサンプルは[公式Interactivity API](https://vitest.dev/guide/browser/interactivity-api.html)を参照。
