import * as path from '@tauri-apps/api/path';
import { save } from '@tauri-apps/plugin-dialog';
import { exists, writeTextFile } from '@tauri-apps/plugin-fs';
import { fromId, refreshContentOnLoad } from '~/features/document/service';
import { normalizeJoin } from '~/utils/FileUtils';

export async function saveWithOverwrite(docId: string): Promise<string | null> {
  const doc = fromId(docId);
  if (!doc) return null;

  const filePath = doc.getFilePath();
  if (!filePath) return null;
  await writeTextFile(filePath, doc.getContent());
  refreshContentOnLoad(doc.getId());

  return filePath;
}

export async function saveWithSelect(docId: string): Promise<string | null> {
  const doc = fromId(docId);
  if (!doc) return null;

  const filePath = await save({
    title: 'save document',
    canCreateDirectories: true,
    defaultPath: normalizeJoin(await path.documentDir()),
    filters: [{ name: 'Text Files', extensions: ['txt'] }],
  });
  if (!filePath) {
    return null;
  }

  await writeTextFile(filePath, doc.getContent());
  refreshContentOnLoad(doc.getId());

  return filePath;
}

interface SaveDocumentOptions {
  forceNew: boolean;
}

export async function saveDocument(docId: string, options?: SaveDocumentOptions): Promise<string | null> {
  const doc = fromId(docId);
  if (!doc) return null;

  const savedPath = doc.getFilePath();
  const isSavedFileExists = !savedPath || !(await exists(savedPath));
  const shouldNew = options?.forceNew || !isSavedFileExists;

  if (shouldNew) {
    return await saveWithSelect(docId);
  } else {
    return await saveWithOverwrite(docId);
  }
}
