import { css } from '@acab/ecsstatic';
import { Component, createMemo } from 'solid-js';
import ThemeDropdown from '~/components/bottom_bar/ThemeDropdown';
import { fromId } from '~/features/document/service';
import { editorStore } from '~/stores/EditorStore';
import { flexRow } from '~/styles/styles';

const pathText = css`
  margin-right: auto;

  @media screen and (max-width: 700px) {
    display: none;
  }
`;
const themeToggleContainer = css`
  display: flex;
  flex-direction: column;
  margin-left: auto;
  /* margin-right: 8px; */
`;

const BottomBar: Component = () => {
  const activeDoc = createMemo(() => fromId(editorStore.activeDocId));

  return (
    <div
      class={flexRow}
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '24px',
        'align-items': 'center',
        padding: '0 4px',
        'border-top': `1px solid var(--color-border-secondary)`,
        background: 'var(--color-background)',
      }}
    >
      {/* <p class={pathText}>{activeDoc()?.filePath || ''}</p> */}
      <div class={themeToggleContainer}>
        <ThemeDropdown noBackground />
      </div>
      {/* <p>{activeDoc()?.toPlain().length} letters.</p> */}
    </div>
  );
};

export default BottomBar;
