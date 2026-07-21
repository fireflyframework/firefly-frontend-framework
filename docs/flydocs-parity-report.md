# Flydocs visual-parity diff report — migration waves 1–5

Per-component parity verdict for the FF-CAT-20 gate: the design-system
primitives of migration waves 1–5, rendered in the playground catalog under
the ported Flydocs theme (`--ff-*`), compared against the Flydocs product's
own rendering contract. Pass criterion: **no perceptible difference at 100%
zoom**.

## Method and reference

- The parity reference is the **rendered Flydocs product** (the values of
  `_theme-flydocs.scss` / `_theme-dark.scss`), never the Figma files — their
  palettes diverge from each other and from the framework
  (`firefly-design-system-catalog-and-flydocs-migration.md` §13, §20, §26.6).
- The analytic base is the token-by-token equivalence in
  [flydocs-theme-token-equivalence.md](./flydocs-theme-token-equivalence.md):
  every `--ff-*` token a component consumes maps to a Flydocs value (49
  direct, 9 derived) or is deliberately left un-overridden (14, no Flydocs
  equivalent).
- The rendered surface is the `/parity` playground route (one section per
  wave, real dominant prop combinations from the usage inventory, §8 of the
  catalog doc), captured by the Playwright suite described in
  [visual-regression.md](./visual-regression.md) — light and dark, plus the
  input rest/hover/focus/error/disabled states. Baselines live in
  `apps/playground-e2e/src/parity.spec.ts-snapshots/`.
- Verdicts below combine that token-level analysis with a review of the
  captured baselines at 100% zoom. The side-by-side eyeball against the
  *running* Flydocs product (manual validation guide, catalog doc §20)
  remains the human backup step for any verdict marked ⚠️.

## Verdict summary

| Wave | Component | States captured | Verdict |
|---|---|---|---|
| 1 | `ff-icon` | 5 registry icons × sm/md/lg, light+dark | ✅ Pass |
| 2 | `ff-badge` | color × xs/sm, dot, pill/square | ⚠️ Pass with one flagged delta (neutral chip) |
| 2 | `ff-avatar` | initials × sm/md/lg | ✅ Pass |
| 2 | `ff-skeleton` | text/rect/circle | ✅ Pass |
| 2 | `ff-progress` | 25/60/90, labelled | ✅ Pass |
| 2 | `ff-divider` | horizontal + vertical | ✅ Pass |
| 2 | `ff-empty-state` | title + description | ✅ Pass |
| 3 | `ff-button` | solid/outline/ghost × primary × sm/md, loading, disabled | ✅ Pass (hover pin is Flydocs' own contract) |
| 3 | `ff-icon-button` | sm/md/lg | ✅ Pass |
| 4 | `ff-panel` | alert warning/danger, default with heading/footer | ✅ Pass |
| 4 | `ff-card` | basic, md shadow | ✅ Pass |
| 4 | `ff-tab-bar` | underline/pills, active not-first, badge+icon tabs | ✅ Pass |
| 5 | `ff-input` | rest / hover / **focus** / error / disabled | ⚠️ Pass with one flagged delta (focus-ring rendering) |
| 5 | `ff-checkbox` | unchecked / checked / disabled-checked | ✅ Pass |
| 5 | `ff-radio` | group with selected option | ✅ Pass |

## Flagged deltas (candidates for their own issues)

Per the gate's contract, components that fail the comparison are **not**
fixed inside FF-CAT-20 — each perceptible delta generates its own issue.
Two deltas are flagged; both are borderline-perceptible and pre-documented
in the equivalence doc:

1. **Neutral badge chip runs cool, Flydocs' runs warm.** The design system
   reuses `--ff-color-neutral-100` (cool grey, `#eef0f5`) for the neutral
   chip background, while Flydocs' own neutral chip role points at the warm
   ramp (`--hub-ref-color-warm-50`, `#f6f3ec`). Every *other* consumer of
   that stop (hover backgrounds, dialog/toast chrome) matches Flydocs with
   the cool value, so the ramp-position value was kept. Perceptible only
   with both chips side by side; needs a product-owner call on whether the
   neutral badge deserves its own component token.
2. **Input focus ring: solid outline vs translucent halo.** Flydocs models
   focus as a translucent box-shadow ring (brand blue at 25% alpha);
   `ff-input` consumes `--ff-color-border-focus` as a solid 2px outline on
   the field wrapper (`:focus-within`, after the FIR-289 refactor moved it
   off the native control). The hue matches; the rendering mechanism does
   not. At 100% zoom the difference is visible on direct comparison
   (hard edge vs soft glow). Changing it means teaching the component a
   ring-style focus treatment — a component change, out of this gate's
   scope.

## Known gaps (not diffs)

- **No `ff-textarea`** — wave 5 lists textarea (`hub-textarea`, 14 uses in
  Flydocs) but the design system has no textarea primitive yet; nothing to
  compare. Blocks closing wave 5 of the migration, not this gate.
- **No `ff-slider`** — `hub-slider` (7 uses) has no `ff-*` counterpart;
  same situation (slider sits outside waves 1–5).
- 14 tokens are deliberately un-overridden (base type scale below `sm`,
  font weights, small/medium/full radii, spacing scale): Flydocs never
  repins them for the shared layer, so the design-system defaults are the
  correct values by definition.

## Reproducing the comparison

```
pnpm nx e2e playground-e2e          # screenshot-diff against the baselines
pnpm nx serve playground            # then open /parity and use the
                                    # "Flydocs theme" / "Dark mode" toggles
```

The manual side-by-side against the running product follows the validation
guide in the catalog doc §20, using the same `/parity` route as the
framework-side half of the comparison.
