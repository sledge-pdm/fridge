import { css } from '@acab/ecsstatic';
import { clsx } from '@sledge/core';
import { Icon } from '@sledge/ui';
import { Component, For } from 'solid-js';
import { documentsManager } from '~/features/document/DocumentsManager';
import { useDoc, useDocuments } from '~/features/document/useDocuments';

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
  const { documents } = useDocuments();
  

  return (
    <div class={tabRoot}>
      <For each={documents()}>
        {(doc, i) => {
          return <FileTabItem docId={doc.id} />;
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

const FileTabItem: Component<{ docId: string }> = (props) => {
  const { doc, isActive } = useDoc(props.docId);

  return (
    <div class={clsx(tabItem, isActive() && tabItemSelected)} onClick={() => documentsManager.setActive(doc()?.id)}>
      <p class={clsx(label, isActive() && labelSelected)}>{doc()?.title}</p>
      <div
        id='remove_container'
        class={removeContainer}
        onClick={() => {
          const currentId = doc()?.id;
          if (currentId) documentsManager.removeDocument(currentId);
        }}
        style={{
          opacity: isActive() ? 1 : 0,
        }}
      >
        <Icon src={'/icons/misc/remove_6.png'} base={6} color='var(--color-on-background)' hoverColor='var(--color-active)' />
      </div>
    </div>
  );
};

export default FilesTab;
