import type { ReactNode } from 'react';

export type ActionVariant = 'default' | 'danger';

export type FloaterAction = {
  id: string;
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  disabled?: boolean;
  variant?: ActionVariant;
};

export type ShowOptions = {
  maxVisible?: number;
  dismissOnSelect?: boolean;
};

export type FloaterState = {
  open: boolean;
  actions: FloaterAction[];
  options: ShowOptions;
};

export type FloaterActionsProviderProps = {
  children: ReactNode;
  maxVisible?: number;
  portalContainer?: HTMLElement;
  className?: string;
  closeOnOutsideClick?: boolean;
  closeOnEscape?: boolean;
};

export type FloaterApi = FloaterState & {
  show: (actions: FloaterAction[], options?: ShowOptions) => void;
  hide: () => void;
  toggle: (actions?: FloaterAction[]) => void;
};
