# @reynsu/react-floaty

[![npm](https://img.shields.io/npm/v/@reynsu/react-floaty.svg)](https://www.npmjs.com/package/@reynsu/react-floaty)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@reynsu/react-floaty)](https://bundlephobia.com/package/@reynsu/react-floaty)
[![types](https://img.shields.io/npm/types/@reynsu/react-floaty.svg)](https://www.npmjs.com/package/@reynsu/react-floaty)
[![license](https://img.shields.io/npm/l/@reynsu/react-floaty.svg)](./LICENSE)

Mobile-first floating action toolbar for React. **Zero runtime dependencies** (React/ReactDOM as peers).

- ~8 KB ESM, tree-shakable
- CSS-only animations — no `framer-motion`, no JS animation lib
- External store via `useSyncExternalStore` — consumers re-render only when they read state
- Headless-friendly: theme via CSS custom properties, override with `className`
- Accessible: WAI-ARIA toolbar role, ESC + outside-click dismiss
- SSR-safe

## Install

```bash
npm i @reynsu/react-floaty
```

## Quick start

```tsx
import { FloaterActionsProvider, useFloaterActions } from '@reynsu/react-floaty';
import '@reynsu/react-floaty/styles.css';

function App() {
  return (
    <FloaterActionsProvider maxVisible={3}>
      <Page />
    </FloaterActionsProvider>
  );
}

function Page() {
  const { show } = useFloaterActions();
  return (
    <button
      onClick={() =>
        show([
          { id: 'copy',   label: 'Copy',   onSelect: () => copy() },
          { id: 'share',  label: 'Share',  onSelect: () => share() },
          { id: 'delete', label: 'Delete', variant: 'danger', onSelect: () => del() },
          { id: 'archive', label: 'Archive', onSelect: () => archive() },
          { id: 'pin',    label: 'Pin',    onSelect: () => pin() },
        ])
      }
    >
      Open actions
    </button>
  );
}
```

The first three actions render as visible buttons. Anything beyond `maxVisible` collapses into a `+` overflow popover.

## API

### `<FloaterActionsProvider />`

| Prop | Type | Default | Description |
|---|---|---|---|
| `maxVisible` | `number` | `3` | Visible action buttons before overflow |
| `portalContainer` | `HTMLElement` | `document.body` | Portal target |
| `className` | `string` | — | Extra class applied to the bar |
| `closeOnOutsideClick` | `boolean` | `true` | Pointerdown outside the bar dismisses it |
| `closeOnEscape` | `boolean` | `true` | Escape key dismisses it |

### `useFloaterActions()`

Returns `{ open, actions, options, show, hide, toggle }`.

| Method | Signature | Notes |
|---|---|---|
| `show` | `(actions: FloaterAction[], options?: ShowOptions) => void` | No-op + dev warning on empty array |
| `hide` | `() => void` | |
| `toggle` | `(actions?: FloaterAction[]) => void` | Reuses last actions if not provided |

### `FloaterAction`

```ts
type FloaterAction = {
  id: string;
  label?: string;       // optional — omit for icon-only buttons
  icon?: ReactNode;     // optional — supply alongside or instead of label
  ariaLabel?: string;   // overrides accessible name; required when label is omitted
  onSelect: () => void;
  disabled?: boolean;
  variant?: 'default' | 'danger';
};
```

The component picks the right rendering based on what you pass:

```tsx
// Text only
{ id: 'copy', label: 'Copy', onSelect: copy }

// Icon + text (icon renders left of label)
{ id: 'copy', label: 'Copy', icon: <CopyIcon />, onSelect: copy }

// Icon only — supply ariaLabel for screen readers.
// The button auto-squares to --fa-action-h via [data-icon-only].
{ id: 'pin', icon: <PinIcon />, ariaLabel: 'Pin item', onSelect: pin }
```

### `ShowOptions`

```ts
type ShowOptions = {
  maxVisible?: number;       // override Provider default for this show call
  dismissOnSelect?: boolean; // default true
};
```

## Theming

All visual tokens are CSS custom properties on `.fa-bar`. Override globally or via `className`:

```css
.fa-bar.theme-dark {
  --fa-bg: #1a1d24;
  --fa-fg: #f5f6fa;
  --fa-action-bg: rgba(255,255,255,0.06);
  --fa-action-bg-hover: rgba(255,255,255,0.12);
  --fa-radius: 16px;
  --fa-z: 1000;
}
```

Then pass it to the provider:

```tsx
<FloaterActionsProvider className="theme-dark">…</FloaterActionsProvider>
```

### Beyond the row — radial, arc, grid, spiral

The bar exposes three structural knobs and per-button index/count vars so you can
build any layout in pure CSS:

| Knob | Default | Purpose |
|---|---|---|
| `--fa-display` | `flex` | Set to `block` / `grid` to escape the default flex row |
| `--fa-width` | `min(100% - 24px, 520px)` | Bar width |
| `--fa-height` | `auto` | Bar height — set to a fixed value for square/round canvases |
| `--fa-i` (per button) | `0..n-1` | The button's index — set as inline style on every `.fa-action` |
| `--fa-n` (per button) | `slot count` | Total visible slots (visible actions + overflow trigger) |

Example — radial donut with 6 actions orbiting a center point:

```css
.theme-radial.fa-bar {
  --fa-display: block;
  --fa-width:  220px;
  --fa-height: 220px;
  --fa-bg: transparent;
  --fa-shadow: none;
}
.theme-radial .fa-action {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  transform:
    translate(-50%, -50%)
    rotate(calc(var(--fa-i) * 360deg / var(--fa-n)))
    translateY(-90px)
    rotate(calc(-1 * var(--fa-i) * 360deg / var(--fa-n)));
  transition-delay: calc(var(--fa-i) * 35ms);
}
```

The same primitives compose into arcs (`180deg` instead of `360deg`), spirals
(animate `translateY` over `var(--fa-i)`), or grids (`display: grid` + `grid-area`).

## Accessibility

- Bar uses `role="toolbar"` and `aria-label="Floating actions"`
- Overflow uses `role="menu"` + `role="menuitem"`, with `aria-haspopup` and `aria-expanded` on the trigger
- `prefers-reduced-motion: reduce` disables transitions

## Local development

```bash
npm install
npm run typecheck
npm test
npm run build
```

To run the demo app:

```bash
cd examples/vite-demo
npm install
npm run dev
```

## License

[MIT](./LICENSE) © reynsu
