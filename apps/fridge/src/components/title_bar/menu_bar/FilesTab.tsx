import { css } from '@acab/ecsstatic';
import { clsx } from '@sledge/core';
import { Component, For } from 'solid-js';
import { FridgeDocument } from '~/models/Document';
import { editorStore, setCurrentDocument } from '~/stores/EditorStore';

const tabRoot = css`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 100%;
  gap: 4px;
`;

const FilesTab: Component = () => {
  return (
    <div class={tabRoot}>
      <For each={editorStore.documents}>
        {(doc, i) => {
          return <FileTabItem index={i()} doc={doc} />;
        }}
      </For>
    </div>
  );
};

const tabItem = css`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 100%;
  padding-left: 12px;
  padding-right: 12px;
  cursor: pointer;
  &:hover {
    background-color: var(--color-button-hover);
  }
`;
const tabItemSelected = css`
  color: var(--color-active);
  border-bottom: 1px solid var(--color-active);
  cursor: auto;
`;
const label = css`
  color: var(--color-on-background);
  opacity: 0.5;
`;
const labelSelected = css`
  color: var(--color-active);
  opacity: 1;
`;
const FileTabItem: Component<{ index: number; doc: FridgeDocument }> = (props) => {
  const isSelected = () => editorStore.currentDocumentId === props.doc.id;

  return (
    <div class={clsx(tabItem, isSelected() && tabItemSelected)} onClick={() => setCurrentDocument(props.doc.id)}>
      <p class={clsx(label, isSelected() && labelSelected)}>{props.doc.title}</p>
    </div>
  );
};

export default FilesTab;
