import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FloaterActionsProvider } from './provider';
import { useFloaterActions } from './use-floater-actions';
import type { FloaterAction } from './types';

const sampleActions: FloaterAction[] = [
  { id: 'a', label: 'A', onSelect: vi.fn() },
  { id: 'b', label: 'B', onSelect: vi.fn() },
];

describe('useFloaterActions', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws when used outside Provider', () => {
    expect(() => renderHook(() => useFloaterActions())).toThrow(
      /must be used inside <FloaterActionsProvider>/,
    );
  });

  it('show() opens the bar with provided actions', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FloaterActionsProvider>{children}</FloaterActionsProvider>
    );
    const { result } = renderHook(() => useFloaterActions(), { wrapper });
    expect(result.current.open).toBe(false);
    act(() => result.current.show(sampleActions));
    expect(result.current.open).toBe(true);
    expect(result.current.actions).toHaveLength(2);
  });

  it('hide() closes the bar', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FloaterActionsProvider>{children}</FloaterActionsProvider>
    );
    const { result } = renderHook(() => useFloaterActions(), { wrapper });
    act(() => result.current.show(sampleActions));
    act(() => result.current.hide());
    expect(result.current.open).toBe(false);
  });

  it('toggle() opens then closes', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FloaterActionsProvider>{children}</FloaterActionsProvider>
    );
    const { result } = renderHook(() => useFloaterActions(), { wrapper });
    act(() => result.current.toggle(sampleActions));
    expect(result.current.open).toBe(true);
    act(() => result.current.toggle());
    expect(result.current.open).toBe(false);
  });

  it('show() with empty array warns and is a no-op', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FloaterActionsProvider>{children}</FloaterActionsProvider>
    );
    const { result } = renderHook(() => useFloaterActions(), { wrapper });
    act(() => result.current.show([]));
    expect(result.current.open).toBe(false);
    expect(console.warn).toHaveBeenCalledTimes(1);
  });

  it('integrates with a trigger button', async () => {
    const user = userEvent.setup();
    function Trigger() {
      const { show } = useFloaterActions();
      return (
        <button type="button" onClick={() => show(sampleActions)}>
          open
        </button>
      );
    }
    render(
      <FloaterActionsProvider>
        <Trigger />
      </FloaterActionsProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'open' }));
    expect(screen.getByRole('toolbar')).toBeTruthy();
    expect(screen.getByRole('toolbar').getAttribute('data-state')).toBe('open');
  });
});
