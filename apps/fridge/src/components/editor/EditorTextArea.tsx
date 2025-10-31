import { clsx } from '@sledge/core';
import { Component, createEffect } from 'solid-js';
import { textAreaContentBase, textAreaContentOverlay, textAreaRoot } from '~/components/editor/textAreaStyles';
import { Heading } from '~/features/document/models/blocks/Heading';
import { Paragraph } from '~/features/document/models/blocks/Paragraph';
import { FridgeDocument } from '~/features/document/models/FridgeDocument';
import { parseDocFromDOM, parseHTML } from '~/features/document/parser';
import { fromId, replaceDocument } from '~/features/document/service';
import {
  getCurrentSerializedSelection,
  locateRange,
  NodePosition,
  restoreSelectionMapped,
  SerializedSelection,
} from '~/features/selection/SelectionMapper';

interface Props {
  docId: string | undefined;
}

const DOC_EL_ID = 'editor-doc-el';
const DOC_OVERLAY_EL_ID = 'editor-doc-overlay-el';

export const getDocElement = () => document.getElementById(DOC_EL_ID) as HTMLElement | null;
export const getOverlayElement = () => document.getElementById(DOC_OVERLAY_EL_ID) as HTMLElement | null;

// KEEP THIS WYSIWYG!
const EditorTextArea: Component<Props> = (props) => {
  let containerRef: HTMLDivElement;
  let overlayRef: HTMLDivElement;
  let isComposing = false;

  const onCompositionStart = () => {
    isComposing = true;
  };

  const onCompositionEnd = () => {
    isComposing = false;
    const newDoc = parseCurrent();
    if (newDoc) applyDoc(newDoc);
  };

  const parseContentHTML = (doc?: FridgeDocument) => (doc ? parseHTML(doc, { docElId: DOC_EL_ID, overlay: false }) : null);
  const parseOverlayHTML = (doc?: FridgeDocument) => (doc ? parseHTML(doc, { docElId: DOC_OVERLAY_EL_ID, overlay: true }) : null);

  const defaultDoc = fromId(props.docId);
  const defaultContent = parseContentHTML(defaultDoc);
  const defaultOverlayContent = parseOverlayHTML(defaultDoc);

  createEffect(() => {
    const doc = fromId(props.docId);
    if (doc) {
      containerRef.replaceChildren(parseContentHTML(doc) as Node);
      overlayRef.replaceChildren(parseOverlayHTML(doc) as Node);
    }
  });

  const parseCurrent = () => {
    const docEl = document.getElementById(DOC_EL_ID);
    if (!docEl) return;
    return parseDocFromDOM(docEl as HTMLElement);
  };

  const applyDoc = (newDoc: FridgeDocument, overridePosition?: NodePosition) => {
    if (!props.docId) return;
    const docEl = getDocElement();
    if (!docEl) return;

    let savedSel: SerializedSelection | null = overridePosition
      ? { start: overridePosition, end: overridePosition }
      : getCurrentSerializedSelection(docEl);

    replaceDocument(props.docId, newDoc);
    containerRef.replaceChildren(parseContentHTML(newDoc) as Node);
    overlayRef.replaceChildren(parseOverlayHTML(newDoc) as Node);

    const newDocEl = getDocElement();
    if (!newDocEl) return;

    if (savedSel) {
      restoreSelectionMapped(newDocEl, savedSel);
    }
  };

  const currentSelectPosition = (docEl: HTMLElement): NodePosition | null => {
    const range = window.getSelection()?.getRangeAt(0);
    if (range) {
      return locateRange(docEl, range);
    }
    return null;
  };

  return (
    <div class={textAreaRoot}>
      <div
        ref={(ref) => {
          overlayRef = ref;
        }}
        class={clsx(textAreaContentBase, textAreaContentOverlay)}
      >
        {defaultOverlayContent}
      </div>
      <div
        ref={(ref) => {
          containerRef = ref;
        }}
        class={textAreaContentBase}
        contentEditable={true}
        onKeyDown={(e) => {
          if (isComposing) return;
          const doc = fromId(props.docId);
          const docEl = getDocElement();
          if (!doc || !docEl) return;

          const pos = currentSelectPosition(docEl);
          if (pos) {
            const node = doc.findNode(pos.nodeId);
            if (!node) return;

            console.log(`Entered ${e.key} in the [${pos.offset}] of ${node?.type}(${node?.toPlain()} / ${node?.id}).`);

            // paragraph: leave before, add new line as paragraph with after
            if (node.type === 'paragraph') {
              if (e.key === 'Enter') {
                // TODO: add behaviour when shift/ctrl pressed
                e.preventDefault();
                let endNodeId = node.id;
                const currentSel = getCurrentSerializedSelection(docEl);
                if (currentSel) {
                  doc.deleteInSelection(currentSel);
                  endNodeId = currentSel.end.nodeId;
                }
                let pNode = doc.findNode(node.id) as Paragraph | null;
                if (!pNode) return;
                const text = pNode.toPlain();
                const beforeText = text.slice(0, pos.offset);
                const afterText = text.slice(pos.offset);
                // replace current line with beforeText
                doc.replace(pNode.id, new Paragraph(beforeText));
                // insert new line with beforeText
                const newLine = new Paragraph(afterText);
                doc.insertAfter(pNode.id, newLine);
                // move selection to the first pos of new line
                applyDoc(doc, {
                  nodeId: newLine.id,
                  offset: 0,
                });
              }
            }

            // heading: leave before, add new line as paragraph with after
            if (node.type === 'heading') {
              if (e.key === 'Enter') {
                // TODO: add behaviour when shift/ctrl pressed
                e.preventDefault();
                let endNodeId = node.id;
                const currentSel = getCurrentSerializedSelection(docEl);
                if (currentSel) {
                  doc.deleteInSelection(currentSel);
                  endNodeId = currentSel.end.nodeId;
                }
                let hNode = doc.findNode(node.id) as Heading | null;
                if (!hNode) return;
                const text = hNode.toPlain();
                const beforeText = text.slice(0, pos.offset);
                const afterText = text.slice(pos.offset);
                // replace current line with beforeText
                doc.replace(hNode.id, new Heading(beforeText, hNode.level));
                // insert new line with beforeText
                const newLine = new Paragraph(afterText);
                doc.insertAfter(hNode.id, newLine);
                // move selection to the first pos of new line
                applyDoc(doc, {
                  nodeId: newLine.id,
                  offset: 0,
                });
              }
            }
          }

          // if doc is empty, insert heading
          if (!doc?.toPlain()) {
            e.preventDefault();
            if (props.docId && doc) {
              doc.children.push(new Heading('', 1));
              doc.children.push(new Paragraph());
              applyDoc(doc);
            }
          }
        }}
        onPaste={(e) => {
          const raw = e.clipboardData?.getData('text');
          if (!raw) return;

          // Normalize CRLF and lone CR so empty lines become empty strings when splitting.
          const data = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
          if (!data.includes('\n')) return;

          e.preventDefault();

          const doc = fromId(props.docId);
          const docEl = getDocElement();
          if (!doc || !docEl) return;
          const pos = currentSelectPosition(docEl);
          if (pos) {
            let endNodeId = '';
            const currentSel = getCurrentSerializedSelection(docEl);
            if (currentSel) {
              doc.deleteInSelection(currentSel);
              endNodeId = currentSel.end.nodeId;
            }
            const node = doc.findNode(pos.nodeId);
            if (!node) return;
            endNodeId = node.id;
            const lines = data.split('\n');
            const paragraphs = lines.map((line) => {
              // Preserve truly empty lines as empty string so parser/render will emit <br />
              const text = line === '' ? '' : line;
              return new Paragraph(text);
            });
            doc.insertAfter(endNodeId, paragraphs);
            const lastP = paragraphs[paragraphs.length - 1];
            applyDoc(doc, {
              nodeId: lastP.id,
              offset: lastP.toPlain().length,
            });
          }
        }}
        onCompositionStart={onCompositionStart}
        onCompositionEnd={onCompositionEnd}
        onInput={(e) => {
          if (isComposing) return;
          const newDoc = parseCurrent();
          if (newDoc) applyDoc(newDoc);
        }}
      >
        {defaultContent}
      </div>
    </div>
  );
};

export default EditorTextArea;
