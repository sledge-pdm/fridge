import { css } from '@acab/ecsstatic';
import { Range } from '@tiptap/core';
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
import SearchHighlight from '~/components/editor/tiptap/SearchHighlight';
import { fromId } from '~/features/document/service';
import { editorStore } from '~/stores/EditorStore';
import { eventBus, Events } from '~/utils/EventBus';
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
      SearchHighlight,
    ],
    injectCSS: true,
  }));

  const search = (e: Events['doc:requestSearch']) => {
    const query = e.query;
    const currentEditor = editor();
    if (!currentEditor) return;

    const queryRegexp: RegExp = typeof query === 'string' ? new RegExp(query, 'g') : query;
    let founds: Range[] = [];
    let foundStrings;
    let count = 0;
    while ((foundStrings = queryRegexp.exec(currentEditor.getText())) !== null) {
      founds.push({
        from: queryRegexp.lastIndex - foundStrings[0].length + 1,
        to: queryRegexp.lastIndex + 1,
      });
      count++;
      if (count > 1000) {
        console.log('too many results (>1000). abort.');
        break;
      }
    }

    if (founds.length > 0) {
      // 既存のハイライトをクリア
      currentEditor.commands.clearSearchHighlights();
      currentEditor.commands.setSearchHighlights(founds);
    } else {
      // 検索結果がない場合はハイライトをクリア
      currentEditor.commands.clearSearchHighlights();
    }
  };

  onMount(() => {
    eventBus.on('doc:changed', update);
    eventBus.on('doc:requestSearch', search);
    return () => {
      eventBus.off('doc:changed', update);
      eventBus.off('doc:requestSearch', search);
    };
  });

  createEffect(() => {
    props.docId;
    editorStore.activeDocId;
    update();
  });

  const update = () => {
    const doc = fromId(props.docId);
    if (!doc) return;
    const content = doc.getContent().replace(/\r\n/g, '\n');
    const paragraphs = content.split('\n').map((line) => {
      if (line && line !== '') {
        return {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: line,
            },
          ],
        };
      } else {
        return {
          type: 'paragraph',
        };
      }
    });
    editor()?.commands.setContent(
      {
        type: 'doc',
        content: paragraphs,
      },
      {
        parseOptions: { preserveWhitespace: 'full' },
      }
    );
  };

  return <div class={scrollContent} ref={ref} />;
};

export default DocumentEditor;
