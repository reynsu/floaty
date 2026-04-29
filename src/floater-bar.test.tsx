import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FloaterActionsProvider } from './provider';
import { useFloaterActions } from './use-floater-actions';
import type { FloaterAction } from './types';

function makeActions(count: number): FloaterAction[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `id-${i}`,
    label: `Label ${i}`,
    onSelect: vi.fn(),
  }));
}

function Harness({ actions }: { actions: FloaterAction[] }) {
  const { show, hide } = useFloaterActions();
  return (
    <div>
      <button type="button" onClick={() => show(actions)}>
        open
      </button>
      <button type="button" onClick={hide}>
        close
      </button>
      <p data-testid="outside">outside element</p>
    </div>
  );
}

describe('FloaterBar', () => {
  it('renders maxVisible buttons + overflow when needed', async () => {
    const user = userEvent.setup();
    const actions = makeActions(5);
    render(
      <FloaterActionsProvider maxVisible={3}>
        <Harness actions={actions} />
      </FloaterActionsProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'open' }));
    const toolbar = screen.getByRole('toolbar');
    const buttons = toolbar.querySelectorAll('.fa-action');
    expect(buttons).toHaveLength(3);
    expect(toolbar.querySelector('.fa-more')).toBeTruthy();
  });

  it('does not render overflow when actions <= maxVisible', async () => {
    const user = userEvent.setup();
    const actions = makeActions(3);
    render(
      <FloaterActionsProvider maxVisible={3}>
        <Harness actions={actions} />
      </FloaterActionsProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'open' }));
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar.querySelector('.fa-more')).toBeNull();
  });

  it('clicking an action invokes onSelect and closes by default', async () => {
    const user = userEvent.setup();
    const actions = makeActions(2);
    render(
      <FloaterActionsProvider>
        <Harness actions={actions} />
      </FloaterActionsProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'open' }));
    await user.click(screen.getByRole('button', { name: 'Label 0' }));
    expect(actions[0]!.onSelect).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('toolbar').getAttribute('data-state')).toBe('closed');
  });

  it('outside pointerdown closes the bar', async () => {
    const user = userEvent.setup();
    const actions = makeActions(2);
    render(
      <FloaterActionsProvider>
        <Harness actions={actions} />
      </FloaterActionsProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'open' }));
    // wait for rAF to arm the outside-click listener
    await act(async () => {
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    });
    fireEvent.pointerDown(screen.getByTestId('outside'));
    expect(screen.getByRole('toolbar').getAttribute('data-state')).toBe('closed');
  });

  it('Escape key closes the bar when closeOnEscape is true', async () => {
    const user = userEvent.setup();
    const actions = makeActions(2);
    render(
      <FloaterActionsProvider>
        <Harness actions={actions} />
      </FloaterActionsProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'open' }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.getByRole('toolbar').getAttribute('data-state')).toBe('closed');
  });

  it('Escape key does NOT close when closeOnEscape=false', async () => {
    const user = userEvent.setup();
    const actions = makeActions(2);
    render(
      <FloaterActionsProvider closeOnEscape={false}>
        <Harness actions={actions} />
      </FloaterActionsProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'open' }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.getByRole('toolbar').getAttribute('data-state')).toBe('open');
  });

  it('overflow popover reveals remaining actions', async () => {
    const user = userEvent.setup();
    const actions = makeActions(5);
    render(
      <FloaterActionsProvider maxVisible={3}>
        <Harness actions={actions} />
      </FloaterActionsProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'open' }));
    const more = screen.getByRole('button', { name: 'More actions' });
    await user.click(more);
    expect(screen.getByRole('menu')).toBeTruthy();
    expect(screen.getAllByRole('menuitem')).toHaveLength(2);
  });

  it('selecting an overflow item invokes its handler', async () => {
    const user = userEvent.setup();
    const actions = makeActions(5);
    render(
      <FloaterActionsProvider maxVisible={3}>
        <Harness actions={actions} />
      </FloaterActionsProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'open' }));
    await user.click(screen.getByRole('button', { name: 'More actions' }));
    await user.click(screen.getByRole('menuitem', { name: 'Label 3' }));
    expect(actions[3]!.onSelect).toHaveBeenCalledTimes(1);
  });

  it('disabled action is non-interactive', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const actions: FloaterAction[] = [
      { id: 'd', label: 'Disabled', onSelect, disabled: true },
    ];
    render(
      <FloaterActionsProvider>
        <Harness actions={actions} />
      </FloaterActionsProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'open' }));
    await user.click(screen.getByRole('button', { name: 'Disabled' }));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('renders icon + label side by side when both are provided', async () => {
    const user = userEvent.setup();
    const actions: FloaterAction[] = [
      { id: 'copy', label: 'Copy', icon: <span data-testid="icon-copy">★</span>, onSelect: vi.fn() },
    ];
    render(
      <FloaterActionsProvider>
        <Harness actions={actions} />
      </FloaterActionsProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'open' }));
    const button = screen.getByRole('button', { name: 'Copy' });
    expect(button.querySelector('.fa-icon')).toBeTruthy();
    expect(button.querySelector('.fa-label')?.textContent).toBe('Copy');
    expect(screen.getByTestId('icon-copy')).toBeTruthy();
    expect(button.getAttribute('data-icon-only')).toBeNull();
  });

  it('renders icon-only when label is omitted, uses ariaLabel for accessibility', async () => {
    const user = userEvent.setup();
    const actions: FloaterAction[] = [
      {
        id: 'pin',
        icon: <span data-testid="icon-pin">📌</span>,
        ariaLabel: 'Pin item',
        onSelect: vi.fn(),
      },
    ];
    render(
      <FloaterActionsProvider>
        <Harness actions={actions} />
      </FloaterActionsProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'open' }));
    const button = screen.getByRole('button', { name: 'Pin item' });
    expect(button.querySelector('.fa-label')).toBeNull();
    expect(button.querySelector('.fa-icon')).toBeTruthy();
    expect(button.getAttribute('data-icon-only')).toBe('true');
  });

  it('warns in dev when icon-only action lacks ariaLabel', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const actions: FloaterAction[] = [
      { id: 'mute', icon: <span>🔇</span>, onSelect: vi.fn() },
    ];
    function Trigger() {
      const { show } = useFloaterActions();
      return <button onClick={() => show(actions)}>go</button>;
    }
    render(
      <FloaterActionsProvider>
        <Trigger />
      </FloaterActionsProvider>,
    );
    fireEvent.click(screen.getByText('go'));
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('icon-only — provide ariaLabel'),
    );
    warn.mockRestore();
  });

  it('warns in dev when action has neither label nor icon', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const actions: FloaterAction[] = [{ id: 'empty', onSelect: vi.fn() }];
    function Trigger() {
      const { show } = useFloaterActions();
      return <button onClick={() => show(actions)}>go</button>;
    }
    render(
      <FloaterActionsProvider>
        <Trigger />
      </FloaterActionsProvider>,
    );
    fireEvent.click(screen.getByText('go'));
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('neither label nor icon'),
    );
    warn.mockRestore();
  });

  it('unmounts after close transition ends', async () => {
    const user = userEvent.setup();
    const actions = makeActions(2);
    render(
      <FloaterActionsProvider>
        <Harness actions={actions} />
      </FloaterActionsProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'open' }));
    await user.click(screen.getByRole('button', { name: 'close' }));
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar.getAttribute('data-state')).toBe('closed');
    fireEvent.transitionEnd(toolbar, { propertyName: 'transform' });
    expect(screen.queryByRole('toolbar')).toBeNull();
  });
});
