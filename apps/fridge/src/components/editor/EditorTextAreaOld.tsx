import { fonts } from '@sledge/theme';
import { Accessor, Component, createEffect, createMemo, onMount } from 'solid-js';
import { SpanMarkup } from '~/features/markup/SpanMarkup';
import { SearchResult } from '~/features/search/Search';
import { configStore } from '~/stores/ConfigStore';
import { editorStore } from '~/stores/EditorStore';
import '~/styles/editor_text_area.css';

interface Props {
  onInput?: (value: string) => void;
  docId: Accessor<string | undefined>;
  content: Accessor<string>;
}

const EditorTextAreaOld: Component<Props> = (props) => {
  let textAreaRef: HTMLTextAreaElement | undefined;
  let overlayRef: HTMLPreElement | undefined;
  let wrapperRef: HTMLDivElement | undefined;

  // SpanMarkup instance for overlay rendering
  const spanMarkup = new SpanMarkup({
    showHalfSpace: true,
    showFullSpace: true,
    showNewline: true,
    highlightSearch: true,
  });

  // Sync from store when document changes
  createEffect(() => {
    const content = props.content();
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
    props.content();
    requestAnimationFrame(resize);
  });

  onMount(() => {
    if (!wrapperRef) return;
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(resize);
    });
    ro.observe(wrapperRef);
    return () => ro.disconnect();
  });

  // Generate formatted HTML using SpanMarkup
  const formattedValue = createMemo(() => {
    // FIXME: Note that this will load other document's result...
    const searchResult: SearchResult = editorStore.searchStates.get(props.docId() ?? '') ?? {
      query: undefined,
      founds: [],
      count: 0,
    };

    // Use SpanMarkup to generate HTML with search highlighting
    const htmlRes = spanMarkup.toHTML(props.content(), searchResult.founds);
    return htmlRes;
  });

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
          props.onInput?.(v);
        }}
      />
      <pre ref={(el) => (overlayRef = el)} class='editor-overlay' innerHTML={formattedValue()} />
    </div>
  );
};

export default EditorTextAreaOld;
