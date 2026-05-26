import { InjectionToken } from '@angular/core';

// ---------------------------------------------------------------------------
// Cookie category
// ---------------------------------------------------------------------------

/**
 * Category of a browser cookie for GDPR/ePrivacy classification.
 *
 * The three built-in categories are:
 * - `'essential'`   — Required for the application to function (always allowed).
 * - `'analytics'`   — Used for usage tracking and statistics.
 * - `'preferences'` — Stores user preferences and functional settings.
 *
 * Products may define additional custom categories (e.g. `'marketing'`,
 * `'social-media'`). Any `string` is accepted to support extensibility.
 *
 * @example
 * ```typescript
 * const category: CookieCategory = 'analytics';
 * const custom: CookieCategory = 'marketing'; // also valid
 * ```
 */
export type CookieCategory = 'essential' | 'analytics' | 'preferences' | (string & {});

// ---------------------------------------------------------------------------
// Cookie options (per-cookie)
// ---------------------------------------------------------------------------

/**
 * Options for setting an individual cookie via `CookieService.set()`.
 *
 * @example
 * ```typescript
 * cookieService.set('theme', 'dark', {
 *   path: '/',
 *   secure: true,
 *   sameSite: 'Lax',
 *   maxAgeDays: 30,
 *   category: 'preferences',
 * });
 * ```
 */
export interface CookieOptions {
  /** Cookie path. Defaults to `'/'`. */
  readonly path?: string;

  /** Cookie domain. When omitted, uses the current domain. */
  readonly domain?: string;

  /** Number of days until the cookie expires. When omitted, creates a session cookie. */
  readonly maxAgeDays?: number;

  /** Whether to set the `Secure` attribute. Defaults to `CookieConfig.forceSecure`. */
  readonly secure?: boolean;

  /**
   * `SameSite` attribute value.
   *
   * - `'Strict'` — Cookie is only sent in first-party context.
   * - `'Lax'`    — Cookie is sent with top-level navigations (default).
   * - `'None'`   — Cookie is sent in all contexts (requires `secure: true`).
   */
  readonly sameSite?: 'Strict' | 'Lax' | 'None';

  /**
   * GDPR category of this cookie. Used by `CookieService` to enforce
   * consent before writing.
   *
   * - `'essential'` or omitted → always written (no consent required).
   * - Any other category → only written if the user has consented.
   */
  readonly category?: CookieCategory;
}

// ---------------------------------------------------------------------------
// Consent preferences
// ---------------------------------------------------------------------------

/**
 * User's cookie consent preferences by category.
 *
 * Maps each `CookieCategory` to a boolean indicating whether the
 * user has accepted that category. The `essential` category is
 * always `true` and cannot be changed by the user.
 *
 * @example
 * ```typescript
 * const prefs: ConsentPreferences = {
 *   essential: true,    // always true — cannot be disabled
 *   analytics: false,   // user has not consented
 *   preferences: true,  // user has consented
 * };
 * ```
 */
export interface ConsentPreferences {
  /** Essential cookies are always allowed. This field is always `true`. */
  readonly essential: true;

  /** Whether the user has consented to analytics cookies. */
  readonly analytics: boolean;

  /** Whether the user has consented to preferences cookies. */
  readonly preferences: boolean;

  /** Support for custom categories defined by the product. */
  readonly [category: string]: boolean;
}

// ---------------------------------------------------------------------------
// Module configuration (user-facing)
// ---------------------------------------------------------------------------

/**
 * Configuration input for `provideCookies()`.
 *
 * All fields are optional — defaults provide a GDPR-compliant
 * configuration for EU products.
 *
 * @example
 * ```typescript
 * // EU product with analytics
 * provideCookies({
 *   consent: true,
 *   categories: ['essential', 'analytics', 'preferences'],
 * })
 *
 * // Product without GDPR requirement
 * provideCookies({ consent: false })
 * ```
 */
export interface CookieModuleOptions {
  /**
   * Enable GDPR consent management.
   *
   * When `true`, `CookieConsentService` is registered and
   * `CookieService.set()` enforces consent before writing
   * non-essential cookies.
   *
   * When `false`, only `CookieService` is registered (no consent UI,
   * no enforcement). Defaults to `true`.
   */
  readonly consent?: boolean;

  /**
   * Name of the cookie used to persist the user's consent preferences.
   * Defaults to `'ff_cookie_consent'`.
   */
  readonly consentCookieName?: string;

  /**
   * Number of days the consent cookie remains valid.
   * After expiration the user must re-consent. Defaults to `365`.
   */
  readonly consentMaxAgeDays?: number;

  /**
   * Cookie categories enabled for this product.
   * Defaults to `['essential', 'analytics', 'preferences']`.
   *
   * `'essential'` is always implicitly included even if omitted.
   */
  readonly categories?: readonly CookieCategory[];

  /**
   * Cookie domain for cross-subdomain support (embedded mode).
   * When omitted, uses the current domain.
   */
  readonly domain?: string;

  /**
   * Force `Secure` attribute on all cookies.
   * Defaults to `true` (recommended for production).
   */
  readonly forceSecure?: boolean;
}

// ---------------------------------------------------------------------------
// Resolved config (internal)
// ---------------------------------------------------------------------------

/**
 * Resolved configuration stored in the DI container.
 *
 * Built from `CookieModuleOptions` by `provideCookies()` with
 * all defaults applied. Services inject this via `COOKIE_CONFIG`.
 */
export interface CookieConfig {
  /** Whether consent management is active. */
  readonly consent: boolean;

  /** Name of the consent persistence cookie. */
  readonly consentCookieName: string;

  /** Validity of the consent cookie in days. */
  readonly consentMaxAgeDays: number;

  /** Active cookie categories. Always includes `'essential'`. */
  readonly categories: readonly CookieCategory[];

  /** Cookie domain (undefined = current domain). */
  readonly domain: string | undefined;

  /** Whether `Secure` is forced on all cookies. */
  readonly forceSecure: boolean;
}

// ---------------------------------------------------------------------------
// Injection token
// ---------------------------------------------------------------------------

/**
 * Injection token for the cookies module configuration.
 *
 * Provided by `provideCookies()`. Services inject this to read config.
 *
 * @example
 * ```typescript
 * const config = inject(COOKIE_CONFIG);
 * console.log(config.consent); // true
 * ```
 */
export const COOKIE_CONFIG = new InjectionToken<CookieConfig>(
  'COOKIE_CONFIG',
);
