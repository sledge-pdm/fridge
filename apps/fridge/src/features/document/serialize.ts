import { FridgeDocument } from '~/features/document/FridgeDocument';

export interface SerializedDocument {
  title?: string;
  content: string;
  filePath?: string;
  id?: string;
}

export function serializeDocument(doc: FridgeDocument): SerializedDocument {
  return {
    title: doc.getTitle(),
    content: doc.getContent(),
    filePath: doc.getFilePath(),
    id: doc.getId(),
  };
}

export function deserializeDocument(serialized: SerializedDocument): FridgeDocument {
  const { title, content, filePath, id } = serialized;
  return new FridgeDocument(title, content, filePath, id);
}
