import { FoundSpan } from '../search/Search';

/**
 * マークアップオプション
 */
export interface MarkupOptions {
  /** 半角スペースの可視化 */
  showHalfSpace?: boolean;
  /** 全角スペースの可視化 */
  showFullSpace?: boolean;
  /** 改行マーカーの表示 */
  showNewline?: boolean;
  /** 検索結果のハイライト */
  highlightSearch?: boolean;
}

/**
 * トークンの種類
 */
export type TokenType = 'text' | 'half-space' | 'full-space' | 'newline' | 'search-highlight';

/**
 * テキストトークン
 */
export interface TextToken {
  type: TokenType;
  content: string;
  /** 元テキスト内での開始位置 */
  start: number;
  /** 元テキスト内での終了位置 */
  end: number;
  /** 検索ハイライトの場合のインデックス */
  searchIndex?: number;
}

/**
 * SpanMarkup - テキストのマークアップを柔軟に処理するクラス
 */
export class SpanMarkup {
  private options: Required<MarkupOptions>;

  constructor(options: MarkupOptions = {}) {
    this.options = {
      showHalfSpace: options.showHalfSpace ?? false,
      showFullSpace: options.showFullSpace ?? false,
      showNewline: options.showNewline ?? false,
      highlightSearch: options.highlightSearch ?? true,
    };
  }

  /**
   * オプションを更新
   */
  updateOptions(options: Partial<MarkupOptions>): void {
    this.options = { ...this.options, ...options };
  }

  /**
   * テキストをトークンに分解
   */
  tokenize(text: string, searchSpans: FoundSpan[] = []): TextToken[] {
    const tokens: TextToken[] = [];
    let position = 0;

    // 検索範囲をソートして処理しやすくする
    const sortedSearchSpans = [...searchSpans].sort((a, b) => a.start - b.start);
    const processedSpans = new Set<number>();

    while (position < text.length) {
      const char = text[position];

      // 現在位置が未処理の検索範囲の開始位置かチェック
      const searchSpanIndex = sortedSearchSpans.findIndex((span, index) => span.start === position && !processedSpans.has(index));

      if (searchSpanIndex !== -1 && this.options.highlightSearch) {
        // 検索ハイライト範囲を処理（範囲内でも特殊文字を分割）
        const span = sortedSearchSpans[searchSpanIndex];
        let spanPosition = span.start;

        while (spanPosition < span.end) {
          const spanChar = text[spanPosition];

          if (spanChar === ' ' && this.options.showHalfSpace) {
            // 検索範囲内の半角スペース
            tokens.push({
              type: 'half-space',
              content: ' ',
              start: spanPosition,
              end: spanPosition + 1,
            });
            spanPosition++;
          } else if (spanChar === '　' && this.options.showFullSpace) {
            // 検索範囲内の全角スペース
            tokens.push({
              type: 'full-space',
              content: '　',
              start: spanPosition,
              end: spanPosition + 1,
            });
            spanPosition++;
          } else if (spanChar === '\n' && this.options.showNewline) {
            // 検索範囲内の改行
            tokens.push({
              type: 'newline',
              content: '\n',
              start: spanPosition,
              end: spanPosition + 1,
            });
            spanPosition++;
          } else {
            // 検索範囲内の通常テキスト（連続する文字をまとめる）
            let textContent = '';
            let textStart = spanPosition;

            while (spanPosition < span.end) {
              const currentChar = text[spanPosition];

              // 特殊文字に達したら停止
              if (
                (currentChar === ' ' && this.options.showHalfSpace) ||
                (currentChar === '　' && this.options.showFullSpace) ||
                (currentChar === '\n' && this.options.showNewline)
              ) {
                break;
              }

              textContent += currentChar;
              spanPosition++;
            }

            if (textContent) {
              tokens.push({
                type: 'search-highlight',
                content: textContent,
                start: textStart,
                end: spanPosition,
                searchIndex: searchSpanIndex,
              });
            }
          }
        }

        processedSpans.add(searchSpanIndex);
        position = span.end;
      } else if (char === ' ' && this.options.showHalfSpace) {
        // 半角スペース
        tokens.push({
          type: 'half-space',
          content: ' ',
          start: position,
          end: position + 1,
        });
        position++;
      } else if (char === '　' && this.options.showFullSpace) {
        // 全角スペース
        tokens.push({
          type: 'full-space',
          content: '　',
          start: position,
          end: position + 1,
        });
        position++;
      } else if (char === '\n' && this.options.showNewline) {
        // 改行
        tokens.push({
          type: 'newline',
          content: '\n',
          start: position,
          end: position + 1,
        });
        position++;
      } else {
        // 通常のテキスト（連続する文字をまとめる）
        let textContent = '';
        let textStart = position;

        while (position < text.length) {
          const currentChar = text[position];

          // 検索範囲の開始点に達したら停止
          const nextSearchStart = sortedSearchSpans.find((span, index) => span.start === position && !processedSpans.has(index));
          if (nextSearchStart && this.options.highlightSearch) break;

          // 特殊文字に達したら停止
          if (
            (currentChar === ' ' && this.options.showHalfSpace) ||
            (currentChar === '　' && this.options.showFullSpace) ||
            (currentChar === '\n' && this.options.showNewline)
          ) {
            break;
          }

          textContent += currentChar;
          position++;
        }

        if (textContent) {
          tokens.push({
            type: 'text',
            content: textContent,
            start: textStart,
            end: position,
          });
        }
      }
    }

    return tokens;
  }

  /**
   * トークンをHTMLに変換
   */
  tokensToHTML(tokens: TextToken[]): string {
    return tokens
      .map((token) => {
        switch (token.type) {
          case 'text':
            return this.escapeHtml(token.content);

          case 'half-space':
            return '<span class="hs">.</span>';

          case 'full-space':
            return '<span class="fs">・</span>';

          case 'newline':
            return '<span class="nl"></span><br/>';

          case 'search-highlight':
            return `<span class="search-highlight" data-search-index="${token.searchIndex}">${this.escapeHtml(token.content)}</span>`;

          default:
            return this.escapeHtml(token.content);
        }
      })
      .join('');
  }

  /**
   * テキストを直接HTMLに変換（簡単なインターフェース）
   */
  toHTML(text: string, searchSpans: FoundSpan[] = []): string {
    if (!text) return '\u200B'; // zero-width space to keep height

    const tokens = this.tokenize(text, searchSpans);
    return this.tokensToHTML(tokens);
  }

  /**
   * HTMLエスケープ
   */
  private escapeHtml(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}

/**
 * デフォルトインスタンス
 */
export const defaultSpanMarkup = new SpanMarkup();
