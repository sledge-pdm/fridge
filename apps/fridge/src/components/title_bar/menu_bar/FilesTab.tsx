import { css } from '@acab/ecsstatic';
import { clsx } from '@sledge/core';
import { Icon } from '@sledge/ui';
import { Component, For } from 'solid-js';
import { FridgeDocument } from '~/models/Document';
import { editorStore, getCurrentDocument, removeDocument, setCurrentDocument } from '~/stores/EditorStore';

const tabRoot = css`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  height: 100%;
  overflow-x: auto;
  touch-action: auto;
  &::-webkit-scrollbar {
    height: 0px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--color-on-background);
  }
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
  gap: 6px;
  cursor: pointer;
  &:hover {
    background-color: var(--color-button-hover);
  }

  &:hover > #remove_container {
    opacity: 1 !important;
  }
`;
const tabItemSelected = css`
  color: var(--color-active);
  border-bottom: 2px solid var(--color-active);
  cursor: auto;
`;
const label = css`
  color: var(--color-on-background);
  opacity: 0.5;
  white-space: nowrap;
`;
const labelSelected = css`
  color: var(--color-active);
  opacity: 1;
`;
const removeContainer = css`
  opacity: 0;
  cursor: pointer;
  padding: 2px;
  pointer-events: all;
`;
const FileTabItem: Component<{ index: number; doc: FridgeDocument }> = (props) => {
  const isSelected = () => editorStore.currentDocumentId === props.doc.id;

  return (
    <div class={clsx(tabItem, isSelected() && tabItemSelected)} onClick={() => setCurrentDocument(props.doc.id)}>
      <p class={clsx(label, isSelected() && labelSelected)}>{props.doc.title}</p>
      <div
        id='remove_container'
        class={removeContainer}
        onClick={() => {
          const currentId = getCurrentDocument()?.id;
          if (currentId) removeDocument(currentId);
        }}
        style={{
          opacity: editorStore.currentDocumentId === props.doc.id ? 1 : 0,
        }}
      >
        <Icon src={'/icons/misc/remove_6.png'} base={6} color='var(--color-on-background)' hoverColor='var(--color-active)' />
      </div>
    </div>
  );
};

export default FilesTab;
