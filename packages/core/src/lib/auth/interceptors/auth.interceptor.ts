import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../auth.service';
import { from } from 'rxjs';

/** Endpoints that must NOT receive a Bearer token (they handle their own auth). */
const SKIP_PATHS = ['/auth/login', '/auth/refresh'];

/**
 * Functional HTTP interceptor that handles authentication concerns:
 *
 * 1. Injects `Authorization: Bearer <token>` on outgoing requests
 * 2. Skips token injection for auth endpoints (login, refresh)
 * 3. On 401 response: attempts token refresh, then retries the original request
 * 4. If refresh fails: propagates the 401 error
 *
 * Register via `provideHttpClient(withInterceptors([authInterceptor]))`.
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const authService = inject(AuthService);

  if (shouldSkip(req.url)) {
    return next(req);
  }

  const authedReq = addToken(req, authService.getAccessToken());

  return next(authedReq).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return from(authService.refreshToken()).pipe(
          switchMap((refreshed) => {
            if (refreshed) {
              const retryReq = addToken(req, authService.getAccessToken());
              return next(retryReq);
            }
            return throwError(() => error);
          }),
        );
      }
      return throwError(() => error);
    }),
  );
};

/** Clone request with Authorization header if token exists. */
function addToken(
  req: HttpRequest<unknown>,
  token: string | null,
): HttpRequest<unknown> {
  if (!token) {
    return req;
  }
  return req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
}

/** Check if the URL matches an auth endpoint that should skip token injection. */
function shouldSkip(url: string): boolean {
  return SKIP_PATHS.some((path) => url.includes(path));
}
