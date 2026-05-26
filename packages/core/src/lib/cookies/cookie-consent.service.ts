import { computed, inject, Injectable, Signal, signal } from '@angular/core';

import type { ConsentPreferences, CookieCategory, CookieConfig } from './cookie.types';
import { COOKIE_CONFIG } from './cookie.types';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Serialize consent preferences to a cookie-safe JSON string. */
function serializePreferences(prefs: ConsentPreferences): string {
  return JSON.stringify(prefs);
}

/** Deserialize consent preferences from the cookie value. Returns `null` if invalid. */
function deserializePreferences(raw: string): ConsentPreferences | null {
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'object' && parsed !== null && parsed.essential === true) {
      return parsed as ConsentPreferences;
    }
    return null;
  } catch {
    return null;
  }
}

/** Read a cookie by name from `document.cookie`. */
function readCookie(name: string): string | null {
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : null;
}

/** Write a cookie with the given name, value, maxAge in days, and optional domain. */
function writeCookie(
  name: string,
  value: string,
  maxAgeDays: number,
  domain: string | undefined,
): void {
  const maxAge = maxAgeDays * 24 * 60 * 60;
  let cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
  if (domain) {
    cookie += `; domain=${domain}`;
  }
  document.cookie = cookie;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

/**
 * Manages GDPR/ePrivacy cookie consent with reactive signals.
 *
 * Persists the user's consent preferences in a dedicated first-party
 * cookie (configurable name, default `ff_cookie_consent`). On creation,
 * loads any existing preferences from that cookie.
 *
 * **Important:** This service operates directly on `document.cookie`
 * for its own persistence — it does **not** depend on `CookieService`
 * to avoid circular dependencies (see plan decision D4).
 *
 * @example
 * ```typescript
 * const consent = inject(CookieConsentService);
 *
 * // Check if user has given consent
 * if (!consent.consentGiven()) {
 *   showConsentBanner();
 * }
 *
 * // Accept all categories
 * consent.acceptAll();
 *
 * // Check a specific category reactively
 * const analyticsAllowed = consent.isCategoryAllowed('analytics');
 * ```
 */
@Injectable()
export class CookieConsentService {
  private readonly config = inject(COOKIE_CONFIG);

  /** Internal writable signal holding the current preferences. */
  private readonly _preferences = signal<ConsentPreferences>(
    this.loadFromCookie(),
  );

  /** Internal writable signal tracking whether the user has responded. */
  private readonly _consentGiven = signal<boolean>(
    this.hasExistingConsent(),
  );

  // -----------------------------------------------------------------------
  // Public API — read-only signals
  // -----------------------------------------------------------------------

  /**
   * Whether the user has given any consent response (accept/reject/custom).
   *
   * Returns `false` until the user interacts with the consent UI.
   * After the user responds, returns `true` (even if they rejected all).
   */
  consentGiven(): Signal<boolean> {
    return this._consentGiven.asReadonly();
  }

  /**
   * The user's current consent preferences by category.
   *
   * `essential` is always `true`. Other categories reflect the user's
   * choices. Changes are emitted reactively when any preference updates.
   */
  preferences(): Signal<ConsentPreferences> {
    return this._preferences.asReadonly();
  }

  // -----------------------------------------------------------------------
  // Public API — mutations
  // -----------------------------------------------------------------------

  /**
   * Accept all configured categories.
   *
   * Sets every category in `CookieConfig.categories` to `true`
   * and persists the result.
   */
  acceptAll(): void {
    const prefs = this.buildPreferences(true);
    this.applyAndPersist(prefs);
  }

  /**
   * Reject all non-essential categories.
   *
   * Sets every category except `'essential'` to `false`
   * and persists the result.
   */
  rejectAll(): void {
    const prefs = this.buildPreferences(false);
    this.applyAndPersist(prefs);
  }

  /**
   * Update individual category preferences.
   *
   * Merges the provided partial preferences with the current state.
   * The `essential` category is always forced to `true`.
   *
   * @param partial - Categories to update (e.g. `{ analytics: true }`)
   */
  updatePreferences(partial: Partial<ConsentPreferences>): void {
    const current = this._preferences();
    const merged: ConsentPreferences = {
      ...current,
      ...partial,
      essential: true, // always enforce
    };
    this.applyAndPersist(merged);
  }

  /**
   * Get a reactive signal indicating whether a specific category is allowed.
   *
   * The `'essential'` category always returns a signal that is `true`.
   * Other categories return a computed signal derived from `preferences()`.
   *
   * @param category - The cookie category to check
   * @returns A `Signal<boolean>` that updates when preferences change
   */
  isCategoryAllowed(category: CookieCategory): Signal<boolean> {
    if (category === 'essential') {
      return signal(true).asReadonly();
    }
    return computed(() => this._preferences()[category] === true);
  }

  // -----------------------------------------------------------------------
  // Private helpers
  // -----------------------------------------------------------------------

  /** Apply preferences to signals and persist to cookie. */
  private applyAndPersist(prefs: ConsentPreferences): void {
    this._preferences.set(prefs);
    this._consentGiven.set(true);
    this.saveToCookie(prefs);
  }

  /** Build a full ConsentPreferences object with all categories set to `value` (except essential=true). */
  private buildPreferences(value: boolean): ConsentPreferences {
    const prefs: Record<string, boolean> = { essential: true };
    for (const cat of this.config.categories) {
      prefs[cat] = cat === 'essential' ? true : value;
    }
    return prefs as ConsentPreferences;
  }

  /** Load preferences from the consent cookie, or return defaults (all false except essential). */
  private loadFromCookie(): ConsentPreferences {
    const raw = readCookie(this.config.consentCookieName);
    if (raw) {
      const parsed = deserializePreferences(raw);
      if (parsed) {
        return parsed;
      }
    }
    // Default: essential true, everything else false
    return this.buildPreferences(false);
  }

  /** Check whether a consent cookie already exists. */
  private hasExistingConsent(): boolean {
    return readCookie(this.config.consentCookieName) !== null;
  }

  /** Persist preferences to the consent cookie. */
  private saveToCookie(prefs: ConsentPreferences): void {
    writeCookie(
      this.config.consentCookieName,
      serializePreferences(prefs),
      this.config.consentMaxAgeDays,
      this.config.domain,
    );
  }
}
