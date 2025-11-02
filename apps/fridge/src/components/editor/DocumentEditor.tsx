import { css } from '@acab/ecsstatic';
import Document from '@tiptap/extension-document';
import InvisibleCharacters from '@tiptap/extension-invisible-characters';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { UndoRedo } from '@tiptap/extensions';
import { Component, createEffect, onMount } from 'solid-js';
import { createTiptapEditor } from 'solid-tiptap';
import { paragraphContent } from '~/components/editor/nodeStyles';
import FullSpaceCharacter from '~/components/editor/tiptap/FullSpaceCharacter';
import HalfSpaceCharacter from '~/components/editor/tiptap/HalfSpaceCharacter';
import { fromId } from '~/features/document/service';
import { FoundSpan } from '~/features/search/Search';
import { editorStore } from '~/stores/EditorStore';
import { eventBus } from '~/utils/EventBus';
import './tiptap/tiptap-styles.css';

const scrollContent = css`
  overflow-y: auto;
  width: 100%;

  &::-webkit-scrollbar {
    width: 2px;
    background-color: transparent;
  }

  &::-webkit-thumb {
    background-color: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #888;
  }
`;

export const editorContent = css`
  height: 100%;
  min-height: 100%;
  height: auto;
  outline: none;
  padding: 16px 28px;
  scroll-padding: 16px 28px;
  overflow: hidden;

  /* テキスト選択時の色 (Firefox用 ::-moz-selection も) */
  &::selection {
    background: var(--color-accent);
    color: var(--color-button-text-on-accent, #000);
  }
`;

interface Props {
  docId: string;
}

const DocumentEditor: Component<Props> = (props) => {
  let ref!: HTMLDivElement;

  const editor = createTiptapEditor(() => ({
    editorProps: {
      attributes: {
        class: editorContent,
      },
    },
    element: ref!,
    extensions: [
      UndoRedo,
      Document,
      Paragraph.configure({
        HTMLAttributes: {
          class: paragraphContent,
        },
      }),
      Text,
      InvisibleCharacters.configure({ builders: [new HalfSpaceCharacter(), new FullSpaceCharacter()] }),
    ],
    injectCSS: true,
    onUpdate: (e) => {
      eventBus.emit('doc:changed', {
        id: props.docId,
      });
    },
  }));

  onMount(() => {
    eventBus.on('doc:changed', update);
    return () => {
      eventBus.off('doc:changed', update);
    };
  });

  createEffect(() => {
    props.docId;
    editorStore.activeDocId;
    update();
  });

  createEffect(() => {
    const searchStates = editorStore.searchStates;
    const result = searchStates.get(props.docId);
    if (result) {
      console.log(result);
      result.founds.forEach((found: FoundSpan) => {
        // found: found range (start-end) in entire content string
      });
    }
  });

  const update = () => {
    const doc = fromId(props.docId);
    if (!doc) return;
    const content = doc.getContent().replace('/\r\n/g', '\n');
    const paragraphs = content.split('\n').map((line) => {
      if (line && line !== '') {
        return {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: line + '\r',
            },
          ],
        };
      } else {
        return {
          type: 'paragraph',
        };
      }
    });
    editor()?.commands.setContent({
      type: 'doc',
      content: paragraphs,
    });
  };

  return <div class={scrollContent} ref={ref} />;
};

export default DocumentEditor;
