import { useSyncExternalStore } from 'react';

type Listener = () => void;
type Updater<T> = Partial<T> | ((state: T) => Partial<T>);

export type Store<T> = {
  getState: () => T;
  setState: (update: Updater<T>) => void;
  subscribe: (listener: Listener) => () => void;
};

/** Minimal external store; components subscribe to slices via `useStoreSelector`. */
export function createStore<T extends object>(initial: T): Store<T> {
  let state = initial;
  const listeners = new Set<Listener>();
  return {
    getState: () => state,
    setState: (update) => {
      const patch = typeof update === 'function' ? update(state) : update;
      state = { ...state, ...patch };
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export function useStoreSelector<T, S>(store: Store<T>, selector: (state: T) => S): S {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
    () => selector(store.getState()),
  );
}
