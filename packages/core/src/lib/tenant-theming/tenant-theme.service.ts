import { computed, Injectable, signal } from '@angular/core';
import { BrandingConfig, ColorMode } from './tenant-theme.types';

const DEFAULT_STORAGE_KEY = 'ff-color-mode';

/**
 * Headless tenant-theming service.
 *
 * Manages branding configuration, CSS custom property overrides,
 * dark/light/system color mode with localStorage persistence,
 * and dynamic favicon/logo updates.
 *
 * The service does NOT render anything — it provides reactive signals
 * that the UI layer (AlertHostComponent, shell, etc.) can consume.
 *
 * @example
 * ```typescript
 * private theme = inject(TenantThemeService);
 *
 * // Read signals in template
 * // {{ theme.tenantLogo() }}
 * // {{ theme.isDarkMode() ? 'dark' : 'light' }}
 *
 * // Toggle dark mode
 * this.theme.toggleDarkMode();
 * ```
 */
@Injectable()
export class TenantThemeService {
  private readonly _config = signal<BrandingConfig | null>(null);
  private readonly _preferredMode = signal<ColorMode>('system');
  private readonly _isLoading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _appliedTokenKeys = signal<string[]>([]);

  private _storageKey = DEFAULT_STORAGE_KEY;
  private _systemDarkQuery: MediaQueryList | null = null;

  /** Currently loaded branding configuration, or null before first load. */
  readonly currentTheme = this._config.asReadonly();

  /** Whether dark mode is currently active (resolved, never 'system'). */
  readonly isDarkMode = computed(() => this.resolvedMode() === 'dark');

  /** Tenant logo URL from the current branding, or null. */
  readonly tenantLogo = computed(() => this._config()?.logoUrl ?? null);

  /** Whether branding is currently being loaded. */
  readonly isLoading = this._isLoading.asReadonly();

  /** Last loading error message, or null. */
  readonly error = this._error.asReadonly();

  /** User-selected color mode preference (may be 'system'). */
  readonly colorMode = this._preferredMode.asReadonly();

  /** Resolved color mode — always 'light' or 'dark'. */
  readonly resolvedMode = computed<'light' | 'dark'>(() => {
    const preferred = this._preferredMode();
    if (preferred !== 'system') return preferred;
    return this.getSystemPreference();
  });

  // ---------------------------------------------------------------
  // Configuration (called by provider)
  // ---------------------------------------------------------------

  /**
   * Initialize the service with provider configuration.
   * Called internally by `provideTenantTheming()`.
   *
   * @param storageKey - localStorage key for color mode persistence
   * @param defaultColorMode - initial color mode preference
   */
  configure(storageKey: string, defaultColorMode: ColorMode): void {
    this._storageKey = storageKey;
    const persisted = this.readPersistedMode();
    this._preferredMode.set(persisted ?? defaultColorMode);
    this.applyColorModeToDOM();
    this.listenToSystemChanges();
  }

  // ---------------------------------------------------------------
  // Branding
  // ---------------------------------------------------------------

  /**
   * Load and apply a branding configuration.
   * Sets the config signal and applies CSS tokens + assets.
   *
   * @param config - Branding configuration from backend
   */
  loadBranding(config: BrandingConfig): void {
    this._config.set(config);
    this._error.set(null);
    this.applyTheme(config);
    this.updateFavicon(config.faviconUrl);
    this.updateFontFamily(config.fontFamily);
  }

  /**
   * Apply CSS custom property tokens from a branding config to `:root`.
   * Uses light or dark tokens depending on the current resolved mode.
   *
   * @param config - Branding configuration with token maps
   */
  applyTheme(config: BrandingConfig): void {
    const root = document.documentElement;

    // Remove previously applied tokens
    this.clearAppliedTokens(root);

    // Determine which tokens to apply
    const baseTokens = config.tokens;
    const darkOverrides = config.darkTokens ?? {};
    const isDark = this.resolvedMode() === 'dark';

    const tokens = isDark
      ? { ...baseTokens, ...darkOverrides }
      : baseTokens;

    const appliedKeys: string[] = [];
    for (const [prop, value] of Object.entries(tokens)) {
      root.style.setProperty(prop, value);
      appliedKeys.push(prop);
    }
    this._appliedTokenKeys.set(appliedKeys);
  }

  // ---------------------------------------------------------------
  // Color mode
  // ---------------------------------------------------------------

  /** Toggle between light and dark mode. If 'system', switches to 'dark'. */
  toggleDarkMode(): void {
    const next = this.isDarkMode() ? 'light' : 'dark';
    this.setColorMode(next);
  }

  /**
   * Set the color mode preference. Persists to localStorage and
   * re-applies theme tokens if a branding config is loaded.
   *
   * @param mode - 'light', 'dark', or 'system'
   */
  setColorMode(mode: ColorMode): void {
    this._preferredMode.set(mode);
    this.persistMode(mode);
    this.applyColorModeToDOM();

    // Re-apply tokens for the new mode
    const config = this._config();
    if (config) {
      this.applyTheme(config);
      this.updateFavicon(config.faviconUrl);
    }
  }

  // ---------------------------------------------------------------
  // Reset
  // ---------------------------------------------------------------

  /** Remove all tenant overrides and restore DS defaults. */
  resetTheme(): void {
    const root = document.documentElement;
    this.clearAppliedTokens(root);
    root.removeAttribute('data-theme');
    root.style.removeProperty('--ff-font-family');
    this._config.set(null);
    this._preferredMode.set('system');
    this._error.set(null);
    this.persistMode('system');
  }

  // ---------------------------------------------------------------
  // Loading state (used by provider)
  // ---------------------------------------------------------------

  /** @internal Mark loading start. Called by provider. */
  setLoading(loading: boolean): void {
    this._isLoading.set(loading);
  }

  /** @internal Set error state. Called by provider. */
  setError(error: string): void {
    this._error.set(error);
    this._isLoading.set(false);
  }

  // ---------------------------------------------------------------
  // Internals
  // ---------------------------------------------------------------

  /** Apply `[data-theme]` attribute to `<html>` based on resolved mode. */
  private applyColorModeToDOM(): void {
    const resolved = this.resolvedMode();
    if (resolved === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  /** Remove all CSS custom properties previously applied by this service. */
  private clearAppliedTokens(root: HTMLElement): void {
    for (const key of this._appliedTokenKeys()) {
      root.style.removeProperty(key);
    }
    this._appliedTokenKeys.set([]);
  }

  /**
   * Update the browser favicon.
   *
   * @param url - Favicon URL, or undefined to skip
   */
  private updateFavicon(url: string | undefined): void {
    if (!url) return;
    try {
      const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (link) {
        link.href = url;
      }
    } catch {
      // Silently ignore — favicon update is best-effort
    }
  }

  /**
   * Update the CSS font-family custom property.
   *
   * @param fontFamily - Font family name, or undefined to skip
   */
  private updateFontFamily(fontFamily: string | undefined): void {
    if (!fontFamily) return;
    document.documentElement.style.setProperty('--ff-font-family', fontFamily);
  }

  /** Read persisted color mode from localStorage. */
  private readPersistedMode(): ColorMode | null {
    try {
      const stored = localStorage.getItem(this._storageKey);
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored;
      }
    } catch {
      // localStorage unavailable (SSR, restricted incognito)
    }
    return null;
  }

  /** Persist color mode to localStorage. */
  private persistMode(mode: ColorMode): void {
    try {
      localStorage.setItem(this._storageKey, mode);
    } catch {
      // localStorage unavailable
    }
  }

  /** Get the system color scheme preference. */
  private getSystemPreference(): 'light' | 'dark' {
    try {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    } catch {
      return 'light';
    }
  }

  /** Listen to system color scheme changes (for 'system' mode). */
  private listenToSystemChanges(): void {
    try {
      this._systemDarkQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this._systemDarkQuery.addEventListener('change', () => {
        if (this._preferredMode() === 'system') {
          this.applyColorModeToDOM();
          const config = this._config();
          if (config) {
            this.applyTheme(config);
          }
        }
      });
    } catch {
      // matchMedia unavailable
    }
  }
}
