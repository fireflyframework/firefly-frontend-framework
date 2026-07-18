import { Injectable, signal } from '@angular/core';

/** localStorage key persisting the dark-mode preference. */
const STORAGE_KEY = 'ff-dark-mode';

/**
 * Central dark-mode state for the playground.
 *
 * Applies the `data-theme="dark"` attribute on `<html>` (the activation
 * mechanism of `_dark.scss`) and persists the preference in localStorage.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  /** Whether dark mode is currently active. */
  readonly dark = signal(this.readStoredPreference());

  constructor() {
    this.apply(this.dark());
  }

  /** Toggles dark mode, applies it to the document and persists it. */
  toggle(): void {
    const next = !this.dark();
    this.apply(next);
    localStorage.setItem(STORAGE_KEY, String(next));
    this.dark.set(next);
  }

  private apply(dark: boolean): void {
    if (dark) {
      document.documentElement.dataset['theme'] = 'dark';
    } else {
      delete document.documentElement.dataset['theme'];
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
