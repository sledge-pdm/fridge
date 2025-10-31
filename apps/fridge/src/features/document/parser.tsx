import { css } from '@acab/ecsstatic';
import { For, JSX } from 'solid-js';
import { ASTNode } from '~/features/document/models/ASTNode';
import { Heading } from '~/features/document/models/blocks/Heading';
import { Image } from '~/features/document/models/blocks/Image';
import { Paragraph } from '~/features/document/models/blocks/Paragraph';
import { FridgeDocument } from '~/features/document/models/FridgeDocument';
import { MarkupOptions, SpanMarkup } from '~/features/markup/SpanMarkup';
import { headingL1, headingL2, headingL3, headingL4, paragraphContent } from '~/styles/nodeStyles';

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

interface ParseHTMLOption {
  docElId: string;
  overlay: boolean;
  isLast?: boolean;
}

export function parseHTML(node: ASTNode, option: ParseHTMLOption): JSX.Element {
  const { docElId, overlay, isLast = false } = option ?? {};

  switch (node.type) {
    case 'document':
      const document = node as FridgeDocument;
      let docClass = columnDiv;
      switch (document.mode) {
        case 'ltr':
          docClass = columnDiv;
          break;
        case 'ttb':
          docClass = rowDiv;
          break;
      }
      return (
        <div data-type={document.type} data-node-id={document.id} data-mode={document.mode} class={docClass} id={docElId}>
          <For each={document.children}>
            {(child, i) => {
              const isLast = document.children.length - 1 === i();
              return parseHTML(child, {
                ...option,
                isLast,
              });
            }}
          </For>
        </div>
      );

    // block
    case 'heading':
      const heading = node as Heading;
      let headingClass = headingL1;
      switch (heading.level) {
        case 1:
          headingClass = headingL1;
          break;
        case 2:
          headingClass = headingL2;
          break;
        case 3:
          headingClass = headingL3;
          break;
        case 4:
          headingClass = headingL4;
          break;
      }
      return (
        <p data-type={heading.type} data-node-id={heading.id} class={headingClass}>
          {getContent(heading.toPlain(), overlay, {
            baseClass: headingClass,
            newLineAfterExists: !isLast,
            overrideOptions: {
              highlightSearch: false,
              showFullSpace: false,
              showHalfSpace: false,
              showNewline: false,
            },
          })}
        </p>
      );
    case 'image':
      const image = node as Image;
      return (
        <img
          data-type={image.type}
          data-node-id={image.id}
          data-src={image.src}
          data-alt={image.alt}
          data-display={image.display}
          data-width={image.width}
          data-height={image.height}
          style={{ display: image.display, width: `${image.width}px`, height: `${image.height}px`, opacity: overlay ? 0 : 1 }}
          src={image.src}
          width={image.width}
          height={image.height}
          alt={image.alt}
        />
      );
    case 'paragraph':
      const paragraph = node as Paragraph;
      return (
        <p data-type={paragraph.type} data-node-id={paragraph.id} class={paragraphContent}>
          {getContent(paragraph.toPlain(), overlay, {
            baseClass: paragraphContent,
            newLineAfterExists: !isLast,
          })}
        </p>
      );
  }
}

const markUp = new SpanMarkup({
  highlightSearch: true,
  showFullSpace: true,
  showHalfSpace: true,
  showNewline: true,
});

interface OverlayOptions {
  baseClass: string;
  newLineAfterExists: boolean;

  overrideOptions?: MarkupOptions;
}

function getContent(text: string, overlay: boolean, overlayOptions?: OverlayOptions): JSX.Element {
  const { baseClass = '', newLineAfterExists = false, overrideOptions } = overlayOptions ?? {};

  if (overlay) {
    return markUp.toJSX(text, baseClass, overrideOptions) as JSX.Element; // returns JSX fragment
  } else {
    return text;
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
 * - If the DOM provides data-node-id attributes, they override the generated ids
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

  // Helper to set id on an ASTNode-like object if data-node-id present
  function applyId(node: any, el: Element) {
    const did = el.getAttribute('data-node-id');
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
      // Normalize CR/LF and remove lone CR so textContent preserves empty lines as empty string
      const rawHeadingText = el.textContent || '';
      const text = rawHeadingText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      const heading = new Heading(text, level);
      applyId(heading, el);
      children.push(heading);
      continue;
    }

    if (type === 'paragraph') {
      // Collect inline text children; simple strategy: take the concatenated
      // textContent of this paragraph element.
      // Normalize CR/LF and remove lone CR so empty paragraphs remain empty strings
      const rawParaText = el.textContent || '';
      const text = rawParaText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      const para = new Paragraph(text);
      applyId(para, el);
      // If paragraph element has an inner element with data-node-id for the text,
      // apply that id to the inline node as well.
      const innerTextEl = el.querySelector('[data-type="text"]');
      if (innerTextEl) applyId(para, innerTextEl);
      children.push(para);
      continue;
    }
    if (type === 'image') {
      // Support <img> elements or custom elements with data-* attributes.
      const imgEl = el as HTMLImageElement;
      const src = (el.getAttribute('data-src') || imgEl.getAttribute('src') || '') as string;
      const altAttr = el.getAttribute('data-alt');
      const alt = altAttr !== null ? altAttr : imgEl.alt || undefined;

      // display may be provided as data-display or via style.display
      let display = (el.getAttribute('data-display') as Image['display']) || undefined;
      if (!display && imgEl && imgEl.style) display = (imgEl.style.display as Image['display']) || undefined;

      // width/height: prefer data-* attrs, fall back to element attributes
      const widthAttr = el.getAttribute('data-width') || imgEl.getAttribute('width');
      const heightAttr = el.getAttribute('data-height') || imgEl.getAttribute('height');
      const width = widthAttr ? Number(widthAttr) : undefined;
      const height = heightAttr ? Number(heightAttr) : undefined;

      const image = new Image(src, alt, display, width, height);
      applyId(image, el);
      children.push(image);
      continue;
    }

    // other types are ignored for now
  }

  doc.children = children;
  // override id of document if provided
  const rootId = documentRoot.getAttribute('data-node-id');
  if (rootId) doc.id = rootId;

  return doc;
}
