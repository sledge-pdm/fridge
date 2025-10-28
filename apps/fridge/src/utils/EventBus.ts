import mitt from 'mitt';

export type Events = {
  'docList:listChanged': {};
  'docList:activeChanged': { activeId: string | undefined };

  'doc:changed': { id: string };
};

export const eventBus = mitt<Events>();
