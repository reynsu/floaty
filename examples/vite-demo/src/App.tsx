import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FloaterActionsProvider,
  useFloaterActions,
  type FloaterAction,
} from 'react-floaty';

// ──────────────────────────────────────────────────────────────────
//  Tiny toast — used by demos to give visible feedback on actions
// ──────────────────────────────────────────────────────────────────
function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  const timer = useRef<number | null>(null);
  const show = (m: string) => {
    setMsg(m);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMsg(null), 1600);
  };
  const node = (
    <div className={`toast ${msg ? 'visible' : ''}`} aria-live="polite">
      {msg}
    </div>
  );
  return { show, node };
}

// ──────────────────────────────────────────────────────────────────
//  Section wrapper
// ──────────────────────────────────────────────────────────────────
function Section({
  step,
  title,
  description,
  children,
}: {
  step: number;
  title: string;
  description: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="card">
      <span className="step">{step}</span>
      <h2>{title}</h2>
      <p className="desc">{description}</p>
      {children}
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════
//  1. QUICK START — minimal API surface
// ══════════════════════════════════════════════════════════════════
function QuickStartInner({ onAction }: { onAction: (m: string) => void }) {
  const { show } = useFloaterActions();
  return (
    <button
      className="primary"
      onClick={() =>
        show([
          { id: 'copy', label: 'Copy', onSelect: () => onAction('Copied') },
          { id: 'share', label: 'Share', onSelect: () => onAction('Shared') },
          {
            id: 'delete',
            label: 'Delete',
            variant: 'danger',
            onSelect: () => onAction('Deleted'),
          },
        ])
      }
    >
      Show 3 actions
    </button>
  );
}

function QuickStart({ onAction }: { onAction: (m: string) => void }) {
  return (
    <Section
      step={1}
      title="Hello world"
      description={
        <>
          Tres acciones, un <code>show()</code>. Sin overflow porque
          actions ≤ <code>maxVisible</code>.
        </>
      }
    >
      <FloaterActionsProvider>
        <QuickStartInner onAction={onAction} />
      </FloaterActionsProvider>
    </Section>
  );
}

// ══════════════════════════════════════════════════════════════════
//  2. PHOTO GALLERY — selection + count-aware labels + overflow
// ══════════════════════════════════════════════════════════════════
type Photo = { id: string; hue: number };
const initialPhotos: Photo[] = Array.from({ length: 9 }, (_, i) => ({
  id: `p${i}`,
  hue: (i * 41) % 360,
}));

function GalleryInner({ onAction }: { onAction: (m: string) => void }) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [removing, setRemoving] = useState<Set<string>>(new Set());
  const { show, hide, open } = useFloaterActions();

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Re-show the bar whenever selection count changes (so labels update)
  useEffect(() => {
    if (selected.size === 0) {
      if (open) hide();
      return;
    }
    const n = selected.size;
    const actions: FloaterAction[] = [
      {
        id: 'share',
        label: `Share (${n})`,
        onSelect: () => onAction(`Shared ${n} photo${n === 1 ? '' : 's'}`),
      },
      {
        id: 'album',
        label: 'Add to album',
        onSelect: () => onAction('Added to album'),
      },
      {
        id: 'delete',
        label: `Delete (${n})`,
        variant: 'danger',
        onSelect: () => {
          setRemoving(new Set(selected));
          window.setTimeout(() => {
            setPhotos((prev) => prev.filter((p) => !selected.has(p.id)));
            setSelected(new Set());
            setRemoving(new Set());
            onAction(`Deleted ${n} photo${n === 1 ? '' : 's'}`);
          }, 220);
        },
      },
      { id: 'tag', label: 'Tag', onSelect: () => onAction('Tagged') },
      { id: 'move', label: 'Move', onSelect: () => onAction('Moved') },
      { id: 'info', label: 'Info', onSelect: () => onAction('Info') },
      { id: 'hide', label: 'Hide', onSelect: () => onAction('Hidden') },
    ];
    show(actions, { dismissOnSelect: false });
    // We intentionally don't depend on `show`/`hide`/`open` in deps — they're stable from the hook
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, photos]);

  return (
    <>
      <div className="grid">
        {photos.map((p) => {
          const isSel = selected.has(p.id);
          const isRm = removing.has(p.id);
          return (
            <div
              key={p.id}
              className={`tile ${isSel ? 'selected' : ''} ${isRm ? 'removing' : ''}`}
              style={{
                background: `linear-gradient(135deg,
                  hsl(${p.hue} 70% 70%),
                  hsl(${(p.hue + 40) % 360} 65% 60%))`,
              }}
              onClick={() => toggle(p.id)}
              role="checkbox"
              aria-checked={isSel}
              aria-label={`Photo ${p.id}`}
            />
          );
        })}
      </div>
      <div className="gallery-meta">
        <span>{photos.length} photos</span>
        <span>{selected.size > 0 ? `${selected.size} selected` : 'Tap to select'}</span>
      </div>
    </>
  );
}

function Gallery({ onAction }: { onAction: (m: string) => void }) {
  return (
    <Section
      step={2}
      title="Photo gallery — selection toolbar"
      description={
        <>
          Toca para seleccionar. La barra reacciona al conteo y usa{' '}
          <code>dismissOnSelect: false</code> para acciones múltiples.
        </>
      }
    >
      <FloaterActionsProvider maxVisible={3}>
        <GalleryInner onAction={onAction} />
      </FloaterActionsProvider>
    </Section>
  );
}

// ══════════════════════════════════════════════════════════════════
//  3. INBOX — bulk actions that mutate the list
// ══════════════════════════════════════════════════════════════════
type Email = {
  id: string;
  from: string;
  subject: string;
  preview: string;
  time: string;
  unread: boolean;
};

const initialEmails: Email[] = [
  { id: 'e1', from: 'GitHub', subject: 'Your PR was merged', preview: 'feat: add provider…', time: '9:42', unread: true },
  { id: 'e2', from: 'Stripe', subject: 'Payout completed', preview: '$1,234.00 sent to your bank', time: '8:15', unread: true },
  { id: 'e3', from: 'Mom', subject: 'Sunday dinner?', preview: 'Hey, are you coming this weekend…', time: '7:30', unread: true },
  { id: 'e4', from: 'Linear', subject: 'New issue assigned', preview: 'KIWI-432: Fix login redirect', time: 'Yesterday', unread: false },
  { id: 'e5', from: 'Figma', subject: 'Comment on design', preview: '"Looks great, but the spacing…"', time: 'Yesterday', unread: false },
];

function InboxInner({ onAction }: { onAction: (m: string) => void }) {
  const [emails, setEmails] = useState(initialEmails);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [removing, setRemoving] = useState<Set<string>>(new Set());
  const { show, hide, open } = useFloaterActions();

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const remove = (ids: Set<string>, msg: string) => {
    setRemoving(new Set(ids));
    window.setTimeout(() => {
      setEmails((prev) => prev.filter((e) => !ids.has(e.id)));
      setChecked(new Set());
      setRemoving(new Set());
      onAction(msg);
    }, 220);
  };

  useEffect(() => {
    if (checked.size === 0) {
      if (open) hide();
      return;
    }
    const n = checked.size;
    const someUnread = emails.some((e) => checked.has(e.id) && e.unread);
    const actions: FloaterAction[] = [
      {
        id: 'archive',
        label: `Archive (${n})`,
        onSelect: () =>
          remove(new Set(checked), `Archived ${n} message${n === 1 ? '' : 's'}`),
      },
      {
        id: 'read',
        label: someUnread ? 'Mark read' : 'Mark unread',
        onSelect: () => {
          setEmails((prev) =>
            prev.map((e) =>
              checked.has(e.id) ? { ...e, unread: !someUnread } : e,
            ),
          );
          setChecked(new Set());
          onAction(someUnread ? 'Marked as read' : 'Marked as unread');
        },
      },
      {
        id: 'delete',
        label: 'Delete',
        variant: 'danger',
        onSelect: () => remove(new Set(checked), `Deleted ${n}`),
      },
      { id: 'snooze', label: 'Snooze', onSelect: () => onAction('Snoozed') },
      { id: 'label', label: 'Label', onSelect: () => onAction('Labeled') },
      { id: 'move', label: 'Move to…', onSelect: () => onAction('Moved') },
      { id: 'spam', label: 'Report spam', variant: 'danger', onSelect: () => onAction('Reported') },
    ];
    show(actions, { dismissOnSelect: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checked, emails]);

  const unreadCount = emails.filter((e) => e.unread).length;

  return (
    <>
      <div className="email-list">
        {emails.length === 0 ? (
          <div className="tile-empty">📭 Inbox zero</div>
        ) : (
          emails.map((e) => {
            const isChk = checked.has(e.id);
            const isRm = removing.has(e.id);
            return (
              <div
                key={e.id}
                className={`email ${e.unread ? 'unread' : 'read'} ${isChk ? 'checked' : ''} ${isRm ? 'removing' : ''}`}
                onClick={() => toggle(e.id)}
              >
                <div className="email-check" aria-hidden="true">
                  {isChk ? '✓' : ''}
                </div>
                <div className="email-body">
                  <div className="email-row">
                    <span className="email-from">
                      {e.unread && <span className="unread-dot" />}
                      {e.from}
                    </span>
                    <span className="email-time">{e.time}</span>
                  </div>
                  <div className="email-subject">{e.subject}</div>
                  <div className="email-preview">{e.preview}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="gallery-meta">
        <span>{unreadCount} unread</span>
        <span>{checked.size > 0 ? `${checked.size} selected` : 'Tap to select'}</span>
      </div>
    </>
  );
}

function Inbox({ onAction }: { onAction: (m: string) => void }) {
  return (
    <Section
      step={3}
      title="Inbox — bulk actions"
      description={
        <>
          Las acciones <em>mutan la lista</em>. La barra muestra el conteo y
          se cierra cuando no queda nada seleccionado.
        </>
      }
    >
      <FloaterActionsProvider maxVisible={3}>
        <InboxInner onAction={onAction} />
      </FloaterActionsProvider>
    </Section>
  );
}

// ══════════════════════════════════════════════════════════════════
//  4. THEMING — same component, three skins via CSS custom properties
// ══════════════════════════════════════════════════════════════════
type Theme = 'default' | 'dark' | 'glass' | 'pill';

const themeActions = (onAction: (m: string) => void): FloaterAction[] => [
  { id: 'a', label: 'Reply', onSelect: () => onAction('Reply') },
  { id: 'b', label: 'Forward', onSelect: () => onAction('Forward') },
  { id: 'c', label: 'Archive', onSelect: () => onAction('Archive') },
  { id: 'd', label: 'Delete', variant: 'danger', onSelect: () => onAction('Delete') },
];

function ThemeCard({
  theme,
  label,
  onAction,
}: {
  theme: Theme;
  label: string;
  onAction: (m: string) => void;
}) {
  const className =
    theme === 'default' ? undefined : `theme-${theme}`;
  return (
    <FloaterActionsProvider maxVisible={3} className={className}>
      <ThemeTrigger label={label} theme={theme} onAction={onAction} />
    </FloaterActionsProvider>
  );
}

function ThemeTrigger({
  label,
  theme,
  onAction,
}: {
  label: string;
  theme: Theme;
  onAction: (m: string) => void;
}) {
  const { show } = useFloaterActions();
  return (
    <button
      type="button"
      className={`theme-btn ${theme}`}
      onClick={() => show(themeActions(onAction))}
    >
      {label}
    </button>
  );
}

function Themes({ onAction }: { onAction: (m: string) => void }) {
  return (
    <Section
      step={4}
      title="Theming with CSS custom properties"
      description={
        <>
          Tres temas, cero JS extra. Cada Provider pasa una{' '}
          <code>className</code> distinta que sobreescribe variables CSS.
        </>
      }
    >
      <div className="themes">
        <ThemeCard theme="default" label="Default" onAction={onAction} />
        <ThemeCard theme="dark" label="Dark" onAction={onAction} />
        <ThemeCard theme="glass" label="Glass" onAction={onAction} />
      </div>
      <div style={{ marginTop: 8 }}>
        <ThemeCard theme="pill" label="Pill / dock-style" onAction={onAction} />
      </div>
    </Section>
  );
}

// ══════════════════════════════════════════════════════════════════
//  5. POWER USER — keyboard shortcut + programmatic toggle
// ══════════════════════════════════════════════════════════════════
function PowerUserInner({ onAction }: { onAction: (m: string) => void }) {
  const { toggle } = useFloaterActions();

  const actions = useMemo<FloaterAction[]>(
    () => [
      { id: 'new', label: 'New file', onSelect: () => onAction('New file') },
      { id: 'open', label: 'Open', onSelect: () => onAction('Open project') },
      { id: 'find', label: 'Search', onSelect: () => onAction('Search') },
      { id: 'cmd', label: 'Run command', onSelect: () => onAction('Run command') },
      { id: 'theme', label: 'Toggle theme', onSelect: () => onAction('Theme toggled') },
      { id: 'settings', label: 'Settings', onSelect: () => onAction('Settings') },
      { id: 'help', label: 'Help', onSelect: () => onAction('Help') },
    ],
    [onAction],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggle(actions);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggle, actions]);

  const isMac =
    typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

  return (
    <>
      <div className="kbd-hint">
        <span>
          Press <span className="kbd">{isMac ? '⌘' : 'Ctrl'}</span>{' '}
          <span className="kbd">K</span> to <b>toggle</b> the bar
        </span>
        <button
          type="button"
          className="primary"
          style={{ width: 'auto', padding: '8px 14px', fontSize: 13 }}
          onClick={() => toggle(actions)}
        >
          Toggle
        </button>
      </div>
    </>
  );
}

function PowerUser({ onAction }: { onAction: (m: string) => void }) {
  return (
    <Section
      step={5}
      title="Programmatic + keyboard"
      description={
        <>
          <code>toggle()</code> abre o cierra reusando las últimas acciones.
          Combina con <code>keydown</code> para tener un command palette.
        </>
      }
    >
      <FloaterActionsProvider maxVisible={3} className="theme-pill">
        <PowerUserInner onAction={onAction} />
      </FloaterActionsProvider>
    </Section>
  );
}

// ══════════════════════════════════════════════════════════════════
//  Root
// ══════════════════════════════════════════════════════════════════
export function App() {
  const toast = useToast();
  return (
    <main>
      <header className="hero">
        <span className="badge">demo</span>
        <h1>floaty</h1>
        <p>De lo más simple a un command palette con un solo Provider</p>
      </header>

      <QuickStart onAction={toast.show} />
      <Gallery onAction={toast.show} />
      <Inbox onAction={toast.show} />
      <Themes onAction={toast.show} />
      <PowerUser onAction={toast.show} />

      <p className="foot">
        Cada sección tiene su propio <code>FloaterActionsProvider</code>.
        <br />
        Solo una barra a la vez.
      </p>

      {toast.node}
    </main>
  );
}
