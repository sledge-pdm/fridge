// Lightweight SelectionMapper: DOM Range <-> { nodeId, offset } 双方向マッピング
// 実装は parseHTML 側が各ブロック要素に `data-node-id` を付与していることを前提とします。

import { findNodeElementById } from '~/features/document/service';

export type NodePosition = {
  nodeId: string;
  offset: number;
};

export type SerializedSelection = {
  start: NodePosition;
  end: NodePosition;
};

// locate a Range's start/end into NodePosition using nearest ancestor with data-node-id
export function locateRange(root: HTMLElement, range: Range): NodePosition | null {
  if (!range) return null;
  const container = range.startContainer;
  let el: Node | null = container;

  while (el && el !== root) {
    if (el.nodeType === Node.ELEMENT_NODE) {
      const cast = el as HTMLElement;
      const id = cast.getAttribute('data-node-id');
      if (id) {
        // compute offset relative to this element's textContent
        // naive approach: count characters from start of element to range.start
        const walker = document.createTreeWalker(cast, NodeFilter.SHOW_TEXT, null);
        let offset = 0;
        let node: Node | null = walker.nextNode();
        while (node) {
          if (node === container) {
            offset += range.startOffset;
            return { nodeId: id, offset };
          }
          offset += node.textContent?.length ?? 0;
          node = walker.nextNode();
        }
        // fallback: use startOffset with container if it's a direct child
        return { nodeId: id, offset: range.startOffset };
      }
    }
    el = el.parentNode;
  }
  return null;
}

export function createRangeFromPosition(root: HTMLElement, pos: NodePosition): Range | null {
  const el = findNodeElementById(root, pos.nodeId);
  if (!el) return null;

  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
  let node: Node | null = walker.nextNode();
  let remaining = pos.offset;
  while (node) {
    const len = node.textContent?.length ?? 0;
    if (remaining <= len) {
      const r = document.createRange();
      r.setStart(node, remaining);
      r.setEnd(node, remaining);
      return r;
    }
    remaining -= len;
    node = walker.nextNode();
  }

  // If offset is at end, place at end of last text node or element
  const r = document.createRange();
  r.selectNodeContents(el);
  r.collapse(false);
  return r;
}

export function getCurrentSerializedSelection(root: HTMLElement): SerializedSelection | null {
  const sel = window.getSelection && window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0);

  const start = locateRange(root, range);
  // map end similarly (for now use same start as simplification)
  const end: NodePosition | null = (() => {
    const endRange = document.createRange();
    endRange.setStart(range.endContainer, range.endOffset);
    return locateRange(root, endRange);
  })();

  if (!start || !end) return null;
  return { start, end };
}

export function restoreSelectionMapped(root: HTMLElement, sel: SerializedSelection | null) {
  if (!sel) return;
  const { start, end } = sel;
  const rStart = createRangeFromPosition(root, start);
  const rEnd = createRangeFromPosition(root, end);
  if (!rStart || !rEnd) return;
  const range = document.createRange();
  try {
    range.setStart(rStart.startContainer, rStart.startOffset);
    range.setEnd(rEnd.startContainer, rEnd.startOffset);
  } catch (e) {
    return;
  }
  const s = window.getSelection && window.getSelection();
  if (!s) return;
  s.removeAllRanges();
  s.addRange(range);
}
