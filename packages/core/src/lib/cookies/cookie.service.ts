import { inject, Injectable } from '@angular/core';

import { CookieConsentService } from './cookie-consent.service';
import type { CookieConfig, CookieOptions } from './cookie.types';
import { COOKIE_CONFIG } from './cookie.types';

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

/**
 * Typed CRUD service for browser cookies.
 *
 * Wraps `document.cookie` with a modern API and enforces GDPR consent
 * when `CookieConsentService` is available (i.e. when `provideCookies()`
 * was called with `consent: true`, which is the default).
 *
 * **Consent enforcement rules:**
 * - Cookies with `category: 'essential'` or no category → always written.
 * - Cookies with any other category → only written if the user has
 *   consented to that category. If not consented, a `console.warn` is
 *   emitted and the cookie is **not** written.
 * - If `CookieConsentService` is not registered (consent disabled),
 *   all cookies are written without restriction.
 *
 * @example
 * ```typescript
 * const cookies = inject(CookieService);
 *
 * // Read
 * const theme = cookies.get('theme'); // string | null
 *
 * // Write with options
 * cookies.set('theme', 'dark', {
 *   path: '/',
 *   maxAgeDays: 30,
 *   category: 'preferences',
 * });
 *
 * // Delete
 * cookies.delete('theme');
 *
 * // Read all
 * const all = cookies.getAll(); // Record<string, string>
 * ```
 */
@Injectable()
export class CookieService {
  private readonly config = inject(COOKIE_CONFIG);
  private readonly consent = inject(CookieConsentService, { optional: true });

  /**
   * Read a cookie by name.
   *
   * @param name - Cookie name
   * @returns The cookie value, or `null` if the cookie does not exist.
   */
  get(name: string): string | null {
    const match = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${name}=`));
    return match
      ? decodeURIComponent(match.split('=').slice(1).join('='))
      : null;
  }

  /**
   * Set a cookie with optional attributes.
   *
   * When consent management is active and the cookie has a non-essential
   * category, the write is blocked if the user has not consented to that
   * category. A `console.warn` is emitted in that case.
   *
   * @param name    - Cookie name
   * @param value   - Cookie value (will be URI-encoded)
   * @param options - Optional cookie attributes
   */
  set(name: string, value: string, options?: CookieOptions): void {
    if (!this.isAllowed(options?.category)) {
      console.warn(
        `[CookieService] Blocked: cookie "${name}" requires consent for category "${options!.category}".`,
      );
      return;
    }

    const parts: string[] = [
      `${name}=${encodeURIComponent(value)}`,
    ];

    const path = options?.path ?? '/';
    parts.push(`path=${path}`);

    const domain = options?.domain ?? this.config.domain;
    if (domain) {
      parts.push(`domain=${domain}`);
    }

    if (options?.maxAgeDays !== undefined) {
      parts.push(`max-age=${options.maxAgeDays * 24 * 60 * 60}`);
    }

    const secure = options?.secure ?? this.config.forceSecure;
    if (secure) {
      parts.push('Secure');
    }

    const sameSite = options?.sameSite ?? 'Lax';
    parts.push(`SameSite=${sameSite}`);

    document.cookie = parts.join('; ');
  }

  /**
   * Delete a cookie by setting its `max-age` to `0`.
   *
   * @param name    - Cookie name to delete
   * @param options - Optional path/domain to match the original cookie
   */
  delete(name: string, options?: Pick<CookieOptions, 'path' | 'domain'>): void {
    const path = options?.path ?? '/';
    const domain = options?.domain ?? this.config.domain;

    let cookie = `${name}=; path=${path}; max-age=0`;
    if (domain) {
      cookie += `; domain=${domain}`;
    }
    document.cookie = cookie;
  }

  /**
   * Read all cookies as a key-value record.
   *
   * @returns An object where keys are cookie names and values are
   *          decoded cookie values. Returns an empty object if no
   *          cookies exist.
   */
  getAll(): Record<string, string> {
    const raw = document.cookie;
    if (!raw) {
      return {};
    }
    const result: Record<string, string> = {};
    for (const pair of raw.split('; ')) {
      const eqIndex = pair.indexOf('=');
      if (eqIndex === -1) continue;
      const key = pair.substring(0, eqIndex);
      const val = pair.substring(eqIndex + 1);
      result[key] = decodeURIComponent(val);
    }
    return result;
  }

  // -----------------------------------------------------------------------
  // Private
  // -----------------------------------------------------------------------

  /**
   * Check whether a cookie with the given category is allowed to be written.
   *
   * - No category or `'essential'` → always allowed.
   * - Any other category → only if consent service says so.
   * - No consent service registered → always allowed.
   */
  private isAllowed(category: string | undefined): boolean {
    if (!category || category === 'essential') {
      return true;
    }
    if (!this.consent) {
      return true;
    }
    return this.consent.isCategoryAllowed(category)();
  }
}
