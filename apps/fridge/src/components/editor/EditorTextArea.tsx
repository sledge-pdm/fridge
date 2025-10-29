import { clsx } from '@sledge/core';
import { Component, createEffect } from 'solid-js';
import { textAreaContentBase, textAreaContentOverlay, textAreaRoot } from '~/components/editor/textAreaStyles';
import { Paragraph } from '~/features/document/models/blocks/Paragraph';
import { FridgeDocument } from '~/features/document/models/FridgeDocument';
import { parseDocFromDOM, parseHTML } from '~/features/document/parser';
import { fromId, replaceDocument } from '~/features/document/service';
import { restoreSelection, saveSelection } from '~/utils/SelectionUtils';

interface Props {
  docId: string | undefined;
}

const DOC_EL_ID = 'editor-doc-el';
const DOC_OVERLAY_EL_ID = 'editor-doc-overlay-el';

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
      console.log(doc);
      containerRef.replaceChildren(parseContentHTML(doc) as Node);
      overlayRef.replaceChildren(parseOverlayHTML(doc) as Node);
    }
  });

  const parseCurrent = () => {
    const docEl = document.getElementById(DOC_EL_ID);
    if (!docEl) return;
    return parseDocFromDOM(docEl as HTMLElement);
  };

  const applyDoc = (newDoc: FridgeDocument) => {
    if (!props.docId) return;
    console.log(newDoc);
    const sel = saveSelection(containerRef);
    replaceDocument(props.docId, newDoc);
    containerRef.replaceChildren(parseContentHTML(newDoc) as Node);
    overlayRef.replaceChildren(parseOverlayHTML(newDoc) as Node);
    restoreSelection(containerRef, sel);
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
          if (e.key === 'Enter') {
            const doc = fromId(props.docId);
            if (props.docId && doc) {
              doc.children.push(new Paragraph());
              applyDoc(doc);
            }
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
