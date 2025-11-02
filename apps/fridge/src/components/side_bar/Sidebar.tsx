import { css } from '@acab/ecsstatic';
import { Component } from 'solid-js';
import Search from '~/components/side_bar/Search';

const root = css`
  display: flex;
  flex-direction: column;
  height: 100%;
  border-left: 1px solid var(--color-border-secondary);
`;

export type SidebarContents = 'search';

const Sidebar: Component = () => {
  return (
    <div class={root}>
      <Search />
    </div>
  );
};

export default Sidebar;
