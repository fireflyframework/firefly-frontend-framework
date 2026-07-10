// ---------------------------------------------------------------------------
// Locale identifiers
// ---------------------------------------------------------------------------

/**
 * BCP 47 locale code (e.g. 'es', 'en', 'pt-BR').
 *
 * The framework does not constrain which locales are valid —
 * that is configured per-product via `I18nConfig.availableLocales`.
 */
export type SupportedLocale = string;

/**
 * Metadata describing a locale available in the application.
 * Used by UI components (e.g. language selector) to display locale options.
 */
export interface LocaleDefinition {
  /** BCP 47 locale code (e.g. 'es', 'en'). */
  readonly code: SupportedLocale;
  /** Human-readable name in the locale's own language (e.g. 'Español', 'English'). */
  readonly displayName: string;
  /** Text direction. Default: 'ltr'. */
  readonly direction?: 'ltr' | 'rtl';
}

// ---------------------------------------------------------------------------
// Provider configuration
// ---------------------------------------------------------------------------

/**
 * Configuration for `provideI18n()`.
 *
 * The product supplies locale settings and translation paths.
 * The framework configures Transloco at bootstrap via `provideAppInitializer()`.
 */
export interface I18nConfig {
  /** Default locale to use at startup. */
  readonly defaultLocale: SupportedLocale;
  /**
   * Locales available in this product.
   * When supplied as strings, they are wrapped into `LocaleDefinition`
   * objects internally with `displayName` equal to the code.
   */
  readonly availableLocales: ReadonlyArray<SupportedLocale | LocaleDefinition>;
  /**
   * Base path for translation JSON assets (relative to app root).
   * Default: `'assets/i18n'`.
   */
  readonly translationsPath?: string;
  /** Whether the app is running in production mode. Default: false. */
  readonly production?: boolean;
  /**
   * Whether to re-render components when the active locale changes.
   * Default: true.
   */
  readonly reRenderOnLangChange?: boolean;
  /**
   * localStorage key for persisting the user's locale preference.
   * Set to `false` to disable persistence. Default: `'ff-locale'`.
   */
  readonly storageKey?: string | false;
  /**
   * Enable ICU Message Format for pluralization and select expressions.
   * When enabled, translation values can use ICU syntax:
   * \`"{count, plural, =0 {No items} one {1 item} other {{count} items}}"\`
   *
   * Requires \`@jsverse/transloco-messageformat\` as peer dependency.
   * Default: \`false\`.
   */
  readonly useMessageFormat?: boolean;
}

// ---------------------------------------------------------------------------
// Service state (internal, exposed as readonly signals)
// ---------------------------------------------------------------------------

/** Internal state shape managed by I18nService. */
export interface I18nState {
  /** Currently active locale code. */
  readonly activeLocale: SupportedLocale;
  /** All locales configured for this product. */
  readonly availableLocales: readonly LocaleDefinition[];
  /** Whether a locale switch is in progress (translations loading). */
  readonly isLoading: boolean;
  /** Last error message from a failed locale switch, or null. */
  readonly error: string | null;
}

// ---------------------------------------------------------------------------
// Translatable references
// ---------------------------------------------------------------------------

/**
 * A translatable reference: an i18n key plus optional interpolation params.
 *
 * Lets a component select WHICH key (state logic) and hand the template a
 * single object to render via `FfTranslatePipe`:
 * `{{ ref().key | ffTranslate: ref().params }}`.
 */
export interface I18nRef {
  /** The i18n key to translate. */
  readonly key: string;
  /** Optional interpolation params passed to the translation. */
  readonly params?: Record<string, unknown>;
}
