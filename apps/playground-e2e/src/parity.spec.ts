import { test, expect, type Page } from '@playwright/test';

/** Number of `<section data-testid="parity-wave-N">` specimens rendered by the `/parity` route. */
const WAVE_COUNT = 5;

/** Flydocs appearances covered by the parity gate: brand theme on, light/dark toggled independently. */
const APPEARANCES = [
  { name: 'light', dark: false },
  { name: 'dark', dark: true },
] as const;

/**
 * Persists the `BrandThemeService` / `ThemeService` localStorage contract
 * before the app boots, since both services read their preference once in
 * the constructor and stamp `data-brand` / `data-theme` on `<html>` during
 * the very first render.
 */
async function applyFlydocsAppearance(page: Page, dark: boolean): Promise<void> {
  await page.addInitScript((isDark: boolean) => {
    window.localStorage.setItem('ff-brand-theme', 'true');
    window.localStorage.setItem('ff-dark-mode', String(isDark));
  }, dark);
}

/**
 * Neutralises animation, transition and caret-blink so repeated renders of
 * unchanged markup produce pixel-identical screenshots across runs, and
 * removes the sticky shell header, which otherwise floats over the top of
 * whichever wave section gets scrolled underneath it during capture.
 */
async function freezeMotion(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        caret-color: transparent !important;
      }
      .shell__header {
        display: none !important;
      }
    `,
  });
}

/** Navigates to the parity catalogue with the given appearance already persisted, then freezes motion. */
async function openParityPage(page: Page, dark: boolean): Promise<void> {
  await applyFlydocsAppearance(page, dark);
  await page.goto('/parity');
  await freezeMotion(page);
}

test.describe('Catalogue parity - Flydocs theme', () => {
  test.beforeEach(async ({ page }) => {
    // Fixed viewport keeps section wrapping and screenshot dimensions deterministic.
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  for (const appearance of APPEARANCES) {
    test.describe(`${appearance.name} appearance`, () => {
      test.beforeEach(async ({ page }) => {
        await openParityPage(page, appearance.dark);
      });

      for (let wave = 1; wave <= WAVE_COUNT; wave += 1) {
        test(`wave ${wave} matches the baseline`, async ({ page }) => {
          const section = page.getByTestId(`parity-wave-${wave}`);
          await expect(section).toBeVisible();
          await expect(section).toHaveScreenshot(`wave-${wave}-${appearance.name}.png`);
        });
      }
    });
  }

  test.describe('input focus-ring states (light appearance)', () => {
    test.beforeEach(async ({ page }) => {
      await openParityPage(page, false);
    });

    test('default input at rest matches the baseline', async ({ page }) => {
      const specimen = page.getByTestId('parity-input-default');
      await expect(specimen).toBeVisible();
      await expect(specimen).toHaveScreenshot('input-default-rest.png');
    });

    test('default input on hover matches the baseline', async ({ page }) => {
      const specimen = page.getByTestId('parity-input-default');
      await expect(specimen).toBeVisible();
      await specimen.hover();
      await expect(specimen).toHaveScreenshot('input-default-hover.png');
    });

    test('default input focused matches the baseline (wrapper focus-within ring)', async ({
      page,
    }) => {
      const specimen = page.getByTestId('parity-input-default');
      await expect(specimen).toBeVisible();
      await specimen.locator('input').focus();
      await expect(specimen).toHaveScreenshot('input-default-focused.png');
    });

    test('error input at rest matches the baseline', async ({ page }) => {
      const specimen = page.getByTestId('parity-input-error');
      await expect(specimen).toBeVisible();
      await expect(specimen).toHaveScreenshot('input-error-rest.png');
    });

    test('disabled input at rest matches the baseline', async ({ page }) => {
      const specimen = page.getByTestId('parity-input-disabled');
      await expect(specimen).toBeVisible();
      await expect(specimen).toHaveScreenshot('input-disabled-rest.png');
    });
  });
});
