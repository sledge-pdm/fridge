import { fonts } from '@sledge/theme';
import { Component, createEffect, createMemo, createSignal, onMount } from 'solid-js';
import { SpanMarkup } from '~/features/markup/SpanMarkup';
import { SearchResult } from '~/features/search/Search';
import { configStore } from '~/stores/ConfigStore';
import { editorStore, getCurrentDocument } from '~/stores/EditorStore';
import '../styles/editor_text_area.css';

interface Props {
  onInput?: (value: string) => void;
  defaultValue?: string;
}

const EditorTextArea: Component<Props> = (props) => {
  let textAreaRef: HTMLTextAreaElement | undefined;
  let overlayRef: HTMLPreElement | undefined;
  let wrapperRef: HTMLDivElement | undefined;

  // Internal value signal mirroring current doc
  const [value, setValue] = createSignal(props.defaultValue || '');

  // SpanMarkup instance for overlay rendering
  const spanMarkup = new SpanMarkup({
    showHalfSpace: true,
    showFullSpace: true,
    showNewline: true,
    highlightSearch: true,
  });

  // Sync from store when document changes
  createEffect(() => {
    const currentDocumentId = editorStore.currentDocumentId;
    const doc = editorStore.documents.find((d) => d.id === currentDocumentId);
    const content = doc?.content || '';
    setValue(content);
    if (textAreaRef) {
      textAreaRef.value = content;
      // Keep focus for seamless switch
      textAreaRef.focus();
    }
  });

  // Auto-resize so outer container (title + editor) handles scrolling
  let lastHeight = 0;
  let resizing = false;
  const resize = () => {
    if (!textAreaRef || !overlayRef) return;
    // 一時的に auto にして実サイズ計測
    overlayRef.style.height = 'auto';
    textAreaRef.style.height = 'auto';
    const h = Math.max(textAreaRef.scrollHeight, overlayRef.scrollHeight);
    overlayRef.style.height = h + 'px';
    textAreaRef.style.height = h + 'px';
  };

  createEffect(() => {
    // trigger on value change (次フレームで resize)
    value();
    requestAnimationFrame(resize);
  });

  // リサイズ (ウィンドウやサイドバー幅変更) を監視
  onMount(() => {
    if (!wrapperRef) return;
    const ro = new ResizeObserver(() => {
      // レイアウト確定後に 1 フレーム遅らせて計測
      requestAnimationFrame(resize);
    });
    ro.observe(wrapperRef);
    return () => ro.disconnect();
  });

  // Generate formatted HTML using SpanMarkup
  const formattedValue = createMemo(() => {
    const val = value();
    // Create memo that tracks both content and search results
    const currentDoc = getCurrentDocument();
    const searchResult: SearchResult = currentDoc?.searchResult ?? {
      query: undefined,
      founds: [],
      count: 0,
    };

    console.log('val: ', val);
    console.log('founds: ', searchResult.founds.join(', '));
    // Use SpanMarkup to generate HTML with search highlighting
    const htmlRes = spanMarkup.toHTML(val, searchResult.founds);
    console.log('html markup: ', htmlRes);
    return htmlRes;
  });

  // 高さは親コンテナスクロール + テキスト折返しに任せるため resize ロジック不要
  createEffect(() => value());

  return (
    <div
      ref={(el) => (wrapperRef = el)}
      class='editor-textarea-wrapper'
      style={{
        '--editor-line-height': `${configStore.lineHeight}`,
        '--editor-font-size': `${configStore.fontSize}px`,
        '--editor-fg': 'var(--color-on-background)',
        '--editor-font-family': `${fonts.PM12}`,
        '--editor-selection-bg': 'var(--color-active)',
        '--editor-selection-fg': 'var(--color-button-text-on-accent)',
      }}
    >
      <textarea
        ref={(el) => (textAreaRef = el)}
        class='editor-textarea'
        wrap='soft'
        placeholder='Start as you mean to go on...'
        onInput={(e) => {
          const v = (e.target as HTMLTextAreaElement).value;
          setValue(v);
          props.onInput?.(v);
        }}
      />
      <pre ref={(el) => (overlayRef = el)} class='editor-overlay' innerHTML={formattedValue()} />
    </div>
  );
};

export default EditorTextArea;
