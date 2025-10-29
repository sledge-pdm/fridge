import { css } from '@acab/ecsstatic';
import { JSX } from 'solid-js';
import { ASTNode } from '~/features/document/models/ASTNode';
import { Heading } from '~/features/document/models/blocks/Heading';
import { Image } from '~/features/document/models/blocks/Image';
import { Paragraph } from '~/features/document/models/blocks/Paragraph';
import { FridgeDocument } from '~/features/document/models/FridgeDocument';

const columnDiv = css`
  display: flex;
  flex-direction: column;
`;
const rowDiv = css`
  display: flex;
  flex-direction: row;
`;
const inlineDiv = css`
  display: inline;
`;

export function parseHTML(node: ASTNode): JSX.Element {
  switch (node.type) {
    case 'document':
      const document = node as FridgeDocument;
      switch (document.mode) {
        case 'rtl':
          return (
            <div data-type={document.type} data-id={document.id} data-mode={document.mode} class={columnDiv}>
              {document.children.map((child) => parseHTML(child))}
            </div>
          );
        case 'ttb':
          return (
            <div data-type={document.type} data-id={document.id} data-mode={document.mode} class={rowDiv}>
              {document.children.map((child) => parseHTML(child))}
            </div>
          );
      }

    // block
    case 'heading':
      const heading = node as Heading;
      switch (heading.level) {
        case 1:
          return (
            <h1 data-type={heading.type} data-id={heading.id}>
              {heading.toPlain()}
            </h1>
          );
        case 2:
          return (
            <h2 data-type={heading.type} data-id={heading.id}>
              {heading.toPlain()}
            </h2>
          );
        case 3:
          return (
            <h3 data-type={heading.type} data-id={heading.id}>
              {heading.toPlain()}
            </h3>
          );
        case 4:
          return (
            <h4 data-type={heading.type} data-id={heading.id}>
              {heading.toPlain()}
            </h4>
          );
      }
    case 'image':
      const image = node as Image;
      return <></>; // wip
    case 'paragraph':
      const paragraph = node as Paragraph;
      return (
        <p data-type={paragraph.type} data-id={paragraph.id}>
          {paragraph.toPlain()}
        </p>
      );
  }
}

// Simple shape for extracted nodes from DOM. We keep it minimal so it can be
// adapted to the real ASTNode types elsewhere.
export type ExtractedNode = {
  type: string;
  id?: string;
  children: ExtractedNode[];
};

/**
 * Recursively walk a DOM subtree starting at `root` and extract nodes that
 * contain `data-type` (and optional `data-id`). Returns a tree of
 * `ExtractedNode` objects mirroring the DOM structure of elements that have
 * `data-type`.
 *
 * Notes:
 * - This intentionally ignores diffs and content; it's a simple extraction.
 * - Only element nodes are considered. Text nodes are ignored unless wrapped
 *   in an element with `data-type`.
 */
export function extractNodesFromDOM(root: HTMLElement): ExtractedNode[] {
  const out: ExtractedNode[] = [];

  function walk(el: Element): ExtractedNode | null {
    const type = el.getAttribute('data-type');
    const id = el.getAttribute('data-id') || undefined;

    // Process children first to build a children array
    const childNodes: ExtractedNode[] = [];
    for (let i = 0; i < el.children.length; i++) {
      const child = el.children.item(i)!;
      const res = walk(child);
      if (res) childNodes.push(res);
    }

    if (type) {
      return { type, id, children: childNodes };
    }

    // If this element doesn't have data-type, but some children did, we don't
    // create a node for this element — we return null so callers attach only
    // the meaningful nodes.
    if (childNodes.length > 0) {
      // If element itself has no type but has multiple meaningful children,
      // return a pseudo-node that groups them under an anonymous container.
      return { type: 'container', id: undefined, children: childNodes };
    }
    return null;
  }

  for (let i = 0; i < root.children.length; i++) {
    const child = root.children.item(i)!;
    const node = walk(child);
    if (node) out.push(node);
  }

  return out;
}

/**
 * Parse a DOM subtree where the root element represents a document
 * (i.e. has data-type="document"). Returns a FridgeDocument instance or
 * undefined when the provided root is not a document element.
 *
 * Behavior:
 * - Reads `data-mode` on the root to set the document mode (if present).
 * - For each child element with data-type 'heading', 'paragraph', 'text',
 *   creates corresponding AST nodes and appends them to the document.
 * - If the DOM provides data-id attributes, they override the generated ids
 *   on the created AST nodes.
 */
export function parseDocFromDOM(documentRoot: HTMLElement): FridgeDocument | undefined {
  const rootType = documentRoot.getAttribute('data-type');
  if (rootType !== 'document') return undefined;

  const mode = (documentRoot.getAttribute('data-mode') as 'rtl' | 'ttb') || undefined;

  // Create a minimal FridgeDocument. We need to provide title and content to the
  // constructor, but that constructor will push children based on the provided
  // content. To avoid duplicating that logic, we'll create an empty document and
  // then replace its children.
  const doc = new FridgeDocument(undefined, '');
  if (mode) doc.mode = mode;

  // Helper to set id on an ASTNode-like object if data-id present
  function applyId(node: any, el: Element) {
    const did = el.getAttribute('data-id');
    if (did) node.id = did;
  }

  const children: any[] = [];

  for (let i = 0; i < documentRoot.children.length; i++) {
    const el = documentRoot.children.item(i)!;
    const type = el.getAttribute('data-type');

    if (!type) continue;

    if (type === 'heading') {
      // level may be provided as data-level, fallback to 1
      const lvlAttr = el.getAttribute('data-level');
      const level = lvlAttr ? (Number(lvlAttr) as 1 | 2 | 3 | 4) : 1;
      // text content: prefer innerText of the heading element
      const text = el.textContent || '';
      const heading = new Heading(text, level);
      applyId(heading, el);
      children.push(heading);
      continue;
    }

    if (type === 'paragraph') {
      // Collect inline text children; simple strategy: take the concatenated
      // textContent of this paragraph element.
      const text = el.textContent || '';
      const para = new Paragraph(text);
      applyId(para, el);
      // If paragraph element has an inner element with data-id for the text,
      // apply that id to the inline node as well.
      const innerTextEl = el.querySelector('[data-type="text"]');
      if (innerTextEl) applyId(para, innerTextEl);
      children.push(para);
      continue;
    }

    // other types (image, etc.) are ignored for now
  }

  doc.children = children;
  // override id of document if provided
  const rootId = documentRoot.getAttribute('data-id');
  if (rootId) doc.id = rootId;

  return doc;
}
