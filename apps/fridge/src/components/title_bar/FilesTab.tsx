import { css } from '@acab/ecsstatic';
import { clsx } from '@sledge/core';
import { Icon, Light, MenuList } from '@sledge/ui';
import { Component, createEffect, createSignal, For, onMount, Show } from 'solid-js';
import { FridgeDocument } from '~/features/document/model';
import { addDocument, fromId, isChanged, newDocument, openDocument, removeDocument } from '~/features/document/service';
import { showChooseFileDialog } from '~/features/io/choose';
import { editorStore, setEditorStore } from '~/stores/EditorStore';
import { eventBus, Events } from '~/utils/EventBus';

const tabRoot = css`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  height: 100%;
  overflow-x: auto;
  overflow: visible;
  touch-action: auto;
  &::-webkit-scrollbar {
    height: 0px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--color-on-background);
  }
`;
const addMenuContainer = css`
  display: flex;
  flex-direction: row;
  position: relative;
  overflow: visible;
`;

const addButton = css`
  padding: 2px;
  height: 100%;
  margin-left: 12px;
  opacity: 0.5;
`;

const divider = css`
  display: flex;
  flex-direction: row;
  width: 1px;
  height: 50%;
  background-color: var(--color-on-background);
  opacity: 0.15;
`;

const FilesTab: Component = () => {
  const [addMenuShown, setAddMenuShown] = createSignal(false);

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
      <div class={addMenuContainer}>
        <a
          class={addButton}
          onClick={() => {
            setAddMenuShown(!addMenuShown());
          }}
        >
          + add
        </a>
        <Show when={addMenuShown()}>
          <MenuList
            align='left'
            style={{ 'margin-top': '6px', width: '120px' }}
            options={[
              {
                type: 'item',
                label: '+ new document.',
                onSelect: async () => {
                  addDocument(newDocument(), true);
                  setAddMenuShown(false);
                },
              },
              {
                type: 'item',
                label: '> open file.',
                onSelect: async () => {
                  const path = await showChooseFileDialog();
                  if (path) openDocument(path);
                  setAddMenuShown(false);
                },
              },
            ]}
          >
            FILES.
          </MenuList>
        </Show>
      </div>
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

  min-width: 100px;
  max-width: 120px;
  overflow: hidden;

  box-sizing: border-box;
  cursor: pointer;
  &:hover {
    /* max-width: initial; */
    background-color: var(--color-surface);
  }

  &:hover > #remove_container {
    display: flex !important;
  }
`;
const tabItemSelected = css`
  max-width: unset;
  color: var(--color-active);
  border-bottom: 2px solid var(--color-active);
  cursor: auto;
`;
const label = css`
  color: var(--color-on-background);
  opacity: 0.8;
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
  const [isDocChanged, setIsDocChanged] = createSignal<boolean>(false);

  createEffect(() => {
    const activeId = editorStore.activeDocId;
    setIsActive(props.docId === activeId);
  });

  const handleDocUpdate = (e: Events['doc:changed']) => {
    if (e.id === props.docId) {
      const doc = fromId(e.id);
      setDoc(doc);
      setIsDocChanged(doc ? isChanged(doc) : false);
    }
  };

  onMount(() => {
    setDoc(fromId(props.docId));
    eventBus.on('doc:changed', handleDocUpdate);
    return () => {
      eventBus.off('doc:changed', handleDocUpdate);
    };
  });

  return (
    <div
      class={clsx(tabItem, isActive() && tabItemSelected)}
      onPointerDown={(e) => {
        if (e.button === 1) {
          const id = doc()?.id;
          if (id) removeDocument(id);
        } else {
          setEditorStore('activeDocId', doc()?.id);
        }
      }}
    >
      <p class={clsx(label, isActive() && labelSelected)}>{doc()?.title}</p>
      <Light on={isDocChanged()} />
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
