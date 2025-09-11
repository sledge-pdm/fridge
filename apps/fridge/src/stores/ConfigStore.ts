import { Theme } from '@sledge/theme';
import { createStore } from 'solid-js/store';

export interface ConfigStore {
  lineHeight: number;
  fontSize: number;
  theme: Theme;
}

const [configStore, setConfigStore] = createStore<ConfigStore>({
  lineHeight: 1.5,
  fontSize: 16,
  theme: 'light',
});

export { configStore };
