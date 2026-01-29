import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export interface BrMarkerOptions {
  className: string;
  includeHardBreak: boolean;
  showAtEndOfDoc: boolean;
}

const DEFAULT_OPTIONS: BrMarkerOptions = {
  className: 'tiptap-br-marker',
  includeHardBreak: true,
  showAtEndOfDoc: false,
};

export const BrMarker = Extension.create<BrMarkerOptions>({
  name: 'brMarker',

  addOptions() {
    return DEFAULT_OPTIONS;
  },

  addProseMirrorPlugins() {
    const pluginKey = new PluginKey('brMarker');

    const buildDecorations = (doc: Parameters<typeof DecorationSet.create>[0]) => {
      const decorations: Decoration[] = [];
      const endOfDoc = doc.content.size;

      doc.descendants((node, pos) => {
        if (node.type.name === 'paragraph') {
          const endPos = pos + node.nodeSize - 1;
          const isLastBlock = pos + node.nodeSize === endOfDoc;
          if (!this.options.showAtEndOfDoc && isLastBlock) {
            return;
          }

          decorations.push(
            Decoration.widget(
              endPos,
              () => {
                const span = document.createElement('span');
                span.className = this.options.className;
                return span;
              },
              { side: 1 }
            )
          );
        }

        if (this.options.includeHardBreak && node.type.name === 'hardBreak') {
          const brPos = pos + 1;
          decorations.push(
            Decoration.widget(
              brPos,
              () => {
                const span = document.createElement('span');
                span.className = this.options.className;
                return span;
              },
              { side: 1 }
            )
          );
        }
      });

      return DecorationSet.create(doc, decorations);
    };

    return [
      new Plugin({
        key: pluginKey,
        state: {
          init: (_, { doc }) => buildDecorations(doc),
          apply: (tr, old, _oldState, newState) => {
            if (tr.docChanged) {
              return buildDecorations(newState.doc);
            }
            return old.map(tr.mapping, tr.doc);
          },
        },
        props: {
          decorations(state) {
            return pluginKey.getState(state);
          },
        },
      }),
    ];
  },
});

export default BrMarker;
