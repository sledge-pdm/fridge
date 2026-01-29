import { Dropdown, themeOptions } from '@sledge-pdm/ui';
import { Theme } from '@tauri-apps/api/window';
import { Component } from 'solid-js';
import { configStore, setTheme } from '~/stores/ConfigStore';

const ThemeDropdown: Component<{ noBackground?: boolean }> = (props) => {
  return (
    <Dropdown
      value={configStore.theme}
      options={themeOptions}
      noBackground={props.noBackground}
      onChange={(v) => {
        setTheme(v as Theme);
      }}
    />
  );
};

export default ThemeDropdown;
