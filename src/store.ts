import type { FloaterState } from './types';

type Listener = () => void;

const initial: FloaterState = {
  open: false,
  actions: [],
  options: {},
};

export type Store = {
  getState: () => FloaterState;
  getServerState: () => FloaterState;
  subscribe: (listener: Listener) => () => void;
  setState: (next: Partial<FloaterState>) => void;
};

export function createStore(): Store {
  let state: FloaterState = initial;
  const listeners = new Set<Listener>();

  return {
    getState: () => state,
    getServerState: () => initial,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    setState: (next) => {
      state = { ...state, ...next };
      listeners.forEach((l) => l());
    },
  };
}
