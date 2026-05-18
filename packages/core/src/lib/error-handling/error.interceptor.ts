import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ErrorService } from './error.service';
import { createAppError } from './app-error';
import type { ErrorCode } from './app-error';

/**
 * Maps an HTTP status code to an `ErrorCode`.
 *
 * Returns `null` for 401 — that status is handled exclusively
 * by `authInterceptor` (token refresh / redirect).
 */
function mapStatusToCode(status: number): ErrorCode | null {
  if (status === 401) return null;
  if (status === 400) return 'VALIDATION_ERROR';
  if (status === 403) return 'FORBIDDEN';
  if (status === 404) return 'NOT_FOUND';
  if (status === 408) return 'TIMEOUT_ERROR';
  if (status === 0) return 'NETWORK_ERROR';
  if (status >= 500) return 'SERVER_ERROR';
  return 'UNKNOWN_ERROR';
}

/**
 * Functional HTTP interceptor that classifies error responses
 * into `AppError` instances and records them in `ErrorService`.
 *
 * **401 is intentionally skipped** — `authInterceptor` handles
 * token refresh and re-authentication. Mapping 401 here would
 * cause duplicate error handling.
 *
 * The interceptor **re-throws** the original `HttpErrorResponse`
 * so downstream subscribers can still react to specific errors.
 *
 * Registration order matters:
 * ```
 * provideHttpClient(
 *   withInterceptors([authInterceptor, errorInterceptor])
 * )
 * ```
 * `authInterceptor` runs first so 401 is resolved (or propagated)
 * before `errorInterceptor` classifies remaining failures.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorService = inject(ErrorService);

  return next(req).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse) {
        const code = mapStatusToCode(error.status);

        if (code) {
          const appError = createAppError(code, error.message, {
            status: error.status,
            details: error.error,
            origin: 'http',
          });
          errorService.handleError(appError);
        }
      }

      return throwError(() => error);
    }),
  );
};
