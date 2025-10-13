import { css } from '@acab/ecsstatic';
import { fonts } from '@sledge/theme';
import { Component } from 'solid-js';

const root = css`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
  width: auto;
  min-width: 300px;
  padding: 28px 24px;
  overflow: hidden;

  border-right: 1px solid var(--color-border-secondary);
`;

const searchLabel = css`
  margin-bottom: 4px;
  color: var(--color-muted);
`;
const searchInput = css`
  font-family: PM12;
  font-size: 12px;
  padding: 4px;
  background-color: var(--color-surface);
`;

const Sidebar: Component = () => {
  return (
    <div class={root}>
      <p class={searchLabel}>search document.</p>
      <input class={searchInput} placeholder='search...' />

      {/* <DocumentsList /> */}
      <p
        style={{
          'font-size': '24px',
          'font-family': fonts.ZFB31,
          'margin-top': 'auto',
          opacity: 0.1,
        }}
      >
        FRIDGE.
      </p>
    </div>
  );
};

export default Sidebar;
