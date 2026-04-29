import { useEffect, useState, type ReactNode } from 'react';
import type { FloaterAction } from './types';

type Props = {
  actions: FloaterAction[];
  open: boolean;
  onClose: () => void;
  onSelect: (action: FloaterAction) => void;
  trigger: (toggle: () => void, isOpen: boolean) => ReactNode;
};

export function OverflowPopover({ actions, open, onClose, onSelect, trigger }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!open) setIsOpen(false);
  }, [open]);

  const toggle = () => setIsOpen((prev) => !prev);

  return (
    <>
      {trigger(toggle, isOpen)}
      {isOpen && (
        <div className="fa-popover" role="menu" data-state={isOpen ? 'open' : 'closed'}>
          {actions.map((action) => {
            const hasLabel = Boolean(action.label);
            const hasIcon = action.icon != null;
            const accessibleName = action.ariaLabel ?? action.label;
            return (
              <button
                key={action.id}
                type="button"
                role="menuitem"
                className="fa-popover-item"
                data-variant={action.variant ?? 'default'}
                data-icon-only={hasIcon && !hasLabel ? 'true' : undefined}
                disabled={action.disabled}
                aria-label={!hasLabel ? accessibleName : action.ariaLabel}
                onClick={() => {
                  onSelect(action);
                  setIsOpen(false);
                  onClose();
                }}
              >
                {hasIcon && (
                  <span className="fa-icon" aria-hidden="true">
                    {action.icon}
                  </span>
                )}
                {hasLabel && <span className="fa-label">{action.label}</span>}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
