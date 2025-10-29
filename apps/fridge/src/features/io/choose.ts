import { open } from '@tauri-apps/plugin-dialog';

export async function showChooseFileDialog(): Promise<string | null> {
  const result = await open({
    title: 'Open document',
    multiple: false,
    filters: [{ name: 'Text Files', extensions: ['txt'] }],
  });
  return result;
}
