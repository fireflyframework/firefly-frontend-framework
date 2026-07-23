# Changelog

All notable changes to `@fireflyframework/design-system` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- `ff-accordion` pattern (composes `ff-panel` and `ff-icon` only): stacked disclosure sections in `single` (default) or `multiple` expansion mode, fully controlled through `expandedIds`/`expandedIdsChange`; each section header is a native `<button>` with `aria-expanded`/`aria-controls`, its body a `role="region"` with `aria-labelledby` that goes `inert` while collapsed; the collapse height animates via a CSS grid track transition that is skipped under `prefers-reduced-motion: reduce`; new `FfAccordionSectionTemplateDirective` (`[ffAccordionSection]`), `FfAccordionMode`, `FfAccordionSection` and `FfAccordionSectionTemplateContext` types
- `ff-avatar`: `size` now also accepts a literal pixel number (proportional initials font size); `name` derives initials automatically (first + last word, uppercased) when the explicit `initials` input is unset; `round`/`cornerRadius` for a square shape with a custom corner radius; `tone` decorative background palette mirroring `ff-badge`'s `color` axis; new `FfAvatarTone` type

## [0.4.0] - 2026-07-21

### Added
- `ff-data-table` — composition-tier pattern (composes `ff-checkbox`, `ff-skeleton`, `ff-empty-state`, `ff-icon`, `ff-button`, `ff-select`): typed headers with cell/row/expansion templates, server-side sorting, single/multi selection with a "select all" checkbox, expandable rows, server-side pagination with an optional page-size control, a `caption` input and a `rowLabel` input naming each row's checkbox/expand toggle
- `ff-list` — composition-tier pattern sharing `ff-data-table`'s selection/pagination/expansion/empty-state model without columns; renders a real `role="listbox"` with a full keyboard contract (arrows, Home/End, Space, Enter) and `role="option"` entries when selection is enabled
- `FF_NO_RESULTS_CONFIG` / `provideFfNoResultsConfig()`: shared empty-state text configuration for `ff-data-table` and `ff-list`
- `compareWith` input on `ff-data-table` and `ff-list`: lets selection/expansion membership survive a re-fetch that returns equivalent but non-identical objects, instead of the default reference equality
- `ariaLabel` input on `ff-checkbox`, applied as `aria-label` on the native input when `label` is empty
- `ff-badge`: `color` axis (7 semantic colors, takes precedence over `variant`), `dot` status mode, `shape` (`pill`/`square`), size `xs`, and `maxWidth` with an automatic overflow `title` tooltip; new `FfBadgeColor`/`FfBadgeShape` types
- `ff-button`: the style/color split — `variant` keeps the style axis (`solid`/`outline`/`ghost`) and the new `color` input takes the semantic palette; new `FfButtonColor` type
- `ff-menu-button` pattern (`FfMenuButtonComponent`, `FfMenuButtonItem`): button-triggered dropdown menu over the CDK overlay
- `ff-input`: `[ff-input-prefix]`/`[ff-input-suffix]` affix slots, `debounceTime`, `type="search"` with a `search` output, and `labelType` (`default`/`floating`/`hidden`); new `FfInputLabelType` type
- `ff-toast-container` pattern (`FfToastContainerComponent`, `FfToastItem`): presentational toast stack driven by the consumer's alert service
- `ff-dialog-container` pattern (`FfDialogContainerComponent` with a CDK focus trap, `FfDialogItem`/`FfDialogResolution`)
- `ff-select`: rewritten over a portaled CDK overlay — `multiple` with `values`/`valuesChange`, `bindLabel`/`bindValue`, and option/label template directives; new `FfSelectOptionLike`/`FfSelectTemplateContext` types

### Changed
- **BREAKING:** `ff-button` host classes renamed from `ff-button--{variant}` to `ff-button--{style}` plus `ff-button--color-{color}`, and the `variant` default changed from `primary` to `solid` — see [BREAKING-CHANGES.md](BREAKING-CHANGES.md)
- **BREAKING:** new required peer dependency `@angular/cdk ^21.2.0` (overlay/focus-trap for `ff-select`, `ff-dialog-container` and `ff-menu-button`) — see [BREAKING-CHANGES.md](BREAKING-CHANGES.md)
- **BREAKING:** new required peer dependency `@fireflyframework/design-system-contract ">=0.2.0 <1.0.0"` (the `DataTableContract`/`ListContract` additions) — see [BREAKING-CHANGES.md](BREAKING-CHANGES.md)
- Component tokens are now consumed with a literal fallback instead of declared with defaults (`var(--ff-btn-radius, var(--ff-radius-md))`), so any ancestor scope can override a component token by context; token names are unchanged

## [0.3.0] - 2026-07-18

### Added
- `ff-icon` primitive with the injectable, mergeable `FF_ICONS` registry and `provideFfIcons()` — pack-agnostic SVG icons (sm/md/lg, aria-hidden by default, `role="img"` with `label`)
- `ff-panel` primitive: `card`/`alert` appearances, semantic variants, `heading` input plus `[ff-panel-heading]`/`[ff-panel-actions]`/`[ff-panel-footer]` projection slots
- `ff-progress` primitive: accessible determinate progress bar (`role="progressbar"`, clamped value, `showValue`)
- `ff-skeleton` primitive: text/rect/circle placeholders, multi-line text, shimmer honouring `prefers-reduced-motion`
- `ff-empty-state` primitive with projected `[ff-empty-state-icon]` and actions slot
- `ff-tab-bar` — first composition-tier **pattern** (composes `ff-icon` + `ff-badge` only): underline/pills tab strip with tablist semantics and roving-tabindex keyboard navigation
- `ControlValueAccessor` support in `ff-input`, `ff-checkbox`, `ff-radio` and `ff-select` — Reactive Forms and ngModel now work; the classic `value`/`valueChange` API keeps working when no forms directive is attached
- Design tokens are now shipped with the package (`tokens/` copied into the dist with a `./tokens` exports entry) so consumers can `@use` the token sheets

### Changed
- New peer dependency: `@angular/forms ^21.2.0` (required by the CVA-enabled form primitives)

## [0.2.0] and earlier

Released before this changelog existed (18 original `ff-*` primitives, design tokens with dark mode). See git history.
