import { useEffect, type RefObject } from 'react';

export function useOutsideClick(
  ref: RefObject<HTMLElement | null>,
  onOutside: () => void,
  enabled: boolean,
): void {
  useEffect(() => {
    if (!enabled) return;
    if (typeof document === 'undefined') return;

    let armed = false;
    const armId = requestAnimationFrame(() => {
      armed = true;
    });

    const handler = (event: PointerEvent) => {
      if (!armed) return;
      const target = event.target as Node | null;
      if (!target) return;
      if (ref.current && ref.current.contains(target)) return;
      onOutside();
    };

    document.addEventListener('pointerdown', handler, true);

    return () => {
      cancelAnimationFrame(armId);
      document.removeEventListener('pointerdown', handler, true);
    };
  }, [enabled, onOutside, ref]);
}
