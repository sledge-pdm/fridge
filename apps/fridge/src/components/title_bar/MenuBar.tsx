import { css } from '@acab/ecsstatic';
import { Icon } from '@sledge/ui';
import FilesTab from '~/components/title_bar/FilesTab';
import { editorStore, setEditorStore } from '~/stores/EditorStore';

const root = css`
  display: flex;
  flex-direction: row;
  border-bottom: 1px solid var(--color-border);
  pointer-events: all;
  padding: 0px 8px 0 20px;
  align-items: center;
  height: 28px;
`;
const spacer = css`
  flex-grow: 1;
`;
const sideBarIconContainer = css`
  display: flex;
  flex-direction: column;
  margin-right: 8px;
  padding: 4px;
  cursor: pointer;
`;

export default function MenuBar() {
  return (
    <div class={root}>
      <div
        class={sideBarIconContainer}
        style={{
          opacity: editorStore.sidebar ? 1 : 0.75,
        }}
        onClick={() => {
          setEditorStore('sidebar', !editorStore.sidebar);
        }}
      >
        <Icon
          src={editorStore.sidebar ? '/icons/misc/sidebar_collapse.png' : '/icons/misc/sidebar_open.png'}
          base={7}
          hoverColor='var(--color-active)'
        />
      </div>

      <FilesTab />
    </div>
  );
}
