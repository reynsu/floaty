import { useMemo, useRef } from 'react';
import { FloaterContext, type FloaterContextValue } from './context';
import { createStore, type Store } from './store';
import { FloaterBar } from './floater-bar';
import type { FloaterActionsProviderProps } from './types';

export function FloaterActionsProvider({
  children,
  maxVisible = 3,
  portalContainer,
  className,
  closeOnOutsideClick = true,
  closeOnEscape = true,
}: FloaterActionsProviderProps) {
  const storeRef = useRef<Store | null>(null);
  if (storeRef.current === null) {
    storeRef.current = createStore();
  }

  const value = useMemo<FloaterContextValue>(
    () => ({
      store: storeRef.current!,
      config: {
        maxVisible,
        closeOnOutsideClick,
        closeOnEscape,
        portalContainer,
        className,
      },
    }),
    [maxVisible, closeOnOutsideClick, closeOnEscape, portalContainer, className],
  );

  return (
    <FloaterContext.Provider value={value}>
      {children}
      <FloaterBar />
    </FloaterContext.Provider>
  );
}
