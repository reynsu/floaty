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
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              role="menuitem"
              className="fa-popover-item"
              data-variant={action.variant ?? 'default'}
              disabled={action.disabled}
              onClick={() => {
                onSelect(action);
                setIsOpen(false);
                onClose();
              }}
            >
              {action.icon && <span className="fa-icon" aria-hidden="true">{action.icon}</span>}
              <span className="fa-label">{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </>
  );
}
