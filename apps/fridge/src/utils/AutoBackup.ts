import { appCacheDir, join } from '@tauri-apps/api/path';
import { exists, readTextFile, rename, writeTextFile } from '@tauri-apps/plugin-fs';
import { editorStore, type EditorStore } from '~/stores/EditorStore';
import { isTauri } from './TauriUtils';

// バックアップファイル名
const BACKUP_FILE_NAME = 'editor_backup.json';
const TMP_FILE_NAME = BACKUP_FILE_NAME + '.tmp';

let _saving = false;
let _queued = false;
let _lastSerialized: string | null = null;

// デバウンスの遅延 (ms)
const DEBOUNCE_MS = 1000;
let _debounceTimer: number | null = null;

async function backupDir(): Promise<string | null> {
  if (!(await isTauri())) return null;
  return await appCacheDir();
}

async function backupPath(): Promise<string | null> {
  const dir = await backupDir();
  if (!dir) return null;
  return await join(dir, BACKUP_FILE_NAME);
}

async function tmpPath(): Promise<string | null> {
  const dir = await backupDir();
  if (!dir) return null;
  return await join(dir, TMP_FILE_NAME);
}

function serialize(store: EditorStore): string {
  // 必要十分なフィールドのみ保存（将来拡張向けにバージョン付与）
  return JSON.stringify({ v: 1, currentDocumentId: store.currentDocumentId, documents: store.documents }, null, 0);
}

async function writeAtomic(content: string): Promise<void> {
  const p = await backupPath();
  const tp = await tmpPath();
  if (!p || !tp) return;
  await writeTextFile(tp, content);
  // rename は上書きを許容
  await rename(tp, p).catch(async () => {
    // 失敗時はフォールバックとして直接書き込み
    await writeTextFile(p, content);
  });
}

async function _saveNow(): Promise<void> {
  if (_saving) {
    _queued = true;
    return;
  }
  _saving = true;
  try {
    const serialized = _lastSerialized ?? serialize(editorStore);
    await writeAtomic(serialized);
  } catch (e) {
    console.error('[AutoBackup] save failed', e);
  } finally {
    _saving = false;
    if (_queued) {
      _queued = false;
      _saveNow();
    }
  }
}

function scheduleSave() {
  if (_debounceTimer) {
    clearTimeout(_debounceTimer);
  }
  _debounceTimer = setTimeout(() => {
    _lastSerialized = serialize(editorStore);
    _saveNow();
  }, DEBOUNCE_MS) as unknown as number;
}

export function requestBackupSave() {
  // 内容を直列化してキャッシュ（serialize が重くなっても UI スレッドを短く）
  _lastSerialized = serialize(editorStore);
  scheduleSave();
}

export async function flushBackup(): Promise<void> {
  if (_debounceTimer) {
    clearTimeout(_debounceTimer);
    _debounceTimer = null;
  }
  _lastSerialized = serialize(editorStore);
  await _saveNow();
}

export interface RestoreResult {
  restored: boolean;
  reason?: string;
}

export async function restoreBackup(apply: (data: Partial<EditorStore>) => void): Promise<RestoreResult> {
  if (!(await isTauri())) return { restored: false, reason: 'not-tauri' };
  try {
    const p = await backupPath();
    if (!p) return { restored: false, reason: 'no-path' };
    if (!(await exists(p))) return { restored: false, reason: 'no-file' };
    const txt = await readTextFile(p);
    const parsed = JSON.parse(txt);
    if (!parsed || typeof parsed !== 'object') return { restored: false, reason: 'bad-json' };
    if (parsed.v !== 1) return { restored: false, reason: 'version-mismatch' };
    if (!Array.isArray(parsed.documents)) return { restored: false, reason: 'no-documents' };

    apply({ currentDocumentId: parsed.currentDocumentId ?? null, documents: parsed.documents });
    return { restored: true };
  } catch (e) {
    console.error('[AutoBackup] restore failed', e);
    return { restored: false, reason: 'exception' };
  }
}
