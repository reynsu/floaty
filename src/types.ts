import type { ReactNode } from 'react';

export type ActionVariant = 'default' | 'danger';

/**
 * One row in the floating bar.
 *
 * - With `label` only      → text-only button
 * - With `icon` only       → icon-only button (must supply `ariaLabel` for a11y)
 * - With both              → icon + label, side by side
 *
 * `ariaLabel` overrides the accessible name of the button. Required when
 * `label` is omitted; optional when `label` is present.
 */
export type FloaterAction = {
  id: string;
  label?: string;
  icon?: ReactNode;
  ariaLabel?: string;
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
