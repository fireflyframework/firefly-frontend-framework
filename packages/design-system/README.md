# @fireflyframework/design-system

Angular standalone primitives and design tokens for Firefly products.

This package contains the reusable UI layer of the Firefly Frontend Framework. Use it for product-level screens, shared feature components, and showcase examples that need the official Firefly look and behavior.

For ecosystem context, see `../../../firefly-docs/reference/framework-packages.md` from this package directory.

## Installation

```bash
npm install @fireflyframework/design-system
```

Peer dependencies:

```bash
npm install @angular/core @angular/common
```

## Usage

Import standalone components directly from the package root:

```typescript
import { Component } from '@angular/core';
import { FfButtonComponent, FfInputComponent } from '@fireflyframework/design-system';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [FfButtonComponent, FfInputComponent],
  template: `
    <ff-input label="Customer" placeholder="Search by name" />
    <ff-button>Search</ff-button>
  `,
})
export class ExampleComponent {}
```

## Primitives

| Component | Purpose | Key API |
|---|---|---|
| `FfButtonComponent` | Primary actions | `variant: primary | secondary | outline | ghost`, `size: sm | md | lg`, `disabled`, `loading` |
| `FfIconButtonComponent` | Icon-only actions | `icon`, `tooltip`, `size: sm | md | lg`, `disabled` |
| `FfBadgeComponent` | Status labels | `variant: success | warning | error | info | neutral`, `size: sm | md` |
| `FfLoaderComponent` | Loading states | `variant: spinner | skeleton`, `size: sm | md | lg` |
| `FfInputComponent` | Text and textarea fields | `type: text | number | password | textarea`, `label`, `placeholder`, `value`, `hint`, `error`, `disabled` |
| `FfCheckboxComponent` | Boolean selection | `checked`, `indeterminate`, `label`, `disabled` |
| `FfRadioGroupComponent` | Single choice groups | `options`, `value`, `orientation: horizontal | vertical`, `disabled` |
| `FfSelectComponent` | Select fields | `options`, `value`, `placeholder`, `searchable`, `disabled` |
| `FfCardComponent` | Framed content block | `shadow: none | sm | md | lg` |
| `FfDialogComponent` | Modal dialog | `open`, `title`, `type: success | error | warning | info`, `dismissible` |
| `FfToastComponent` | Toast notification | `message`, `type: success | error | warning | info`, `icon`, `dismissible` |
| `FfBannerComponent` | Inline message | `message`, `type: success | error | warning | info`, `icon`, `actionLabel`, `dismissible` |
| `FfBottomSheetComponent` | Bottom sheet message/action | `open`, `title`, `message`, `type`, `dismissible` |
| `FfDividerComponent` | Section divider | `orientation: horizontal | vertical`, `thickness: thin | medium` |
| `FfChipComponent` | Compact tag/filter | `variant: default | filter | removable`, `size: sm | md`, `selected`, `disabled` |
| `FfLinkComponent` | Link styling | `href`, `target: _self | _blank`, `variant: inline | standalone`, `underline`, `disabled` |
| `FfAvatarComponent` | User/entity avatar | `src`, `initials`, `alt`, `size: sm | md | lg` |
| `FfTooltipComponent` | Tooltip wrapper | `text`, `position: top | bottom | left | right` |

## Tokens

SCSS tokens live under `src/lib/tokens`:

- `_breakpoints.scss`
- `_colors.scss`
- `_dark.scss`
- `_material-m3-bridge.scss`
- `_radius.scss`
- `_shadows.scss`
- `_spacing.scss`
- `_typography.scss`
- `index.scss`

Use `index.scss` as the stable entry point when consuming the full token set from framework code. Product consumption conventions still need to be finalized and documented.

## Showcase

`firefly-showcase` contains living examples of each primitive under `src/app/features/catalog/ui/pages/primitives-page`.

When adding or changing a primitive, update:

1. The component implementation and tests in this package.
2. The corresponding showcase page.
3. This README if the public API changes.

## Commands

```bash
nx test design-system
nx build design-system
nx lint design-system
```

## Documentation status

This README documents the current public exports. More detailed usage guidance should live in the showcase and in focused component docs if a primitive grows beyond a simple API table.
