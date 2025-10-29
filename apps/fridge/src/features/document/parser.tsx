import { css } from '@acab/ecsstatic';
import { For, JSX } from 'solid-js';
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

export function parseHTML(node: ASTNode, docElId?: string): JSX.Element {
  switch (node.type) {
    case 'document':
      const document = node as FridgeDocument;
      switch (document.mode) {
        case 'ltr':
          return (
            <div data-type={document.type} data-id={document.id} data-mode={document.mode} class={columnDiv} id={docElId}>
              <For each={document.children}>{(child) => parseHTML(child)}</For>
            </div>
          );
        case 'ttb':
          return (
            <div data-type={document.type} data-id={document.id} data-mode={document.mode} class={rowDiv} id={docElId}>
              <For each={document.children}>{(child) => parseHTML(child)}</For>
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
      const content = paragraph.toPlain();
      return (
        <p data-type={paragraph.type} data-id={paragraph.id}>
          {content !== '' ? content : <br />}
        </p>
      );
  }
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

  const mode = (documentRoot.getAttribute('data-mode') as 'ltr' | 'ttb') || undefined;

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
