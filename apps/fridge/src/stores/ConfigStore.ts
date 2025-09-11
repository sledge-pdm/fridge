import { Theme } from '@sledge/theme';
import { createStore } from 'solid-js/store';

export interface ConfigStore {
  lineHeight: number;
  fontSize: number;
  theme: Theme;
}

const [configStore, setConfigStore] = createStore<ConfigStore>({
  lineHeight: 1.5,
  fontSize: 12,
  theme: 'light',
});

export function setTheme(theme: Theme) {
  setConfigStore('theme', theme);
}

export { configStore };
