import { describe, expect, it, vi } from 'vitest';
import { createStore } from './store';

describe('createStore', () => {
  it('starts with closed state and empty actions', () => {
    const store = createStore();
    expect(store.getState()).toEqual({ open: false, actions: [], options: {} });
  });

  it('returns the same closed state for server snapshot', () => {
    const store = createStore();
    expect(store.getServerState()).toEqual({ open: false, actions: [], options: {} });
  });

  it('notifies subscribers on setState', () => {
    const store = createStore();
    const listener = vi.fn();
    store.subscribe(listener);
    store.setState({ open: true });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getState().open).toBe(true);
  });

  it('unsubscribes correctly', () => {
    const store = createStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    unsubscribe();
    store.setState({ open: true });
    expect(listener).not.toHaveBeenCalled();
  });

  it('isolates state across stores', () => {
    const a = createStore();
    const b = createStore();
    a.setState({ open: true });
    expect(b.getState().open).toBe(false);
  });
});
