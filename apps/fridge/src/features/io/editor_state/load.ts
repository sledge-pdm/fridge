import { appCacheDir } from '@tauri-apps/api/path';
import { exists, readTextFile } from '@tauri-apps/plugin-fs';
import { replaceDocuments } from '~/features/document/service';
import { EDITOR_STATE_FILENAME, SavedEditorState } from '~/features/io/editor_state/model';
import { normalizeJoin } from '~/utils/FileUtils';

export async function loadEditorState(): Promise<{
  restored: boolean;
  reason?: string;
}> {
  try {
    const path = normalizeJoin(await appCacheDir(), EDITOR_STATE_FILENAME);
    if (!(await exists(path))) return { restored: false, reason: 'no-file' };

    const txt = await readTextFile(path);
    const state = JSON.parse(txt) as SavedEditorState;

    replaceDocuments(
      state.documents.map((d) => {
        return {
          ...d,
          contentsOnOpen: {
            title: d.title,
            content: d.content,
          },
        };
      }),
      state.activeId
    );

    return { restored: true };
  } catch (e) {
    console.error('failed to load editor state', e);
    return { restored: false, reason: 'exception: ' + e };
  }
}
