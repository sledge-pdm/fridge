export type SelectionPath = {
  startPath: number[];
  startOffset: number;
  endPath: number[];
  endOffset: number;
  isCollapsed: boolean;
};

function nodeToPath(root: Node, node: Node): number[] {
  const path: number[] = [];
  let cur: Node | null = node;
  while (cur && cur !== root) {
    const parent: Node | null = cur.parentNode;
    if (!parent) break;
    // find index among parent's childNodes
    let idx = -1;
    for (let i = 0; i < parent.childNodes.length; i++) {
      if (parent.childNodes.item(i) === cur) {
        idx = i;
        break;
      }
    }
    if (idx === -1) break;
    path.unshift(idx);
    cur = parent;
  }
  return path;
}

function pathToNode(root: Node, path: number[]): Node | null {
  let cur: Node | null = root;
  for (let i = 0; i < path.length; i++) {
    const idx = path[i];
    if (!cur) return null;
    if (idx < 0 || idx >= cur.childNodes.length) return null;
    cur = cur.childNodes.item(idx) || null;
  }
  return cur;
}

export function saveSelection(root: Node): SelectionPath | null {
  const sel = (window.getSelection && window.getSelection()) || null;
  if (!sel || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0);

  const startNode = range.startContainer;
  const endNode = range.endContainer;

  const startPath = nodeToPath(root, startNode);
  const endPath = nodeToPath(root, endNode);

  return {
    startPath,
    startOffset: range.startOffset,
    endPath,
    endOffset: range.endOffset,
    isCollapsed: sel.isCollapsed,
  };
}

export function restoreSelection(root: Node, selPath: SelectionPath | null) {
  if (!selPath) return;

  const { startPath, startOffset, endPath, endOffset } = selPath;
  const startNode = pathToNode(root, startPath);
  const endNode = pathToNode(root, endPath);
  if (!startNode || !endNode) return;

  const range = document.createRange();
  try {
    range.setStart(
      startNode,
      Math.min(startOffset, startNode.nodeType === Node.TEXT_NODE ? (startNode.textContent?.length ?? 0) : startNode.childNodes.length)
    );
    range.setEnd(endNode, Math.min(endOffset, endNode.nodeType === Node.TEXT_NODE ? (endNode.textContent?.length ?? 0) : endNode.childNodes.length));
  } catch (e) {
    // if offsets are invalid for node types, try to clamp
    try {
      range.setStart(startNode, 0);
      range.setEnd(endNode, 0);
    } catch (e) {
      return;
    }
  }

  const sel = window.getSelection && window.getSelection();
  if (!sel) return;
  sel.removeAllRanges();
  sel.addRange(range);
}
