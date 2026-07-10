import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';

import { HTTP_HEADERS_CONFIG } from './http-headers.config';

/**
 * State-changing HTTP methods that should carry an idempotency key so the
 * backend can de-duplicate retries safely. GET / HEAD / OPTIONS are read-only
 * and excluded. PATCH is included (partial updates are non-idempotent by spec).
 */
const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Functional HTTP interceptor that stamps mutation requests with a random
 * `X-Idempotency-Key` (RFC 4122 v4 UUID via `crypto.randomUUID()`) so the
 * backend can collapse duplicate submissions from retries or double-clicks.
 *
 * Enabled by default; the header name can be changed or stamping disabled via
 * {@link provideHttpHeaders}. A caller-set key is preserved (not overwritten),
 * so a deliberate retry under a fixed key survives.
 *
 * Registration:
 * ```ts
 * provideHttpClient(withInterceptors([idempotencyKeyInterceptor]))
 * ```
 */
export const idempotencyKeyInterceptor: HttpInterceptorFn = (req, next) => {
  const { idempotency } = inject(HTTP_HEADERS_CONFIG);
  if (idempotency?.enabled === false || !MUTATION_METHODS.has(req.method)) {
    return next(req);
  }
  const headerName = idempotency?.headerName ?? 'X-Idempotency-Key';
  if (req.headers.has(headerName)) {
    return next(req);
  }
  return next(req.clone({ setHeaders: { [headerName]: crypto.randomUUID() } }));
};
