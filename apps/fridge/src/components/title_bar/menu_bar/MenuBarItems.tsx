import { css } from '@acab/ecsstatic';
import { MenuList, MenuListOption } from '@sledge/ui';
import { Component, createSignal, Show } from 'solid-js';
import { documentsManager } from '~/features/document/DocumentsManager';
import { newDocument, openDocument } from '~/features/document/service';
import { useActiveDoc } from '~/features/document/useDocuments';
import { showChooseFileDialog } from '~/features/io/choose';
import { overwrite, saveToFile } from '~/features/io/save';

const MenuBarItems: Component = () => {
  const { activeDoc } = useActiveDoc();

  return (
    <div>
      <MenuItem
        menu={[
          {
            type: 'item',
            label: 'new document.',
            onSelect: () => {
              documentsManager.addDocument(newDocument());
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
              const currentId = activeDoc()?.id;
              if (currentId) documentsManager.removeDocument(currentId);
            },
          },
          {
            type: 'item',
            label: 'save document.',
            onSelect: async () => {
              const current = activeDoc();
              if (!current) return;
              if (current.associatedFilePath) {
                overwrite(current);
              } else {
                const path = await saveToFile(current?.content || '', `${current?.title || 'untitled'}.txt`);
                if (path) documentsManager.updateActive({ associatedFilePath: path });
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
        <MenuList align='right' options={props.menu!} onClose={() => setShow(false)} />
      </Show>
    </div>
  );
};
