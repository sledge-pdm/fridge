import { clsx } from '@sledge/core';
import { JSX } from 'solid-js';
import { fullSpace, halfSpace, newLine, normalText } from '~/features/markup/markupStyles';

export interface MarkupOptions {
  showHalfSpace?: boolean;
  showFullSpace?: boolean;
  showNewline?: boolean;
  highlightSearch?: boolean;
}

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

  updateOptions(options: Partial<MarkupOptions>): void {
    this.options = { ...this.options, ...options };
  }

  readonly spanSymbol = [' ', '　', '\n'];

  getSymbolSpan(char: string, baseClass: string) {
    if (char === ' ' && this.options.showHalfSpace) {
      return <span class={clsx(baseClass, halfSpace)}>.</span>;
    } else if (char === '　' && this.options.showFullSpace) {
      return <span class={clsx(baseClass, fullSpace)}>・</span>;
    } else if (char === '\n' && this.options.showNewline) {
      return <span class={clsx(baseClass, newLine)}></span>;
    }
    return null;
  }

  toJSX(text: string, baseClass: string): JSX.Element {
    if (!text) return <>{'\u200B'}</>; // zero-width space to keep height

    const texts: string[] = text.split('');

    let aggregatedNormalText: string = '';
    const nodes: (string | JSX.Element)[] = texts
      .flatMap((ch, i) => {
        const isLast = i === text.length - 1;
        const isThisNormal = !this.spanSymbol.includes(text[i]);
        if (isThisNormal) aggregatedNormalText += ch;
        const isEndOfNormalAggregate = isLast || !isThisNormal;
        let normalSpan = null;
        if (isEndOfNormalAggregate) {
          normalSpan = <span class={clsx(baseClass, normalText)}>{aggregatedNormalText}</span>;
          aggregatedNormalText = '';
        }
        let symbolSpan = this.getSymbolSpan(ch, baseClass);

        return [normalSpan, symbolSpan];
      })
      .filter((n) => n !== null);

    return <>{nodes}</>;
  }
}

export const defaultSpanMarkup = new SpanMarkup();
