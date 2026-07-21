# Breaking Changes

Cumulative log of breaking changes in `@fireflyframework/design-system`, with migration notes for consumers.

For the full per-release history (including non-breaking changes), see [CHANGELOG.md](CHANGELOG.md).

## How to read this file

- Entries are grouped by version, newest first.
- Every entry states: what changed, why, and the migration path (before / after).
- Pre-1.0 packages may include breaking changes inside minor bumps; they are still listed here.

## [Unreleased]

_No breaking changes pending release._

## [0.4.0] - 2026-07-21

### `ff-button` host classes — style/color split

**What changed.** The host BEM class changed from a single `ff-button--{variant}` (e.g. `.ff-button--primary`, `.ff-button--secondary`) to two orthogonal classes: `ff-button--{style}` (`solid`/`outline`/`ghost`) plus `ff-button--color-{color}` (semantic palette). The `variant` input's default also changed from `primary` to `solid`. The TS input stays backward-compatible — `variant="primary"`/`"secondary"` are still accepted (soft-deprecated) and remapped to `solid` + the matching color — but consumer **CSS** targeting the old classes no longer matches anything.

**Why.** Flydocs' real usage needs the style axis (solid/outline/ghost) and the color axis (primary dominant, but all semantic colors in use) to combine freely; a single fused variant could not express the inventory's combinations.

**Migration.**

Before:

```scss
.ff-button--primary { /* … */ }
.ff-button--secondary { /* … */ }
```

After:

```scss
.ff-button--solid.ff-button--color-primary { /* … */ }
.ff-button--solid.ff-button--color-secondary { /* … */ }
```

Templates relying on the old default should pin it explicitly: `<ff-button variant="solid" color="primary">` (or keep `variant="primary"` during the deprecation window).

**Refs:** FIR-288, [CHANGELOG.md](CHANGELOG.md) `[0.4.0] · Changed`

### New required peer — `@angular/cdk ^21.2.0`

**What changed.** The package now declares `@angular/cdk ^21.2.0` as a peer dependency. Installs without CDK fail to resolve.

**Why.** `ff-select` (portaled overlay), `ff-dialog-container` (focus trap) and `ff-menu-button` (overlay) are built on the CDK primitives instead of hand-rolled positioning.

**Migration.**

Before:

```jsonc
// package.json — no @angular/cdk required
```

After:

```jsonc
"dependencies": {
  "@angular/cdk": "^21.2.0"
}
```

**Refs:** FIR-291, FIR-292, [CHANGELOG.md](CHANGELOG.md) `[0.4.0] · Changed`

### New required peer — `@fireflyframework/design-system-contract >=0.2.0 <1.0.0`

**What changed.** The contract package becomes a declared peer dependency (it was not one at 0.3.0). Consumers must have `@fireflyframework/design-system-contract@>=0.2.0` installed.

**Why.** The `ff-data-table`/`ff-list` patterns type their public surface against `DataTableContract`/`ListContract`, so the contract is now part of the installed graph rather than a dev-only reference.

**Migration.**

Before:

```jsonc
// package.json — design-system only
"@fireflyframework/design-system": "^0.3.0"
```

After:

```jsonc
"@fireflyframework/design-system": "^0.4.0",
"@fireflyframework/design-system-contract": ">=0.2.0 <1.0.0"
```

**Refs:** FIR-293, [CHANGELOG.md](CHANGELOG.md) `[0.4.0] · Changed`
