import { InjectionToken } from '@angular/core';

/** Idempotency-key stamping behaviour for mutation requests. */
export interface IdempotencyConfig {
  /** Stamp mutation requests with an idempotency key. Defaults to `true`. */
  enabled?: boolean;
  /** Header name. Defaults to `'X-Idempotency-Key'`. */
  headerName?: string;
}

/**
 * Configuration for the generic HTTP header interceptors
 * ({@link tenantIdInterceptor}, {@link idempotencyKeyInterceptor}).
 *
 * Product-agnostic: the host application supplies its own tenant id (from
 * its environment) through {@link provideHttpHeaders}; the framework never
 * reads a product-specific environment file.
 */
export interface HttpHeadersConfig {
  /** Tenant identifier sent on every request. Empty/omitted ⇒ no tenant header. */
  tenantId?: string;
  /** Tenant header name. Defaults to `'X-Tenant-Id'`. */
  tenantHeaderName?: string;
  /** Idempotency-key behaviour for mutation requests. */
  idempotency?: IdempotencyConfig;
}

/**
 * DI token holding the resolved {@link HttpHeadersConfig}. Defaults to an
 * empty object, which makes both interceptors no-ops until a product calls
 * {@link provideHttpHeaders}.
 */
export const HTTP_HEADERS_CONFIG = new InjectionToken<HttpHeadersConfig>(
  'FF_HTTP_HEADERS_CONFIG',
  { providedIn: 'root', factory: () => ({}) },
);
