import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type TransitionEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { FloaterContext } from './context';
import { useFloaterActions } from './use-floater-actions';
import { useOutsideClick } from './use-outside-click';
import { useEscape } from './use-escape';
import { OverflowPopover } from './overflow-popover';
import type { FloaterAction } from './types';

export function FloaterBar() {
  const ctx = useContext(FloaterContext);
  const { open, actions, options, hide } = useFloaterActions();
  const ref = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  const onTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    // Only react to the bar's own transition (not bubbled from children)
    if (event.target !== event.currentTarget) return;
    // We have one transitioned element. Both transform + opacity will fire,
    // but calling setMounted(false) twice when already false is a no-op.
    if (!open) setMounted(false);
  };

  const handleSelect = useCallback(
    (action: FloaterAction) => {
      if (action.disabled) return;
      action.onSelect();
      if (options.dismissOnSelect !== false) {
        hide();
      }
    },
    [options.dismissOnSelect, hide],
  );

  const handleOutside = useCallback(() => {
    hide();
  }, [hide]);

  const closeOnOutsideClick = ctx?.config.closeOnOutsideClick ?? true;
  const closeOnEscape = ctx?.config.closeOnEscape ?? true;

  useOutsideClick(ref, handleOutside, mounted && open && closeOnOutsideClick);
  useEscape(handleOutside, mounted && open && closeOnEscape);

  if (!ctx) return null;
  if (!mounted) return null;
  if (typeof document === 'undefined') return null;

  const maxVisible = options.maxVisible ?? ctx.config.maxVisible;
  const visible = actions.slice(0, maxVisible);
  const overflow = actions.slice(maxVisible);
  const hasOverflow = overflow.length > 0;

  const className = ['fa-bar', ctx.config.className].filter(Boolean).join(' ');
  const container = ctx.config.portalContainer ?? document.body;

  const node = (
    <div
      ref={ref}
      className={className}
      role="toolbar"
      aria-label="Floating actions"
      data-state={open ? 'open' : 'closed'}
      onTransitionEnd={onTransitionEnd}
    >
      {visible.map((action) => {
        const hasLabel = Boolean(action.label);
        const hasIcon = action.icon != null;
        const accessibleName = action.ariaLabel ?? action.label;
        return (
          <button
            key={action.id}
            type="button"
            className="fa-action"
            data-variant={action.variant ?? 'default'}
            data-icon-only={hasIcon && !hasLabel ? 'true' : undefined}
            disabled={action.disabled}
            aria-label={!hasLabel ? accessibleName : action.ariaLabel}
            onClick={() => handleSelect(action)}
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
      {hasOverflow && (
        <OverflowPopover
          actions={overflow}
          open={open}
          onClose={() => {
            if (options.dismissOnSelect !== false) hide();
          }}
          onSelect={(action) => {
            if (action.disabled) return;
            action.onSelect();
          }}
          trigger={(toggle, isOpen) => (
            <button
              type="button"
              className="fa-more"
              aria-label="More actions"
              aria-haspopup="menu"
              aria-expanded={isOpen}
              onClick={toggle}
            >
              <span aria-hidden="true">+</span>
            </button>
          )}
        />
      )}
    </div>
  );

  return createPortal(node, container);
}
