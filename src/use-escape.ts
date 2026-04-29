import { useEffect } from 'react';

export function useEscape(onEscape: () => void, enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;
    if (typeof document === 'undefined') return;

    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onEscape();
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [enabled, onEscape]);
}
