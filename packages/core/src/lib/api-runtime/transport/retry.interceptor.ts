import { inject, InjectionToken } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { retry, timer } from 'rxjs';
import type { TransportGlobalOptions } from './transport-config';

/**
 * Injection token for transport global options.
 *
 * Provided by `provideFireflyTransport()`. Used by `retryInterceptor`
 * to read retry configuration.
 */
export const TRANSPORT_OPTIONS = new InjectionToken<TransportGlobalOptions>(
  'TRANSPORT_OPTIONS',
);

const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_BACKOFF_MS = 1000;
const DEFAULT_MAX_BACKOFF_MS = 30_000;
const DEFAULT_RETRYABLE_STATUSES = [408, 429, 500, 502, 503, 504];

const IDEMPOTENT_METHODS = new Set(['GET', 'PUT', 'DELETE', 'HEAD', 'OPTIONS']);

/**
 * Functional HTTP interceptor that retries transient failures
 * with exponential backoff.
 *
 * Configured via `TransportGlobalOptions.retry` passed through
 * `provideFireflyTransport()`. Disabled when no retry config is provided.
 *
 * Must be placed **before** `errorInterceptor` in the interceptor chain
 * so only the final failure (after exhausting retries) gets classified.
 *
 * ```ts
 * provideHttpClient(
 *   withInterceptors([authInterceptor, retryInterceptor, errorInterceptor])
 * )
 * ```
 *
 * Features:
 * - Exponential backoff with configurable cap
 * - Idempotent-only filter (default: only GET, PUT, DELETE, HEAD, OPTIONS)
 * - Configurable retryable status codes
 * - 401 is never retried (handled by authInterceptor)
 */
export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  const options = inject(TRANSPORT_OPTIONS, { optional: true });
  const retryConfig = options?.retry;

  if (!retryConfig) {
    return next(req);
  }

  const idempotentOnly = retryConfig.idempotentOnly ?? true;
  if (idempotentOnly && !isIdempotent(req)) {
    return next(req);
  }

  const maxRetries = retryConfig.maxRetries ?? DEFAULT_MAX_RETRIES;
  const backoffMs = retryConfig.backoffMs ?? DEFAULT_BACKOFF_MS;
  const maxBackoffMs = retryConfig.maxBackoffMs ?? DEFAULT_MAX_BACKOFF_MS;
  const statuses = retryConfig.retryableStatuses ?? DEFAULT_RETRYABLE_STATUSES;

  return next(req).pipe(
    retry({
      count: maxRetries,
      delay: (error, attempt) => {
        if (
          error instanceof HttpErrorResponse &&
          statuses.includes(error.status)
        ) {
          const delay = Math.min(backoffMs * Math.pow(2, attempt - 1), maxBackoffMs);
          return timer(delay);
        }
        throw error;
      },
    }),
  );
};

function isIdempotent(req: HttpRequest<unknown>): boolean {
  return IDEMPOTENT_METHODS.has(req.method);
}
