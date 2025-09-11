import { PM12, vars } from '@sledge/theme';
import { Component, createEffect, createMemo, createSignal } from 'solid-js';
import { configStore } from '~/stores/ConfigStore';
import { editorStore } from '~/stores/EditorStore';
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

  // Escape utility for overlay HTML
  const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  // Produce HTML with newline markers (explicit newlines only)
  const formattedValue = createMemo(() => {
    const val = value();
    if (val.length === 0) return '\u200B'; // zero-width space to keep height
    // const endsWithNewline = val.endsWith('\n');
    const parts = val.split('\n');
    return parts
      .map((line, i) => {
        const showMarker = i < parts.length - 1;
        // 幅0の span を挿入し CSS の ::after で視覚表示。これにより折り返し計算へ影響しない。
        return escapeHtml(line) + (showMarker ? `<span class=\"nl\"></span>` : '');
      })
      .join('\n');
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
        '--editor-fg': vars.color.onBackground,
        '--editor-font-family': `${PM12}`,
        '--editor-selection-bg': vars.color.active,
        '--editor-selection-fg': vars.color.button.textOnAccent,
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
