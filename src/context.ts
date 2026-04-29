import { createContext } from 'react';
import type { Store } from './store';
import type { FloaterActionsProviderProps } from './types';

export type FloaterContextValue = {
  store: Store;
  config: Required<
    Pick<
      FloaterActionsProviderProps,
      'maxVisible' | 'closeOnOutsideClick' | 'closeOnEscape'
    >
  > & {
    portalContainer?: HTMLElement;
    className?: string;
  };
};

export const FloaterContext = createContext<FloaterContextValue | null>(null);
