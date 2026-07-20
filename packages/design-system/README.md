# @fireflyframework/design-system

Reference implementation of the **Firefly Design System**: standalone Angular components (`ff-*`), design tokens (`--ff-*`) and theming hooks used by Firefly products. Programs against — and is verified by — [`@fireflyframework/design-system-contract`](../design-system-contract/README.md).

## Install

Published to GitHub Packages:

```bash
npm install @fireflyframework/design-system
# peer deps: @angular/common ^21.2, @angular/core ^21.2, @angular/forms ^21.2
```

## What's inside

**23 primitives** — `ff-button`, `ff-icon-button`, `ff-badge`, `ff-loader`, `ff-input`, `ff-checkbox`, `ff-radio`, `ff-select`, `ff-card`, `ff-dialog`, `ff-toast`, `ff-banner`, `ff-bottom-sheet`, `ff-divider`, `ff-chip`, `ff-link`, `ff-avatar`, `ff-tooltip`, `ff-icon`, `ff-panel`, `ff-progress`, `ff-skeleton`, `ff-empty-state`.

**6 patterns** — `ff-tab-bar` (composes `ff-icon` + `ff-badge`), `ff-toast-container`, `ff-dialog-container`, `ff-menu-button`, `ff-data-table` and `ff-list` (the last two share a selection/pagination/expansion/empty-state model, including the `provideFfNoResultsConfig` no-results provider, and compose `ff-checkbox`, `ff-skeleton`, `ff-empty-state`, `ff-icon`, `ff-button` and `ff-select`).

Composition hierarchy is strict and contract-verified: *primitives compose nothing; patterns compose only primitives; layouts (upcoming) never compose layouts.*

All components are `standalone: true`, `OnPush`, signal-based (`input()`/`output()`), BEM-classed and themable exclusively through CSS custom properties.

## Usage

```ts
import { FfButtonComponent, FfPanelComponent } from '@fireflyframework/design-system';

@Component({
  standalone: true,
  imports: [FfButtonComponent, FfPanelComponent],
  template: `
    <ff-panel appearance="alert" variant="warning" heading="Heads up">
      Something needs your attention.
      <ff-button ff-panel-actions variant="secondary" (clicked)="dismiss()">Dismiss</ff-button>
    </ff-panel>
  `,
})
export class ExampleComponent {}
```

### Forms (ControlValueAccessor)

`ff-input`, `ff-checkbox`, `ff-radio` and `ff-select` implement `ControlValueAccessor` — they work with Reactive Forms and `ngModel`. The classic `value`/`valueChange` API keeps working when no forms directive is attached.

```html
<ff-input label="Email" type="email" [formControl]="email" />
```

### Icons

`ff-icon` renders named SVG paths from an injectable, mergeable registry — bring your product's icon set:

```ts
// app.config.ts
import { provideFfIcons } from '@fireflyframework/design-system';

providers: [provideFfIcons({ check: 'M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z' })];
```

```html
<ff-icon name="check" size="sm" />           <!-- decorative: aria-hidden -->
<ff-icon name="check" label="Completed" />   <!-- semantic: role="img" -->
```

## Design tokens & theming

Token sheets ship with the package (`./tokens` export):

```scss
// styles.scss
@use '@fireflyframework/design-system/tokens' as *;
```

- Tokens are CSS custom properties on `:root` (`--ff-color-*`, `--ff-spacing-*`, `--ff-radius-*`, `--ff-font-*`, `--ff-elevation-*`), with per-component tokens (`--ff-button-*`, `--ff-panel-*`, …) for scoped customization.
- **Dark mode**: `[data-theme="dark"]` on `<html>` (falls back to `prefers-color-scheme`).
- **Runtime theming per tenant**: `TenantThemeService` in `@fireflyframework/core` overrides the same tokens at runtime — cascade: defaults → tenant → dark → tenant-dark.

### Overriding a component token by context

A component's **base** tokens (e.g. `--ff-select-min-width`, `--ff-panel-bg`) are *consumed* with a fallback and never *declared* by the component itself:

```scss
// ff-select.component.scss
.ff-select {
  min-width: var(--ff-select-min-width, 180px);
}
```

This is deliberate: a custom property specified on an element always wins over one inherited from an ancestor. If the component declared `--ff-select-min-width: 180px;` on `.ff-select` itself, that declaration would always be the specified value for every `ff-select`, and no surrounding container could ever narrow or widen it — the ancestor's value would be inherited but immediately shadowed. Skipping the local declaration and only ever reading the token through `var(--token, <default>)` leaves the property open for any ancestor to set, while the fallback keeps the original look when nobody does.

To retint or resize a component from a specific context, set its token on a container that wraps it:

```scss
// A pagination footer that needs its page-size select to shrink below the
// component's own 180px floor, without touching ff-select itself.
.ff-list__page-size {
  --ff-select-min-width: 0;
  width: 6rem;
}
```

```html
<div class="ff-list__page-size">
  <ff-select [options]="pageSizeOptions" ... />
</div>
```

The same technique works for any other base token (`--ff-panel-bg`, `--ff-button-radius`, `--ff-input-border`, …): declare the token on a wrapping element, not on the component's own class.

**Variant tokens are the exception.** A variant modifier picks the final value for that variant on the element itself (`.ff-panel--warning { --ff-panel-accent: var(--ff-color-warning-500); }`), so an ancestor cannot override it — the element's own declaration wins. Retint a variant through the palette instead (`--ff-color-warning-500` on `:root` or a theme scope), which is what the variant resolves from.

## Living catalog

The monorepo's `playground` app is the catalog: every component with its real variants, a foundations page rendering the token scales, and a theming page with dark toggle + token inspector.

```bash
pnpm nx serve playground
```

## Further reading

- Decoupling contract: `@fireflyframework/design-system-contract` (component contracts, required tokens, hierarchy verifier).
- Architecture, Hub UI equivalence matrices and migration strategy: [`docs/firefly-design-system-catalog-and-flydocs-migration.md`](../../docs/firefly-design-system-catalog-and-flydocs-migration.md).
- Changelog: [CHANGELOG.md](./CHANGELOG.md).
