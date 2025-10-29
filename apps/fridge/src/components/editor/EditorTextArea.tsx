import { Component, createEffect } from 'solid-js';
import { editorContentEditable } from '~/components/editor/textAreaStyles';
import { Paragraph } from '~/features/document/models/blocks/Paragraph';
import { FridgeDocument } from '~/features/document/models/FridgeDocument';
import { parseDocFromDOM, parseHTML } from '~/features/document/parser';
import { fromId, replaceDocument } from '~/features/document/service';
import { restoreSelection, saveSelection } from '~/utils/SelectionUtils';

interface Props {
  docId: string | undefined;
}

const DOC_EL_ID = 'editor-doc-el';

const EditorTextArea: Component<Props> = (props) => {
  let containerRef: HTMLDivElement;
  const defaultDoc = fromId(props.docId);
  const defaultContent = defaultDoc ? parseHTML(defaultDoc, DOC_EL_ID) : null;

  createEffect(() => {
    const doc = fromId(props.docId);
    if (doc) containerRef.replaceChildren(parseHTML(doc, DOC_EL_ID) as Node);
  });

  const parseCurrent = () => {
    const docEl = document.getElementById(DOC_EL_ID);
    console.log(docEl);
    if (!docEl) return;

    return parseDocFromDOM(docEl as HTMLElement);
  };

  const applyDoc = (newDoc: FridgeDocument) => {
    if (!props.docId) return;
    const sel = saveSelection(containerRef);
    replaceDocument(props.docId, newDoc);
    containerRef.replaceChildren(parseHTML(newDoc, DOC_EL_ID) as Node);
    restoreSelection(containerRef, sel);
  };

  return (
    <div
      ref={(ref) => {
        containerRef = ref;
      }}
      class={editorContentEditable}
      contentEditable={true}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          // if (e.shiftKey) e.preventDefault();
          const doc = fromId(props.docId);
          if (props.docId && doc) {
            if (doc) {
              doc.children.push(new Paragraph());
              applyDoc(doc);
            }
          }
        }
      }}
      onInput={(e) => {
        const newDoc = parseCurrent();
        console.log(newDoc);
        if (newDoc) applyDoc(newDoc);
      }}
    >
      {defaultContent}
    </div>
  );
};

export default EditorTextArea;
