import * as path from '@tauri-apps/api/path';
import { save } from '@tauri-apps/plugin-dialog';
import { writeTextFile } from '@tauri-apps/plugin-fs';
import { FridgeDocument } from '~/features/document/models/FridgeDocument';
import { normalizeJoin } from '~/utils/FileUtils';

export async function overwrite(document: FridgeDocument) {
  if (!document.filePath) return null;

  await writeTextFile(document.filePath, document.toPlain());
}

export async function saveToFile(data: string, filename: string): Promise<string | null> {
  const filePath = await save({
    title: 'save document',
    canCreateDirectories: true,
    defaultPath: normalizeJoin(await path.documentDir(), filename),
    filters: [{ name: 'Text Files', extensions: ['txt'] }],
  });
  if (!filePath) {
    return null;
  }

  await writeTextFile(filePath, data);

  return filePath;
}
