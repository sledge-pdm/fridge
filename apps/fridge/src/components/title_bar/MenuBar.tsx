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
  min-height: 32px;
  height: 32px;
  width: 100%;

  @media screen and (max-width: 700px) {
    height: 40px;
  }
`;

const sideItemContainer = css`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  cursor: pointer;

  &:hover > * {
    color: var(--color-active);
  }
`;
const tabContainer = css`
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100%;

  box-sizing: content-box;
  overflow-x: auto;
  touch-action: auto;

  &::-webkit-scrollbar {
    height: 1px;
    background-color: transparent;
  }

  &::-webkit-thumb {
    background-color: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #888;
  }
`;

const sideItemsContainer = css`
  display: flex;
  flex-direction: row;
  height: 100%;
  padding-left: 8px;
`;

const divider = css`
  display: flex;
  flex-direction: row;
  width: 1px;
  height: 50%;
  background-color: var(--color-on-background);
  opacity: 0.15;
`;

export default function MenuBar() {
  return (
    <div class={root}>
      <div class={tabContainer}>
        <FilesTab />
      </div>
      <div class={divider} />

      <div class={sideItemsContainer}>
        <div
          class={sideItemContainer}
          onClick={() => {
            if (editorStore.sidebar !== 'search') setEditorStore('sidebar', 'search');
            else setEditorStore('sidebar', undefined);
          }}
        >
          <Icon src={'icons/misc/search.png'} base={8} hoverColor='var(--color-active)' />

          <p>search</p>
        </div>
      </div>
    </div>
  );
}
