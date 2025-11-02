import { css } from '@acab/ecsstatic';
import { clsx } from '@sledge/core';
import { Icon, Light } from '@sledge/ui';
import { Component, createSignal, For, onMount, Show } from 'solid-js';
import { FridgeDocument } from '~/features/document/FridgeDocument';
import { fromId, removeDocument } from '~/features/document/service';
import { editorStore, setEditorStore } from '~/stores/EditorStore';
import { eventBus, Events } from '~/utils/EventBus';

const tabRoot = css`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 100%;
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
  return (
    <div class={tabRoot}>
      <For each={editorStore.documents}>
        {(item, i) => {
          return (
            <>
              <TabItem docId={item.getId()} />
              <div class={divider} />
            </>
          );
        }}
      </For>
    </div>
  );
};

const tabItem = css`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 140px;
  height: 100%;
  padding-left: 12px;
  padding-right: 12px;
  gap: 6px;
  overflow: hidden;

  box-sizing: border-box;
  cursor: pointer;
  &:hover {
    /* max-width: initial; */
    background-color: var(--color-surface);
  }

  &:hover > #remove_container {
    opacity: 0.5;
  }
`;
const tabItemSelected = css`
  max-width: unset;
  color: var(--color-active);
  cursor: auto;
`;
const tabItemSelectedBorder = css`
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 2px;
  background-color: var(--color-active);
  pointer-events: none;
`;
const label = css`
  color: var(--color-on-background);
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: ZFB09;
  flex-grow: 1;
  @media screen and (max-width: 700px) {
    font-size: 8px;
  }
`;
const labelSelected = css`
  color: var(--color-active);
  opacity: 1;
`;
const removeContainer = css`
  cursor: pointer;
  padding: 2px;
  pointer-events: all;
  opacity: 0;
`;

interface ItemProps {
  docId: string;
}

const TabItem: Component<ItemProps> = (props) => {
  const [doc, setDoc] = createSignal<FridgeDocument | undefined>(fromId(props.docId));
  const [isDocChanged, setIsDocChanged] = createSignal<boolean>(false);

  const handleDocUpdate = (e: Events['doc:changed']) => {
    if (e.id === props.docId) {
      const doc = fromId(e.id);
      if (doc) {
        setDoc(doc);
        setIsDocChanged(doc.isChangedFromLastLoad());
      }
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
      class={clsx(tabItem, props.docId === editorStore.activeDocId && tabItemSelected)}
      onPointerDown={(e) => {
        if (e.button === 1) {
          const id = doc()?.getId();
          if (id) removeDocument(id);
        } else {
          setEditorStore('activeDocId', doc()?.getId());
        }
      }}
    >
      <p class={clsx(label, props.docId === editorStore.activeDocId && labelSelected)}>{doc()?.getTitle() ?? 'untitled'}</p>
      <Light on={isDocChanged()} />
      <div
        id='remove_container'
        class={removeContainer}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();

          const currentId = doc()?.getId();
          if (currentId) {
            removeDocument(currentId);
          }
        }}
        style={{
          opacity: props.docId === editorStore.activeDocId ? 0.5 : undefined,
        }}
      >
        <Icon src={'/icons/misc/remove.png'} base={8} color='var(--color-on-background)' hoverColor='var(--color-active)' />
      </div>
      <Show when={props.docId === editorStore.activeDocId}>
        <div class={tabItemSelectedBorder} />
      </Show>
    </div>
  );
};

export default FilesTab;
