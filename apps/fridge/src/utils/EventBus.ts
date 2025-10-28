import mitt from 'mitt';

export type Events = {
  'doc:changed': { id: string };
};

export const eventBus = mitt<Events>();
