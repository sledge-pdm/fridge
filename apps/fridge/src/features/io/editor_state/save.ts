import { appCacheDir, join } from '@tauri-apps/api/path';
import { exists, mkdir, writeTextFile } from '@tauri-apps/plugin-fs';
import { EDITOR_STATE_FILENAME, getCurrentEditorState } from '~/features/io/editor_state/model';

export async function saveEditorState(): Promise<void> {
  try {
    const acDir = await appCacheDir();
    // ensure appCacheDir path
    if (!(await exists(acDir))) {
      await mkdir(acDir, {
        recursive: true,
      });
    }
    const path = await join(await appCacheDir(), EDITOR_STATE_FILENAME);
    const state = getCurrentEditorState();
    await writeTextFile(path, JSON.stringify(state, null, 0), {
      create: true, // create if not exists
    });
  } catch (e) {
    console.error('failed to save editor state', e);
  }
}
