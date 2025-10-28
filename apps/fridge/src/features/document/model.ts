export interface FridgeDocument {
  id: string;
  title: string;
  content: string;

  // file association
  associatedFilePath?: string;
}
