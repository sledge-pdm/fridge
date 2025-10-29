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

  width: 100%;

  overflow-x: auto;

  touch-action: auto;

  @media screen and (max-width: 700px) {
    height: 40px;
  }
`;

const sideBarItemContainer = css`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  cursor: pointer;

  &:hover > * {
    color: var(--color-active);
  }
`;

export default function MenuBar() {
  return (
    <div class={root}>
      <FilesTab />

      <div
        class={sideBarItemContainer}
        style={{
          opacity: editorStore.sidebar ? 1 : 0.75,
        }}
        onClick={() => {
          if (editorStore.sidebar !== 'search') setEditorStore('sidebar', 'search');
          else setEditorStore('sidebar', undefined);
        }}
      >
        <Icon src={'icons/misc/search.png'} base={8} hoverColor='var(--color-active)' />

        <p>search</p>
      </div>
    </div>
  );
}
