import { useCallback, useContext, useMemo, useSyncExternalStore } from 'react';
import { FloaterContext } from './context';
import type { FloaterAction, FloaterApi, ShowOptions } from './types';
import { warnDev } from './warn';

export function useFloaterActions(): FloaterApi {
  const ctx = useContext(FloaterContext);
  if (!ctx) {
    throw new Error(
      '[floaty] useFloaterActions must be used inside <FloaterActionsProvider>',
    );
  }
  const { store } = ctx;

  const state = useSyncExternalStore(
    store.subscribe,
    store.getState,
    store.getServerState,
  );

  const show = useCallback(
    (actions: FloaterAction[], options?: ShowOptions) => {
      if (!Array.isArray(actions) || actions.length === 0) {
        warnDev('show() called with empty actions array — ignoring');
        return;
      }
      store.setState({ open: true, actions, options: options ?? {} });
    },
    [store],
  );

  const hide = useCallback(() => {
    store.setState({ open: false });
  }, [store]);

  const toggle = useCallback(
    (actions?: FloaterAction[]) => {
      const current = store.getState();
      if (current.open) {
        store.setState({ open: false });
        return;
      }
      const nextActions = actions ?? current.actions;
      if (nextActions.length === 0) {
        warnDev('toggle() called with no actions and store is empty — ignoring');
        return;
      }
      store.setState({ open: true, actions: nextActions });
    },
    [store],
  );

  return useMemo(
    () => ({ ...state, show, hide, toggle }),
    [state, show, hide, toggle],
  );
}
