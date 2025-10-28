import { FridgeDocument } from '~/features/document/model';
import { eventBus } from '~/utils/EventBus';

// a class that manages documents "opening" states
export class DocumentsManager {
  private docs: FridgeDocument[] = [];
  private activeId: string | undefined;

  getDocs() {
    return this.docs;
  }

  getActiveId() {
    return this.activeId;
  }

  getActiveDoc(): FridgeDocument | undefined {
    return this.activeId ? this.fromId(this.activeId) : undefined;
  }

  getActiveIndex(): number {
    return this.IndexOf(this.activeId);
  }

  setActive(id?: string) {
    this.activeId = id;
    eventBus.emit('docList:activeChanged', { activeId: this.activeId });
  }

  constructor() {}

  fromIndex(index: number): FridgeDocument | undefined {
    if (index < 0 || this.docs.length <= index) return undefined;
    else return this.docs[index];
  }

  IndexOf(id?: string): number {
    return this.docs.findIndex((d) => d.id === id);
  }

  fromId(id: string): FridgeDocument | undefined {
    return this.docs.find((d) => d.id === id);
  }

  replaceDocuments(docs: FridgeDocument[], activeId?: string) {
    this.docs = docs;
    if (activeId) {
      this.activeId = activeId;
    } else {
      if (docs.length > 0) this.activeId = docs[0].id;
      else this.activeId = undefined;
    }

    eventBus.emit('docList:listChanged', {});
    eventBus.emit('docList:activeChanged', { activeId: this.activeId });
  }

  addDocument(doc: FridgeDocument, setActive: boolean = true) {
    this.docs.push(doc);
    eventBus.emit('docList:listChanged', {});
    if (setActive) {
      this.setActive(doc.id);
    }
    // requestBackupSave();
  }

  removeDocument(id: string) {
    let removingDoc = this.fromId(id);
    if (!removingDoc) return;

    let removingIndex = this.IndexOf(removingDoc.id);
    let activeDoc = this.getActiveDoc();
    const beforeActiveId = this.activeId;

    console.log(`[0] removing ${id}(${removingDoc.title}) at ${removingIndex} (current active = ${activeDoc?.id}(${activeDoc?.title}))`);
    if (id === activeDoc?.id) {
      if (removingIndex !== 0 && this.docs.length > 1) {
        const nextDoc = this.fromIndex(removingIndex - 1);
        if (nextDoc) this.setActive(nextDoc.id);
      } else {
        this.setActive(undefined);
      }
    }

    this.docs = this.docs.filter((doc) => doc.id !== id);
    eventBus.emit('docList:listChanged', {});
  }

  replaceDocument(id: string, doc: FridgeDocument) {
    const index = this.IndexOf(id);
    if (index < 0) return;
    this.docs[index] = doc;
  }

  updateActive(updates: Partial<FridgeDocument>) {
    if (this.activeId) this.update(this.activeId, updates);
  }

  update(id: string, updates: Partial<FridgeDocument>) {
    if (!id) return;
    const index = documentsManager.IndexOf(id);
    const doc = documentsManager.fromIndex(index);

    if (!doc) return;

    documentsManager.replaceDocument(id, { ...doc, ...updates });

    eventBus.emit('doc:changed', { id });

    // requestBackupSave();
  }
}

export const documentsManager = new DocumentsManager();
