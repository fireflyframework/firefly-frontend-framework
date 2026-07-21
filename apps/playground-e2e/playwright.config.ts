import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

/*
 * Dedicated port: 4200 is the default `nx serve playground` port, so a
 * developer's already-running dev server (of this app or any other) would be
 * silently reused and the suite would screenshot the wrong application.
 */
const baseURL = process.env['BASE_URL'] || 'http://localhost:4300';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src' }),
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },
  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'pnpm exec nx run playground:serve --port 4300',
    url: 'http://localhost:4300',
    reuseExistingServer: true,
    cwd: workspaceRoot,
  },
  /*
   * Visual regression baselines are captured on chromium only: cross-browser
   * baselines would triple the maintenance burden without adding coverage to
   * the flydocs parity gate, which cares about pixel diffs of a single
   * rendering engine, not cross-browser compatibility.
   */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  /*
   * Explicit equivalent of Playwright's default screenshot naming
   * (`<spec>-snapshots/<arg>-<project>-<platform>.png`), spelled out so the
   * per-OS baseline split (darwin locally, linux in CI) is not implicit.
   */
  snapshotPathTemplate:
    '{testDir}/{testFileDir}/{testFileName}-snapshots/{arg}-{projectName}-{platform}{ext}',
  expect: {
    /* Tight tolerance: the flydocs parity gate must catch single-token drift. */
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.001,
    },
  },
});
