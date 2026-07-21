import { Injectable, signal } from '@angular/core';

/** localStorage key persisting the active product-theme preference. */
const STORAGE_KEY = 'ff-brand-theme';

/**
 * Central product-theme state for the playground.
 *
 * Applies the `data-brand="flydocs"` attribute on `<html>` (the activation
 * mechanism of `themes/_flydocs-theme.scss` and its dark counterpart) and
 * persists the preference in localStorage. Independent from {@link
 * ThemeService}'s light/dark axis: both attributes combine, so the Flydocs
 * skin has its own dark variant scoped under `[data-brand='flydocs'][data-theme='dark']`.
 */
@Injectable({ providedIn: 'root' })
export class BrandThemeService {
  /** Whether the Flydocs product theme is currently active. */
  readonly flydocs = signal(this.readStoredPreference());

  constructor() {
    this.apply(this.flydocs());
  }

  /** Toggles the Flydocs theme, applies it to the document and persists it. */
  toggle(): void {
    const next = !this.flydocs();
    this.apply(next);
    localStorage.setItem(STORAGE_KEY, String(next));
    this.flydocs.set(next);
  }

  private apply(active: boolean): void {
    if (active) {
      document.documentElement.dataset['brand'] = 'flydocs';
    } else {
      delete document.documentElement.dataset['brand'];
    }
  }

  private readStoredPreference(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  }
}
