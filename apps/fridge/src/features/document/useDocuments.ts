import { Accessor, createSignal, onMount } from 'solid-js';
import { documentsManager } from '~/features/document/DocumentsManager';
import { FridgeDocument } from '~/features/document/model';
import { eventBus, Events } from '~/utils/EventBus';

export function useDocuments(): {
  documents: Accessor<FridgeDocument[]>;
} {
  const [documents, setDocuments] = createSignal<FridgeDocument[]>(documentsManager.getDocs().slice());

  const handleDocListChanged = (e: Events['docList:listChanged']) => {
    setDocuments(documentsManager.getDocs().slice());
  };

  onMount(() => {
    eventBus.on('docList:listChanged', handleDocListChanged);

    return () => {
      eventBus.off('docList:listChanged', handleDocListChanged);
    };
  });

  return { documents };
}

export function useActiveDoc(): {
  activeDoc: Accessor<FridgeDocument | undefined>;
  activeIndex: Accessor<number>;
} {
  const [activeDoc, setActiveDoc] = createSignal<FridgeDocument | undefined>(documentsManager.getActiveDoc());
  const [activeIndex, setActiveIndex] = createSignal<number>(documentsManager.getActiveIndex());

  const handleActiveChanged = (e: Events['docList:activeChanged']) => {
    const index = documentsManager.IndexOf(e.activeId);
    setActiveIndex(index);
    setActiveDoc({ ...documentsManager.fromIndex(index) } as FridgeDocument);
  };
  const handleDocChanged = (e: Events['doc:changed']) => {
    if (e.id === documentsManager.getActiveId()) {
      setActiveDoc({ ...documentsManager.getActiveDoc() } as FridgeDocument);
    }
  };

  onMount(() => {
    eventBus.on('docList:activeChanged', handleActiveChanged);
    eventBus.on('doc:changed', handleDocChanged);

    return () => {
      eventBus.off('docList:activeChanged', handleActiveChanged);
      eventBus.off('doc:changed', handleDocChanged);
    };
  });

  return { activeDoc, activeIndex };
}

export function useDoc(id: string): {
  doc: Accessor<FridgeDocument | undefined>;
  isActive: Accessor<boolean>;
} {
  const [doc, setDoc] = createSignal<FridgeDocument | undefined>(documentsManager.fromId(id));
  const [isActive, setIsActive] = createSignal<boolean>(id === documentsManager.getActiveId());

  const handleActiveChanged = (e: Events['docList:activeChanged']) => {
    setIsActive(e.activeId === id);
  };
  const handleDocChanged = (e: Events['doc:changed']) => {
    console.log(`doc:changed: ${e.id} for ${id}`);
    if (e.id === id) {
      setDoc({ ...documentsManager.fromId(id) } as FridgeDocument);
    }
  };

  onMount(() => {
    eventBus.on('docList:activeChanged', handleActiveChanged);
    eventBus.on('doc:changed', handleDocChanged);

    return () => {
      eventBus.off('docList:activeChanged', handleActiveChanged);
      eventBus.off('doc:changed', handleDocChanged);
    };
  });

  return { doc, isActive };
}
