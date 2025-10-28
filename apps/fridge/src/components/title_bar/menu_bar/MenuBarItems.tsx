import { css } from '@acab/ecsstatic';
import { MenuList, MenuListOption } from '@sledge/ui';
import { Component, createSignal, Show } from 'solid-js';

import { addDocument, fromId, newDocument, openDocument, removeDocument, update } from '~/features/document/service';
import { showChooseFileDialog } from '~/features/io/choose';
import { overwrite, saveToFile } from '~/features/io/save';
import { editorStore, setEditorStore } from '~/stores/EditorStore';

const MenuBarItems: Component = () => {
  return (
    <div>
      <MenuItem
        menu={[
          {
            type: 'item',
            label: 'new document.',
            onSelect: () => {
              const newDoc = newDocument();
              addDocument(newDoc);
              setEditorStore('activeDocId', newDoc.id);
            },
          },
          {
            type: 'item',
            label: 'open file.',
            onSelect: async () => {
              const path = await showChooseFileDialog();
              if (path) openDocument(path);
            },
          },
          {
            type: 'item',
            label: 'close document.',
            onSelect: () => {
              const currentId = fromId(editorStore.activeDocId)?.id;
              if (currentId) {
                removeDocument(currentId);
              }
            },
          },
          {
            type: 'item',
            label: 'save document.',
            onSelect: async () => {
              const current = fromId(editorStore.activeDocId);
              if (!current) return;
              if (current.associatedFilePath) {
                overwrite(current);
              } else {
                const path = await saveToFile(current?.content || '', `${current?.title || 'untitled'}.txt`);
                if (editorStore.activeDocId && path) update(editorStore.activeDocId, { associatedFilePath: path });
              }
            },
          },
        ]}
      >
        FILES.
      </MenuItem>
    </div>
  );
};

export default MenuBarItems;

const menuItemRoot = css`
  position: relative;
  display: flex;
  flex-direction: row;
`;
const menuItem = css`
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
  height: 26px;
  &:hover {
    background-color: var(--color-button-hover);
  }
  &:hover p {
    color: var(--color-accent);
  }
`;

const menuItemText = css`
  font-family: ZFB11;
  font-size: 8px;
  width: 100%;
  padding-left: 12px;
  padding-right: 12px;
`;

interface ItemProps {
  children: HTMLElement | string | number;
  menu?: MenuListOption[];
}
const MenuItem: Component<ItemProps> = (props) => {
  const [show, setShow] = createSignal(false);
  return (
    <div class={menuItemRoot}>
      <div class={menuItem} onClick={(e) => setShow(true)}>
        <p class={menuItemText}>{props.children}</p>
      </div>
      <Show when={props.menu && show()}>
        <MenuList
          align='right'
          options={props.menu!}
          onClose={() => setShow(false)}
          style={{
            width: '120px',
          }}
        />
      </Show>
    </div>
  );
};
