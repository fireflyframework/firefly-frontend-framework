import { Injectable, InjectionToken, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { SecurityConfig, CsrfConfig } from './security.types';

const DEFAULT_CSRF: Required<CsrfConfig> = {
  enabled: true,
  cookieName: 'XSRF-TOKEN',
  headerName: 'X-XSRF-TOKEN',
};

/**
 * Injection token for the security module configuration.
 *
 * Provided by `provideSecurity()`. When absent, defaults apply.
 */
export const SECURITY_CONFIG = new InjectionToken<SecurityConfig>(
  'SECURITY_CONFIG',
);

/**
 * Central service for security concerns: CSRF token management
 * and module configuration.
 *
 * Usage:
 * ```typescript
 * const security = inject(SecurityService);
 * const token = security.getCsrfToken();
 * ```
 */
@Injectable()
export class SecurityService {
  private readonly doc = inject(DOCUMENT, { optional: true });
  private readonly inputConfig = inject(SECURITY_CONFIG, { optional: true });
  private readonly _manualToken = signal<string | null>(null);

  /** Resolved security configuration (defaults + overrides). */
  readonly config = signal<SecurityConfig>({
    csrf: {
      ...DEFAULT_CSRF,
      ...this.inputConfig?.csrf,
    },
    piiMasking: this.inputConfig?.piiMasking ?? 'manual',
  }).asReadonly();

  /**
   * Returns the current CSRF token.
   *
   * Resolution order:
   * 1. Manual token set via `setCsrfToken()` (SSR / testing)
   * 2. Cookie value read from `document.cookie`
   * 3. `null` if neither available
   */
  getCsrfToken(): string | null {
    const manual = this._manualToken();
    if (manual) return manual;
    return this.readCookie(this.config().csrf?.cookieName ?? DEFAULT_CSRF.cookieName);
  }

  /**
   * Manually set the CSRF token.
   *
   * Useful in SSR environments or testing where cookies aren't available.
   */
  setCsrfToken(token: string): void {
    this._manualToken.set(token);
  }

  /** Clear manually set token — falls back to cookie. */
  clearCsrfToken(): void {
    this._manualToken.set(null);
  }

  /** Read a cookie value by name from `document.cookie`. SSR-safe. */
  private readCookie(name: string): string | null {
    if (!this.doc) return null;
    const cookies = this.doc.cookie;
    if (!cookies) return null;
    const match = cookies.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
  }
}
