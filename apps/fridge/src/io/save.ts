import * as path from '@tauri-apps/api/path';
import { save } from '@tauri-apps/plugin-dialog';
import { writeTextFile } from '@tauri-apps/plugin-fs';
import { join } from '~/utils/FileUtils';

export async function saveToFile(data: string, filename: string): Promise<string | null> {
  const filePath = await save({
    title: 'save document',
    canCreateDirectories: true,
    defaultPath: join(await path.documentDir(), filename),
    filters: [{ name: 'Text Files', extensions: ['txt'] }],
  });
  if (!filePath) {
    return null;
  }

  await writeTextFile(filePath, data);
  return filePath;
}
