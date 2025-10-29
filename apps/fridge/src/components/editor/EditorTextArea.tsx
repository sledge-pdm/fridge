import { fonts } from '@sledge/theme';
import { Component, createSignal } from 'solid-js';
import { FridgeDocument } from '~/features/document/models/FridgeDocument';
import { parseDocFromDOM, parseHTML } from '~/features/document/parser';
import { configStore } from '~/stores/ConfigStore';
import '~/styles/editor_text_area.css';

interface Props {}

const EditorTextArea: Component<Props> = (props) => {
  let doc = new FridgeDocument('title', 'content\nline\n\nline2');

  // store a serialized selection (paths + offsets) because Range objects point to DOM nodes
  type SerializedRange = {
    startPath: number[];
    startOffset: number;
    endPath: number[];
    endOffset: number;
  };

  const [sel, setSel] = createSignal<SerializedRange | undefined>();

  let editorRoot: HTMLDivElement | undefined;

  const isDescendant = (root: Node, node: Node | null) => {
    while (node) {
      if (node === root) return true;
      node = node.parentNode;
    }
    return false;
  };

  const getPathFromRoot = (root: Node, node: Node): number[] | undefined => {
    if (!isDescendant(root, node)) return undefined;
    const path: number[] = [];
    let cur: Node | null = node;
    while (cur && cur !== root) {
      const parent = cur.parentNode as Node | null;
      if (!parent) break;
      const index = Array.prototype.indexOf.call(parent.childNodes, cur);
      path.unshift(index);
      cur = parent;
    }
    return path;
  };

  const getNodeFromPath = (root: Node, path: number[]): Node | undefined => {
    let cur: Node | undefined = root;
    for (const idx of path) {
      if (!cur || !cur.childNodes || idx < 0 || idx >= cur.childNodes.length) return undefined;
      cur = cur.childNodes[idx] as Node;
    }
    return cur;
  };

  const serializeSelection = (root: Node): SerializedRange | undefined => {
    const selection = document.getSelection();
    if (!selection || selection.rangeCount === 0) return undefined;
    const r = selection.getRangeAt(0);
    const startPath = getPathFromRoot(root, r.startContainer);
    const endPath = getPathFromRoot(root, r.endContainer);
    if (!startPath || !endPath) return undefined;
    return {
      startPath,
      startOffset: r.startOffset,
      endPath,
      endOffset: r.endOffset,
    };
  };

  const restoreSelection = (root: Node, s: SerializedRange) => {
    try {
      const startNode = getNodeFromPath(root, s.startPath);
      const endNode = getNodeFromPath(root, s.endPath);
      if (!startNode || !endNode) return;
      const r = document.createRange();
      // If the stored node is an element, clamp offsets
      const clampOffset = (node: Node, offset: number) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const len = (node as CharacterData).length || 0;
          return Math.max(0, Math.min(offset, len));
        }
        const len = node.childNodes ? node.childNodes.length : 0;
        return Math.max(0, Math.min(offset, len));
      };
      r.setStart(startNode, clampOffset(startNode, s.startOffset));
      r.setEnd(endNode, clampOffset(endNode, s.endOffset));
      const selection = document.getSelection();
      if (!selection) return;
      selection.removeAllRanges();
      selection.addRange(r);
    } catch (e) {
      // swallow - best effort restore
      console.warn('restoreSelection failed', e);
    }
  };

  return (
    <div
      ref={(el) => (editorRoot = el as HTMLDivElement)}
      class='editor-editable'
      style={{
        '--editor-line-height': `${configStore.lineHeight}`,
        '--editor-font-size': `${configStore.fontSize}px`,
        '--editor-fg': 'var(--color-on-background)',
        '--editor-font-family': `${fonts.PM12}`,
        '--editor-selection-bg': 'var(--color-active)',
        '--editor-selection-fg': 'var(--color-button-text-on-accent)',
      }}
      contentEditable={true}
      onInput={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        const docEl = el.children[0];
        if (!docEl) return;

        // serialize selection relative to the document element so we can restore after rerender
        const serialized = serializeSelection(docEl);
        if (serialized) setSel(serialized);
        const newDoc = parseDocFromDOM(docEl as HTMLElement);
        if (newDoc) {
          docEl.replaceWith(parseHTML(newDoc) as Node);
          // restore selection after DOM updates — wait until next paint
          const s = sel();
          if (s) {
            // locate new doc element inside editorRoot after render
            requestAnimationFrame(() => {
              const root = editorRoot?.children[0];
              if (!root) return;
              restoreSelection(root, s);
              setSel(undefined);
            });
          }
        }
      }}
    >
      {parseHTML(doc)}
    </div>
  );
};

export default EditorTextArea;
