import { Mark, mergeAttributes } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { DecorationSet } from '@tiptap/pm/view';

export interface SearchHighlightOptions {
  multicolor: boolean;
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    searchHighlight: {
      /**
       * Set search highlights
       */
      setSearchHighlights: (ranges: Array<{ from: number; to: number }>) => ReturnType;
      /**
       * Clear all search highlights
       */
      clearSearchHighlights: () => ReturnType;
    };
  }
}

export const SearchHighlight = Mark.create<SearchHighlightOptions>({
  name: 'searchHighlight',

  addOptions() {
    return {
      multicolor: false,
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      {
        tag: 'mark[data-search-highlight]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'mark',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-search-highlight': '',
        class: 'search-highlight',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setSearchHighlights:
        (ranges) =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            ranges.forEach(({ from, to }) => {
              tr.addMark(from, to, this.type.create());
            });
          }

          return true;
        },
      clearSearchHighlights:
        () =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.removeMark(0, tr.doc.content.size, this.type);
          }

          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    const pluginKey = new PluginKey('searchHighlight');

    return [
      new Plugin({
        key: pluginKey,
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply(tr, decorations) {
            // トランザクションによって装飾を更新
            return decorations.map(tr.mapping, tr.doc);
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

export default SearchHighlight;
