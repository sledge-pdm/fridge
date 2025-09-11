import { flexCol, flexRow } from '@sledge/core';
import { PM10, PM12, vars } from '@sledge/theme';
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
  const isSelected = () => editorStore.currentDocumentId === props.doc.id;

  return (
    <div
      class={flexRow}
      style={{
        gap: '4px',
        'align-items': 'center',
        padding: '4px 0',
        cursor: isSelected() ? 'auto' : 'pointer',
      }}
      onClick={() => setCurrentDocument(props.doc.id)}
    >
      <p
        style={{
          'font-family': PM10,
          'font-size': '10px',
          width: '20px',
          color: isSelected() ? vars.color.active : 'inherit',
        }}
      >
        {props.index}.
      </p>
      <p
        style={{
          'font-family': PM12,
          'font-size': '12px',
          'font-weight': isSelected() ? 'bold' : 'normal',
          color: isSelected() ? vars.color.active : 'inherit',
        }}
      >
        {props.doc.title} ({props.doc.content.length})
      </p>
    </div>
  );
};

export default DocumentsList;
