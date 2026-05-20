// ---------------------------------------------------------------------------
// PII field types
// ---------------------------------------------------------------------------

/**
 * Types of personally identifiable information (PII) that can be masked.
 *
 * Each type has a corresponding masking function in `pii.utils.ts`
 * and is supported by the `FfPiiMaskPipe`.
 *
 * @example
 * ```html
 * {{ nifValue | ffPiiMask:'nif' }}
 * {{ cardNumber | ffPiiMask:'card' }}
 * ```
 */
export type PiiFieldType = 'nif' | 'card' | 'phone' | 'email' | 'iban';

// ---------------------------------------------------------------------------
// PII masking mode
// ---------------------------------------------------------------------------

/**
 * Controls how PII masking behaves in the application.
 *
 * - `'auto'`     — PII is masked by default; user can toggle to reveal
 * - `'manual'`   — PII is shown by default; masking applied only when explicitly requested
 * - `'disabled'` — No masking applied; all data shown as-is
 */
export type PiiMaskingMode = 'auto' | 'manual' | 'disabled';

// ---------------------------------------------------------------------------
// CSRF configuration
// ---------------------------------------------------------------------------

/**
 * Configuration for the CSRF interceptor.
 *
 * The interceptor reads a CSRF token from a browser cookie and injects
 * it as a header on mutation requests (POST, PUT, PATCH, DELETE).
 *
 * @example
 * ```typescript
 * provideSecurity({
 *   csrf: {
 *     enabled: true,
 *     cookieName: 'XSRF-TOKEN',
 *     headerName: 'X-XSRF-TOKEN',
 *   },
 * })
 * ```
 */
export interface CsrfConfig {
  /**
   * Whether the CSRF interceptor is active.
   * When `false`, the interceptor passes requests through unchanged.
   * Default: `true`.
   */
  readonly enabled?: boolean;

  /**
   * Name of the cookie that holds the CSRF token.
   * The interceptor reads this cookie from `document.cookie`.
   * Default: `'XSRF-TOKEN'`.
   */
  readonly cookieName?: string;

  /**
   * Name of the HTTP header to set on mutation requests.
   * Default: `'X-XSRF-TOKEN'`.
   */
  readonly headerName?: string;
}

// ---------------------------------------------------------------------------
// Module configuration
// ---------------------------------------------------------------------------

/**
 * Configuration for `provideSecurity()`.
 *
 * Controls CSRF protection and PII masking behavior.
 * All fields are optional — sensible defaults are applied.
 *
 * @example
 * ```typescript
 * provideSecurity({
 *   csrf: { enabled: true, cookieName: 'XSRF-TOKEN' },
 *   piiMasking: 'auto',
 * })
 * ```
 */
export interface SecurityConfig {
  /** CSRF interceptor configuration. Default: enabled with standard cookie/header names. */
  readonly csrf?: CsrfConfig;

  /**
   * PII masking mode.
   * Default: `'manual'` — masking only when explicitly applied via pipe or directive.
   */
  readonly piiMasking?: PiiMaskingMode;
}
