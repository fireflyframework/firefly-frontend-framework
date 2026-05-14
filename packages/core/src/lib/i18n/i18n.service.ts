import { Injectable, inject, signal } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { TranslocoService } from '@jsverse/transloco';

import {
  I18nConfig,
  LocaleDefinition,
  SupportedLocale,
} from './i18n.types';

const DEFAULT_STORAGE_KEY = 'ff-locale';

/**
 * Headless i18n service.
 *
 * Wraps `TranslocoService` behind a signal-based, framework-owned API.
 * Provides locale switching, translation resolution, localStorage
 * persistence, and reactive signals for UI binding.
 *
 * The service does NOT render anything — it provides reactive signals
 * that pipes, directives, and components can consume.
 *
 * @example
 * ```typescript
 * private i18n = inject(I18nService);
 *
 * // Read current locale in template
 * // {{ i18n.currentLocale() }}
 *
 * // Switch locale
 * this.i18n.switchLocale('en');
 *
 * // Translate a key
 * const greeting = this.i18n.translate('common.greeting', { name: 'World' });
 * ```
 */
@Injectable()
export class I18nService {
  private readonly transloco = inject(TranslocoService);

  private readonly _availableLocales = signal<readonly LocaleDefinition[]>([]);
  private readonly _isLoading = signal(false);
  private readonly _error = signal<string | null>(null);

  private _storageKey: string | false = DEFAULT_STORAGE_KEY;

  // ---------------------------------------------------------------
  // Public readonly signals
  // ---------------------------------------------------------------

  /**
   * Currently active locale code.
   * Backed by Transloco's native `activeLang` signal.
   */
  readonly currentLocale = this.transloco.activeLang;

  /** All locales configured for this product. */
  readonly availableLocales = this._availableLocales.asReadonly();

  /** Whether a locale switch is in progress (translations loading). */
  readonly isLoading = this._isLoading.asReadonly();

  /** Last error message from a failed locale switch, or null. */
  readonly error = this._error.asReadonly();

  /**
   * Observable of locale changes.
   * Provided for RxJS interop with consumers that need observable streams.
   */
  readonly locale$: Observable<string> = this.transloco.langChanges$;

  // ---------------------------------------------------------------
  // Configuration (called by provider)
  // ---------------------------------------------------------------

  /**
   * Initialize the service with provider configuration.
   * Called internally by `provideI18n()`.
   *
   * @param config - I18n configuration from the provider
   */
  configure(config: I18nConfig): void {
    const locales = normalizeLocales(config.availableLocales);
    this._availableLocales.set(locales);
    this._storageKey = config.storageKey ?? DEFAULT_STORAGE_KEY;

    // Restore persisted locale if valid
    const persisted = this.readPersistedLocale();
    if (persisted && locales.some((l) => l.code === persisted)) {
      this.transloco.setActiveLang(persisted);
    }
  }

  // ---------------------------------------------------------------
  // Locale switching
  // ---------------------------------------------------------------

  /**
   * Switch to a different locale.
   * No-ops if the locale is not in the available list.
   * Persists the choice to localStorage (unless disabled).
   *
   * @param locale - BCP 47 locale code to switch to
   */
  switchLocale(locale: SupportedLocale): void {
    const available = this._availableLocales();
    if (!available.some((l) => l.code === locale)) {
      return;
    }

    this._error.set(null);
    this._isLoading.set(true);

    firstValueFrom(this.transloco.load(locale))
      .then(() => {
        this.transloco.setActiveLang(locale);
        this.persistLocale(locale);
        this._isLoading.set(false);
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : 'Failed to load translations';
        this.setError(message);
      });
  }

  // ---------------------------------------------------------------
  // Translation
  // ---------------------------------------------------------------

  /**
   * Resolve a translation key synchronously.
   * Returns the key itself if the translation is missing.
   *
   * @param key - Translation key (e.g. 'common.greeting')
   * @param params - Interpolation parameters
   * @returns Resolved translation string
   */
  translate(key: string, params?: Record<string, unknown>): string {
    return this.transloco.translate(key, params);
  }

  /**
   * Resolve a translation key as an observable.
   * Re-emits when the active locale changes.
   *
   * @param key - Translation key
   * @param params - Interpolation parameters
   * @returns Observable that emits the translated string
   */
  selectTranslate(
    key: string,
    params?: Record<string, unknown>,
  ): Observable<string> {
    return this.transloco.selectTranslate(key, params);
  }

  // ---------------------------------------------------------------
  // Loading state (used by provider)
  // ---------------------------------------------------------------

  /** @internal Mark loading start/end. Called by provider. */
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

  private readPersistedLocale(): string | null {
    if (this._storageKey === false) return null;
    try {
      return localStorage.getItem(this._storageKey);
    } catch {
      return null;
    }
  }

  private persistLocale(locale: string): void {
    if (this._storageKey === false) return;
    try {
      localStorage.setItem(this._storageKey, locale);
    } catch {
      // localStorage unavailable (SSR, restricted incognito)
    }
  }
}

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------

function normalizeLocales(
  input: ReadonlyArray<SupportedLocale | LocaleDefinition>,
): LocaleDefinition[] {
  return input.map((entry) =>
    typeof entry === 'string'
      ? { code: entry, displayName: entry }
      : entry,
  );
}
