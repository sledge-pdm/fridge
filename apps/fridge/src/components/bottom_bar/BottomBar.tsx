import { css } from '@acab/ecsstatic';
import { Component } from 'solid-js';
import ThemeDropdown from '~/components/bottom_bar/ThemeDropdown';
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
  return (
    <div
      class={flexRow}
      style={{
        width: '100%',
        height: '24px',
        'align-items': 'center',
        padding: '0 4px',
        'border-top': `1px solid var(--color-border-secondary)`,
        background: 'var(--color-background)',
      }}
    >
      <div class={themeToggleContainer}>
        <ThemeDropdown noBackground />
      </div>
    </div>
  );
};

export default BottomBar;
