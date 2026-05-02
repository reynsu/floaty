# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] — 2026-05-02

Initial public release as `@reynsu/react-floaty`.

### Added
- `<FloaterActionsProvider />` component with configurable `maxVisible`,
  `portalContainer`, `className`, `closeOnOutsideClick`, `closeOnEscape`.
- `useFloaterActions()` hook returning `{ open, actions, options, show, hide, toggle }`.
- `FloaterAction` shape supporting text-only, icon + text, and icon-only buttons.
  Icon-only requires `ariaLabel` for accessibility (dev warning otherwise).
- `variant: 'danger'` for destructive actions.
- Overflow popover (`role="menu"` + `role="menuitem"`) when actions exceed `maxVisible`.
- `dismissOnSelect: false` keeps the bar open across selections (multi-select flows).
- 24 CSS custom properties for theming, plus structural knobs
  (`--fa-display`, `--fa-width`, `--fa-height`) and per-button `--fa-i` / `--fa-n`
  for radial / arc / grid layouts in pure CSS.
- `prefers-reduced-motion: reduce` honored — animations disabled.
- WAI-ARIA toolbar role + Escape / pointerdown-outside dismissal.
- SSR-safe via `useSyncExternalStore` with stable server snapshot.

### Build
- ESM + CJS dual output via tsup, full TypeScript declarations.
- ~9 KB ESM unminified (~3 KB gzipped).
- Zero runtime dependencies. React 18+ and react-dom 18+ as peers.
- Sideeffects limited to `*.css`.

[0.1.0]: https://github.com/reynsu/floaty/releases/tag/v0.1.0
