import { flexCol, flexRow } from '@sledge/core';
import { vars } from '@sledge/theme';
import { Component, For } from 'solid-js';
import { FridgeDocument } from '~/models/Document';
import { editorStore, setCurrentDocument } from '~/stores/EditorStore';

const DocumentsList: Component = () => {
  return (
    <div class={flexCol}>
      <For each={editorStore.documents}>
        {(doc, i) => {
          return <DocumentItem index={i()} doc={doc} />;
        }}
      </For>
    </div>
  );
};

const DocumentItem: Component<{ index: number; doc: FridgeDocument }> = (props) => {
  return (
    <div
      class={flexRow}
      style={{
        gap: '4px',
        padding: '4px 0',
        'align-items': 'center',
      }}
    >
      <p style={{ width: '20px', color: editorStore.currentDocumentId === props.doc.id ? vars.color.active : 'inherit' }}>{props.index}.</p>
      <a onClick={() => setCurrentDocument(props.doc.id)}>
        {props.doc.title} ({props.doc.content.length})
      </a>
    </div>
  );
};

export default DocumentsList;
