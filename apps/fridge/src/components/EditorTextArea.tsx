import { PM12, vars } from '@sledge/theme';
import { Component, createEffect } from 'solid-js';
import { configStore } from '~/stores/ConfigStore';
import { editorStore } from '~/stores/EditorStore';

interface Props {
  onInput?: (value: string) => void;
  defaultValue?: string;
}

const EditorTextArea: Component<Props> = (props) => {
  let textAreaRef: HTMLTextAreaElement | undefined;

  createEffect(() => {
    const currentDocumentId = editorStore.currentDocumentId;
    const doc = editorStore.documents.find((d) => d.id === currentDocumentId);

    if (!textAreaRef) return;
    textAreaRef.value = doc?.content || '';
    textAreaRef.focus();
  });

  return (
    <textarea
      ref={(el) => (textAreaRef = el)}
      style={{
        width: '100%',
        height: '100%',
        background: 'none',
        border: 'none',
        'box-sizing': 'border-box',
        'font-size': '12px',
        padding: '24px 16px',
        'scroll-padding': '24px 16px',
        'font-family': `${PM12}`,
        color: vars.color.onBackground,
        outline: 'none',
        resize: 'none',
        overflow: 'visible',

        'line-height': `${configStore.lineHeight}`,
      }}
      wrap='soft'
      placeholder='Start as you mean to go on...'
      onInput={(e) => props.onInput?.((e.target as HTMLTextAreaElement).value)}
    >
      {props.defaultValue}
    </textarea>
  );
};

export default EditorTextArea;
