import { readTextFile } from "@tauri-apps/plugin-fs";

export async function readFromFile(path: string): Promise<string> {
  const fileContent = await readTextFile(path);
  return fileContent;
}
