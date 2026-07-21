# Catalogue visual regression (Flydocs parity gate)

`apps/playground-e2e/src/parity.spec.ts` screenshots the `/parity` route of
the playground (5 `data-testid="parity-wave-N"` sections, plus the
`ff-input` focus-ring specimens in wave 5) with the Flydocs product theme
applied, and compares them against committed baselines with Playwright's
`toHaveScreenshot`. This is the gate that catches unintended visual drift
in the catalogue components once the Flydocs skin is applied.

## Scope: chromium only

Screenshots run on the `chromium` project only. Firefox/webkit are removed
from `apps/playground-e2e/playwright.config.ts`. The gate is a pixel diff of
one rendering engine against itself over time, not a cross-browser
compatibility check; multi-browser baselines would triple the number of PNGs
to maintain for no additional signal.

## How appearances are driven

`BrandThemeService` / `ThemeService` read `localStorage['ff-brand-theme']`
and `localStorage['ff-dark-mode']` once, in their constructor, and stamp
`data-brand="flydocs"` / `data-theme="dark"` on `<html>` on first render.
The spec sets both keys via `page.addInitScript` **before** navigation so
the app boots directly into the target appearance — no runtime toggle, no
flash of the wrong theme to settle before the screenshot.

## Determinism

Each test:

- fixes the viewport to `1280x720`;
- calls `page.emulateMedia({ reducedMotion: 'reduce' })`;
- injects a global stylesheet that disables `animation`, `transition` and
  caret blinking (`caret-color: transparent`) on every element;
- waits for the target locator to be visible before calling
  `toHaveScreenshot`.

`maxDiffPixelRatio: 0.001` is configured once, globally, under
`expect.toHaveScreenshot` in `playwright.config.ts` — no per-test tolerance
overrides.

## Running locally

```
pnpm exec nx run playground-e2e:e2e
```

This starts (or reuses) the playground dev server and runs the full parity
matrix against the baselines committed under
`apps/playground-e2e/src/parity.spec.ts-snapshots/`.

## Updating baselines

After an intentional visual change to the catalogue or the Flydocs theme,
regenerate the affected baselines and review the diff before committing:

```
pnpm exec nx run playground-e2e:e2e -- --update-snapshots
```

Scope the update to a single test when possible (`--grep`) to avoid
regenerating unrelated baselines. Baseline filenames already encode the
platform (see below), so running this on macOS only refreshes the
`-darwin` set — the `-linux` set used by CI must be bootstrapped/updated
separately (see next section).

## CI: linux baseline bootstrap

Playwright screenshots are only stable when compared to a baseline
generated on the same OS. `apps/playground-e2e/playwright.config.ts` sets
`snapshotPathTemplate` to include `{platform}` explicitly, so local (darwin)
and CI (linux) baselines live side by side as separate files and never
overwrite each other.

The installed `@playwright/test` (`1.59.1`) supports
`--update-snapshots=missing`, which writes a baseline only when none exists
yet and leaves existing ones untouched. A missing baseline still fails the
run (Playwright writes the file and reports the test as failed), so until
the linux set is committed the regular `e2e` job cannot pass — bootstrap it
right after the branch lands:

1. In GitHub → Actions → CI → *Run workflow*, launch a manual run with the
   **`seed_vr_baselines`** input checked. The `e2e` job then runs the suite
   with `--update-snapshots=missing` in a non-gating step and always uploads
   `apps/playground-e2e/src/parity.spec.ts-snapshots/` as the
   `playground-e2e-vr-baselines` artifact.
2. Download the artifact, inspect the new `-linux.png` files at 100% zoom,
   and commit them alongside the `-darwin.png` set already produced locally.
3. Nothing to revert: regular pushes/PRs never take the seeding branch of
   the job.

The same seeding run also refreshes the artifact after an intentional
visual change when regenerating locally is not possible; existing linux
baselines are never overwritten by it (`missing` mode), so a deliberate
refresh of *changed* baselines still needs the artifact from a red regular
run (the `playground-e2e-test-results` artifact contains the actual/diff
images).
