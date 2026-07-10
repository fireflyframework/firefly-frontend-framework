import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';

import { HTTP_HEADERS_CONFIG } from './http-headers.config';

/**
 * Functional HTTP interceptor that stamps every outgoing request with a
 * tenant header (default `X-Tenant-Id`) when a `tenantId` is configured
 * through {@link provideHttpHeaders}. Pass-through when no tenant is set.
 *
 * Registration:
 * ```ts
 * provideHttpClient(withInterceptors([tenantIdInterceptor]))
 * ```
 */
export const tenantIdInterceptor: HttpInterceptorFn = (req, next) => {
  const { tenantId, tenantHeaderName } = inject(HTTP_HEADERS_CONFIG);
  if (!tenantId) {
    return next(req);
  }
  return next(
    req.clone({ setHeaders: { [tenantHeaderName ?? 'X-Tenant-Id']: tenantId } }),
  );
};
