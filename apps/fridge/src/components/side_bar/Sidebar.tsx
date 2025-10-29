import { css } from '@acab/ecsstatic';
import { fonts } from '@sledge/theme';
import { Component } from 'solid-js';
import Search from '~/components/side_bar/Search';

const root = css`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-x: hidden;
  border-left: 1px solid var(--color-border-secondary);
`;

export type SidebarContents = 'search';

const Sidebar: Component = () => {
  return (
    <div class={root}>
      <Search />

      <p
        style={{
          position: 'absolute',
          bottom: 0,
          'font-size': '24px',
          'font-family': fonts.ZFB31,
          'margin-top': 'auto',
          opacity: 0.1,
          padding: '28px 24px',
        }}
      >
        FRIDGE.
      </p>
    </div>
  );
};

export default Sidebar;
