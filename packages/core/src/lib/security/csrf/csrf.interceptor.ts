import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { SecurityService } from '../security.service';

/** HTTP methods that mutate state and require CSRF protection. */
const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Functional HTTP interceptor that attaches a CSRF token header
 * on mutation requests (POST, PUT, PATCH, DELETE).
 *
 * Reads the token and header name from `SecurityService`.
 * Pass-through if CSRF is disabled in config or no token is available.
 *
 * Registration:
 * ```typescript
 * provideHttpClient(withInterceptors([csrfInterceptor]))
 * ```
 */
export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  const security = inject(SecurityService);

  if (!MUTATION_METHODS.has(req.method)) {
    return next(req);
  }

  const csrfConfig = security.config().csrf;
  if (csrfConfig?.enabled === false) {
    return next(req);
  }

  const token = security.getCsrfToken();
  if (!token) {
    return next(req);
  }

  const headerName = csrfConfig?.headerName ?? 'X-XSRF-TOKEN';
  const cloned = req.clone({
    setHeaders: { [headerName]: token },
  });

  return next(cloned);
};
