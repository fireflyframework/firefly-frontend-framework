# Flydocs → Firefly (`--ff-*`) token equivalence

This document maps every `--ff-*` token actually consumed by a design-system
component to its Flydocs product-theme equivalent, and records the fixture
that ports those values into the playground for visual comparison.

## Scope and method

The design-system contract declares 135 `--ff-*` tokens, but the components
in `packages/design-system/src/lib` only ever read 73 distinct global tokens
(the rest are component-scoped tokens with a hardcoded fallback, or unused).
That 73-token set is the actual visual-parity surface, obtained with:

```
grep -rhoE "var\(--ff-(color|spacing|radius|font|elevation|text|shadow|breakpoint)[a-z0-9-]*" \
  --include="*.component.scss" packages/design-system/src/lib | sed 's/var(//' | sort -u
```

Of the 73 matches, one (`--ff-color-`) is a regex artifact: it comes from
`ff-button.component.scss`'s `@each $color in primary, secondary, success,
warning, error, info, neutral` loop, where the token name is built with Sass
interpolation (`var(--ff-color-#{$color}-500)`). The regex captures the
literal prefix before the interpolation break; it is not an independent
token. Every concrete stop that loop resolves to (`primary-500`,
`success-600`, etc.) is already covered elsewhere in the list. **72 real
tokens** remain, which this document maps one by one.

For every token, the Flydocs source (`_theme-flydocs.scss` /
`_theme-dark.scss`, `--hub-*` vocabulary over ng-hub-ui-ds 22.5) was read for
the **role** the value plays — not the token's name — before choosing an
equivalent. Three outcomes are used:

- **Direct** — Flydocs pins an explicit value for the same role (a `--hub-sys-*`
  role token, or the ramp stop at the same numeric position in an equivalent
  ramp), copied as-is.
- **Derived** — no single Flydocs value maps 1:1 to the role; a value was
  synthesized from sibling Flydocs data with the reasoning recorded below.
- **No equivalent** — Flydocs does not touch this role for the shared
  design-system layer at all. These tokens are left un-overridden in the
  fixture: the design-system default stands, rather than inventing a value
  Flydocs itself never designed.

## Result summary

| Category | Count |
|---|---|
| Real tokens analyzed | 72 |
| Direct equivalent | 49 |
| Derived equivalent | 9 |
| No equivalent (left un-overridden) | 14 |
| Regex artifact (not a real token) | 1 |

## Fixture

The ported values live in `apps/playground/src/app/themes/_flydocs-theme.scss`
(light) and `_flydocs-theme-dark.scss` (dark), scoped under
`:root[data-brand="flydocs"]` / `:root[data-brand="flydocs"][data-theme="dark"]`.
`apps/playground/src/app/shared/brand-theme.service.ts` toggles the
`data-brand` attribute the same way the existing `ThemeService` toggles
`data-theme`; both axes are independent and combine. The design-system
package itself is untouched — this is a playground-only fixture, not a
published theme.

## Color tokens

### Structure / surface

| `--ff-*` token | Role in the design system | Flydocs source | Value | Kind |
|---|---|---|---|---|
| `--ff-color-surface` | Default component chrome background (card, header, nav, panel) | `--hub-sys-color-surface-default` (= `--hub-ref-color-neutral-0`) | `#ffffff` | Direct |
| `--ff-color-border` | Default hairline border (cards, tables, dividers) | `--hub-sys-border-color-default` (= `--hub-ref-color-neutral-200`) | `#e1e4ec` | Direct |
| `--ff-color-border-focus` | Solid 2px focus border-color on the input wrapper | `--hub-sys-focus-ring-color` (`rgba(59,89,245,.25)`, i.e. brand blue) | `#3b59f5` | Derived — the border-color role only ever needs the ring's hue (brand blue = `--hub-ref-color-blue-500`); the alpha channel is not applicable to a `border-color` and is carried instead by `--ff-input-focus-ring` below. |
| `--ff-input-focus-ring` (component-scoped, `ff-input`) | Translucent focus halo on the input wrapper's `box-shadow` | `--hub-sys-focus-ring-color` | `rgba(59, 89, 245, 0.25)` (dark: `rgba(99, 120, 255, 0.3)`, `--hub-sys-focus-ring-color` re-pinned in `_theme-dark.scss`) | Direct — `ff-input` already renders its focus indicator as a `box-shadow` ring (`var(--ff-input-focus-ring, var(--ff-color-border-focus))`), so the full rgba value (hue + alpha) is ported as-is instead of being lossily collapsed into a solid color. |
| `--ff-color-on-primary` | Text/icon color atop a primary-filled surface (button label, checked radio dot, checkbox mark) | `--hub-sys-color-primary-on` / `-on-default` | `#ffffff` | Direct |
| `--ff-color-on-surface` | Text/icon color atop the default surface (menu item text) | no named counterpart | `#161826` | Derived — no Flydocs token is called "on-surface"; the role (primary reading text over the default surface) is identical to `text-primary`, so it takes that value. |

### Text

| `--ff-*` token | Flydocs source | Value | Kind |
|---|---|---|---|
| `--ff-text-primary` | `--hub-sys-text-primary` (`--hub-ref-color-neutral-900`) | `#161826` | Direct |
| `--ff-text-secondary` | `--hub-sys-text-secondary` (`--hub-ref-color-neutral-600`) | `#4d5468` | Direct |
| `--ff-text-muted` | `--hub-sys-text-muted` (`--hub-ref-color-neutral-500`) | `#6b7388` | Direct |
| `--ff-text-disabled` | `--hub-sys-text-disabled` (`--hub-ref-color-neutral-400`) | `#9ca3b5` | Direct |

### Neutral ramp

Both `--ff-color-neutral-*` and `--hub-ref-color-neutral-*` are numeric
lightness ramps (Tailwind/Material convention: the step number *is* the
role — a shared relative-lightness position — independently of naming).
Matched position-for-position:

| Step | Value |
|---|---|
| 50 | `#f6f7fa` |
| 100 | `#eef0f5` |
| 200 | `#e1e4ec` |
| 300 | `#cbd0dc` |
| 400 | `#9ca3b5` |
| 500 | `#6b7388` |
| 600 | `#4d5468` |
| 700 | `#363b4e` |
| 900 | `#161826` |

All **direct** (Flydocs' neutral ramp has extra stops at 0/25/950/1000 that
the design-system doesn't consume; every consumed step lines up 1:1).

Caveat: `--ff-color-neutral-100` is the stop every *other* consumer of the
neutral badge's former background reuses (hover backgrounds, dialog/toast
chrome), and it stays the ramp-position value there. `ff-badge`'s "neutral"
chip background is the one exception: it now resolves through its own
component token, `--ff-badge-neutral-bg` (falling back to
`--ff-color-neutral-100` when unset), which this theme pins to `#f6f3ec` —
the warm ramp value Flydocs' own neutral chip role
(`--hub-sys-color-neutral-subtle`) points to (`--hub-ref-color-warm-50`).
Dark mode intentionally leaves `--ff-badge-neutral-bg` unset (the source
product's dark theme does not repin its neutral-chip role either), so the
dark badge falls back to `--ff-color-neutral-100`'s own dark repin.

### Primary (brand blue)

| Token | Role | Flydocs source | Value | Kind |
|---|---|---|---|---|
| `--ff-color-primary-50` | Light tint background (selected row/list item, panel tint) | `--hub-sys-color-primary-subtle` (`--hub-ref-color-blue-50`) | `#eef1ff` | Direct |
| `--ff-color-primary-100` | Tint background (badge, avatar, chip-selected, tab-bar pill) | `--hub-ref-color-blue-100` | `#dce3ff` | Direct |
| `--ff-color-primary-500` | Base/solid accent (buttons, checked controls, focus fallback) | `--hub-sys-color-primary` (`--hub-ref-color-blue-500`) | `#3b59f5` | Direct |
| `--ff-color-primary-600` | Hover/emphasis accent (button hover-bg, progress fill, tab-bar active indicator, panel accent) | `--hub-sys-color-primary-emphasis` (pinned = base by contract) | `#3b59f5` | Direct — Flydocs deliberately does **not** darken on hover for this role; every consumer of this stop is an accent/indicator, never text, so the flat pin is safe. Visible effect once ported: hover/active states on primary buttons will no longer visually darken. |
| `--ff-color-primary-700` | Strong text atop a primary tint (badge text, avatar initials, chip-selected text, panel text) | `--hub-ref-color-blue-700` | `#2436ad` | Direct |

### Secondary (brand peach — deliberate divergence)

Design-system default secondary is lime-green; Flydocs' secondary is peach,
by explicit product decision.

| Token | Role | Flydocs source | Value | Kind |
|---|---|---|---|---|
| `--ff-color-secondary-100` | Badge subtle background | `--hub-sys-color-secondary-subtle` = `color-mix(in srgb, var(--hub-sys-color-secondary) 12%, transparent)` | `color-mix(in srgb, #ff7a59 12%, transparent)` | Derived — the hub formula is copied with the brand peach (`--hub-ref-color-peach-500`) baked in literally (no cross-repo variable reference). |
| `--ff-color-secondary-700` | Badge text **and** badge solid-variant background (the design system reuses one stop for both roles) | `--hub-ref-color-peach-700` | `#b8482e` | Derived — Flydocs' `sys` contract only pins peach `base`/`emphasis` flat at `peach-500`; that reads too light for a text role. The raw peach ramp's 700 stop (dark brick) was borrowed instead, matching how the other families' 700 stops are used purely for text/solid contrast. |

### Success / Error / Warning / Info ramps

All four families follow the identical pattern in the design system: `-50`
banner background, `-100` badge tint, `-200` border/ring, `-500` solid
accent, `-600` icon/stronger text, `-700` badge text / banner action text,
plus a flat semantic alias equal to `-500`.

| Family | `-alias`/`-500` | `-50` | `-100` | `-200` | `-600` | `-700` |
|---|---|---|---|---|---|---|
| success → `--hub-sys-color-success` | `#22a55b` | `#e7f8ee` | `#cdefdb` | `#9ddfb7` | `#188649` | `#106635` |
| error → `--hub-sys-color-danger` | `#dc2828` | `#fce9e9` | `#f8cece` | `#f09a9a` | `#b41e1e` | `#8a1717` |
| warning → `--hub-sys-color-warning` | `#e59a07` | `#fff7e0` | `#ffebb3` | `#ffd773` | `#b97a00` | `#8a5c00` |
| info → `--hub-sys-color-info` | `#3b59f5` | `#eef1ff` | `#dce3ff` | `#b9c6ff` | `#2e45d9` | `#2436ad` |

Kinds: `-alias`/`-500`, `-50`, `-100`, `-200` and `-700` are all **direct**
(each is either an explicit `--hub-sys-*-subtle`/base pin, or the raw ref
ramp stop at the matching position, with no competing candidate value).

`-600` is **derived** for all four families: the design system reuses this
same stop for two different roles — button hover-background (via the
`ff-button` color-axis loop) and icon/stronger-text color (banner icon,
toast icon, input error text). Flydocs separates these two roles into
distinct tokens (`-emphasis`, pinned flat to base, vs. the raw `ref-*-600`
ramp stop, which is genuinely darker). The raw ramp stop was chosen because
the icon/text consumers are the dominant, more visible usage across the
catalog; the trade-off is that a success/warning/error/info-colored
`ff-button` will show visible hover-darkening once this theme is active,
whereas Flydocs' own equivalent button pins that state flat. Flagged here
for the parity gate rather than silently resolved.

Notable divergence: Flydocs pins `info` to the exact same brand blue as
`primary` ("not the DS cyan", by explicit product decision). Once this
theme is active, `--ff-color-primary-*` and `--ff-color-info-*` become
visually identical at every shared stop — a real reduction in the number of
distinguishable accent hues in the catalog, not a mapping mistake.

## Elevation

| Token | Flydocs source | Value | Kind |
|---|---|---|---|
| `--ff-elevation-md` | `--hub-sys-shadow-md` | `0 4px 12px 0 rgba(0, 0, 0, 0.08)` | Direct |
| `--ff-elevation-lg` | `--hub-sys-shadow-lg` | `0 12px 32px 0 rgba(0, 0, 0, 0.12)` | Direct |

`--ff-elevation-sm` is declared by the design system but not consumed by any
component, so it is out of scope and was not ported.

## Typography

| Token | Flydocs source | Value | Kind |
|---|---|---|---|
| `--ff-font-family` | `--hub-ref-font-family-base` | `'Maven Pro', 'Noto Sans', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif` | Direct |
| `--ff-font-size-2xs` | `--hub-ref-font-size-2xs` | `0.6875rem` | Direct — both systems name this step identically and it is an explicit product extension. |

## Radius

| Token | Flydocs source | Value | Kind |
|---|---|---|---|
| `--ff-radius-lg` | `--hub-sys-radius-card` ("the product's most-used radius", 12px) | `0.75rem` | Derived — Flydocs never names a step "lg"; it only adds a `card` radius extension on top of the untouched design-system base scale. Its stated role (the dominant container-corner radius) is exactly what the design system's `lg` step is used for, so the value was borrowed by role rather than by name. |

## Tokens with no Flydocs equivalent (left un-overridden)

These 14 tokens are consumed by design-system components but the Flydocs
theme source never repins the corresponding role for the shared layer.
Inventing a value here would mean guessing at a decision the product theme
itself never made, so the fixture does not touch them — they keep resolving
to the plain design-system default (light or dark) regardless of whether
the Flydocs theme is active.

- `--ff-font-size-xs`, `--ff-font-size-sm`, `--ff-font-size-md`,
  `--ff-font-size-lg` — Flydocs only *extends* the type scale (adding
  `2xs`, `13`, `h1`, `display-l/xl`, `numeric-xl` steps); it never repins
  the base `xs`/`sm`/`base`/`lg` steps the design-system components read
  directly (confirmed: no such override exists in `_theme-flydocs.scss`).
  The one exception, `body { font-size: var(--hub-ref-font-size-sm); }`,
  reuses whatever the *ng-hub-ui-ds default* already is — it is not a
  repin, so there is no new value to port.
- `--ff-font-weight-medium`, `--ff-font-weight-semibold` — no font-weight
  override exists anywhere in the source theme.
- `--ff-radius-md`, `--ff-radius-sm` — Flydocs' radius section is
  exclusively *extensions* above 12px (`card`/`xl2`/`xxl2`); nothing below
  that is touched.
- `--ff-radius-full` — a pill/circular radius is an unbranded geometric
  convention (any value ≥ half the element's height renders identically);
  Flydocs' source confirms this by never declaring one.
- `--ff-spacing-xs`, `--ff-spacing-sm`, `--ff-spacing-md`, `--ff-spacing-lg`,
  `--ff-spacing-xl` — Flydocs' spacing section is entirely product
  **extensions** for its own bespoke, 12px-rhythm components (new
  px-suffixed steps: `2px`…`80px`). It never overrides the shared
  Bootstrap-style spacing scale the design-system components actually
  consume. This is a real finding for the parity gate: spacing is not
  part of the visual-identity surface Flydocs customized at the
  shared-component level.

## Artifact

`--ff-color-` (matched once by the discovery grep) is not an independent
token: it is the literal prefix Sass leaves before an interpolation break
in `ff-button.component.scss`'s color-axis loop
(`var(--ff-color-#{$color}-500)`, etc.). Every concrete value that
interpolation can produce (`primary-500`, `success-600`, `neutral-100`, …)
is already mapped above.
