# Changelog

All notable changes to `@fireflyframework/design-system` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
