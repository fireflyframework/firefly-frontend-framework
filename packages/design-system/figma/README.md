# Firefly tokens → Figma variables

Generated from the **source of truth**: `../src/lib/tokens/_tokens.scss`
(see [firefly-frontend-playbook/reference/design-tokens.md](../../../../firefly-frontend-playbook/reference/design-tokens.md)).

The Figma **Dev Mode MCP is read-only** (it can read variables/Code Connect but not create
them), and the Variables **REST** write API is Enterprise-only — so these artifacts let you
create the variables in any Figma file from a free plugin.

## Files

| File | What it is |
|---|---|
| `figma-create-variables.js` | **Figma Plugin API script.** Creates two variable collections — **Firefly ref** and **Firefly sys** — each with **Light** + **Dark** modes, and aliases `sys → ref` where the source uses `var(--ff-ref-*)`. 180 variables. Idempotent by name. |
| `firefly-tokens.dtcg.json` | Portable **W3C DTCG** export (nested `ref`/`sys`, `$type`/`$value`, dark in `$extensions["com.firefly.mode"].dark`, aliases as `{ref.color.…}`). For Tokens Studio or any DTCG importer. |
| `figma-build-colors.js` | **Figma Plugin API script.** Reads the live `Firefly ref`/`sys` color variables and lays out a **swatch board** on a new page “Firefly · Colors”, each swatch **fill-bound to its variable** (reflects Light/Dark mode). Run it *after* the variables exist. The first DS visual — more (typography, spacing, components) to follow. |

## Structure (mirrors the doctrine)

- **Collection “Firefly ref”** (primitives): `color/{palette}/{50…900}`, `spacing/*`, `radius/*`,
  `font/size/*`, `font/weight/*`, `line/height/*`, `letter/spacing/*`, `elevation/*`, `breakpoint/*`.
- **Collection “Firefly sys”** (semantic): `color/*` (surface, text, border, status +
  subtle/border-subtle/emphasis), `text/*`, `bg/*`, `z/*`, `opacity/*`, `duration/*`, `ease/*`,
  `transition/*`, `focus/ring/*`, `hit/area/*`, `contrast/*`. `sys` color tokens **alias** the
  matching `ref` variable; literals differ per **Light/Dark** mode.
- Tokens that are both a value and a parent (e.g. `color/success`) are stored as `…/base` to avoid
  Figma name/folder collisions.

## How to create the variables in Figma

1. Open the target Figma file.
2. Install/run the **Scripter** plugin (Figma Community, free) — or any plugin with a console.
3. Paste the **entire** contents of `figma-create-variables.js` and **Run**.
4. You’ll get a toast (“Firefly tokens: 180 vars, … aliases”) and the two collections appear in
   the Variables panel with Light/Dark modes. Re-running updates values and adds new variables.

> Alternative (DTCG): import `firefly-tokens.dtcg.json` via **Tokens Studio for Figma**, then
> push to Figma variables. The plugin script is the most direct route.

## Regenerating

These files are generated from `_tokens.scss`. After changing tokens, re-run the generator used to
produce them (parses the consolidated token file → emits this script + DTCG). Keep them in sync with
the source of truth; do not hand-edit.
