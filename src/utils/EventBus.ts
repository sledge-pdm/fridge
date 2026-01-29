import mitt from 'mitt';

export type Events = {
  'doc:changed': { id: string };
  'doc:requestSearch': { query: string };
};

export const eventBus = mitt<Events>();
