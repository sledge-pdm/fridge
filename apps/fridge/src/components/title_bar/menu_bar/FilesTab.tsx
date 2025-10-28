import { css } from '@acab/ecsstatic';
import { clsx } from '@sledge/core';
import { Icon } from '@sledge/ui';
import { Component, createEffect, createSignal, For, onMount } from 'solid-js';
import { FridgeDocument } from '~/features/document/model';
import { addDocument, fromId, newDocument, removeDocument } from '~/features/document/service';
import { editorStore, setEditorStore } from '~/stores/EditorStore';
import { eventBus, Events } from '~/utils/EventBus';

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

const addButton = css`
  padding: 2px;
  margin-left: 12px;
  opacity: 0.5;
`;

const divider = css`
  display: flex;
  flex-direction: row;
  width: 1px;
  height: 50%;
  background-color: var(--color-border-secondary);
  opacity: 0.25;
`;

const FilesTab: Component = () => {
  return (
    <div class={tabRoot}>
      <For each={editorStore.documents}>
        {(item, i) => {
          return (
            <>
              <TabItem docId={item.id} />
              <div class={divider} />
            </>
          );
        }}
      </For>

      <a
        class={addButton}
        onClick={() => {
          addDocument(newDocument(), true);
        }}
      >
        + add
      </a>
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

  min-width: 70px;
  max-width: 120px;
  overflow: hidden;

  box-sizing: border-box;
  cursor: pointer;
  &:hover {
    background-color: var(--color-button-hover);
  }

  &:hover > #remove_container {
    display: flex !important;
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
  overflow: hidden;
  text-overflow: ellipsis;
`;
const labelSelected = css`
  color: var(--color-active);
  opacity: 1;
`;
const removeContainer = css`
  display: none;
  cursor: pointer;
  padding: 2px;
  pointer-events: all;
`;

interface ItemProps {
  docId: string;
}

const TabItem: Component<ItemProps> = (props) => {
  const [doc, setDoc] = createSignal<FridgeDocument | undefined>(fromId(props.docId));
  const [isActive, setIsActive] = createSignal<boolean>(false);

  createEffect(() => {
    const activeId = editorStore.activeDocId;
    setIsActive(props.docId === activeId);
  });

  const handleDocUpdate = (e: Events['doc:changed']) => {
    if (e.id === props.docId) setDoc(fromId(e.id));
  };

  onMount(() => {
    setDoc(fromId(props.docId));
    eventBus.on('doc:changed', handleDocUpdate);
    return () => {
      eventBus.off('doc:changed', handleDocUpdate);
    };
  });

  return (
    <div class={clsx(tabItem, isActive() && tabItemSelected)} onClick={() => setEditorStore('activeDocId', doc()?.id)}>
      <p class={clsx(label, isActive() && labelSelected)}>{doc()?.title}</p>
      <div
        id='remove_container'
        class={removeContainer}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();

          const currentId = doc()?.id;
          if (currentId) {
            removeDocument(currentId);
          }
        }}
        style={{
          display: isActive() ? 'flex' : 'none',
        }}
      >
        <Icon src={'/icons/misc/remove_6.png'} base={6} color='var(--color-on-background)' hoverColor='var(--color-active)' />
      </div>
    </div>
  );
};

export default FilesTab;
