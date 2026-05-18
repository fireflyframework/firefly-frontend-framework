import { Injectable, inject } from '@angular/core';
import { ErrorHandler } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorService } from './error.service';
import { createAppError } from './app-error';

/**
 * Global error handler that replaces Angular's default `ErrorHandler`.
 *
 * Catches **uncaught** errors (thrown in components, services, pipes,
 * event handlers, etc.) and records them in `ErrorService`.
 *
 * HTTP errors (`HttpErrorResponse`) that reach this handler are
 * **not re-registered** in `ErrorService` — `errorInterceptor`
 * already handled them. They are only logged to the console.
 *
 * Registered via `provideErrorHandling()`:
 * ```typescript
 * { provide: ErrorHandler, useClass: FireflyErrorHandler }
 * ```
 *
 * @see ErrorService
 * @see errorInterceptor
 */
@Injectable()
export class FireflyErrorHandler implements ErrorHandler {
  private readonly errorService = inject(ErrorService);

  handleError(error: unknown): void {
    // Always log to console for dev tools visibility
    console.error('[FireflyErrorHandler]', error);

    if (error instanceof HttpErrorResponse) {
      // errorInterceptor already registered this in ErrorService.
      // Logging above is sufficient — skip duplicate registration.
      return;
    }

    // Unwrap: Angular sometimes wraps errors in an object with a
    // `rejection` property (unhandled promise rejections).
    const unwrapped = this.unwrap(error);

    if (unwrapped instanceof HttpErrorResponse) {
      // Wrapped HttpErrorResponse — same logic: already handled by interceptor.
      return;
    }

    const message =
      unwrapped instanceof Error
        ? unwrapped.message
        : String(unwrapped);

    const appError = createAppError('UNKNOWN_ERROR', message, {
      details: unwrapped instanceof Error ? unwrapped.stack : unwrapped,
      origin: 'global',
    });

    this.errorService.handleError(appError);
  }

  /**
   * Unwraps Angular's error wrappers.
   *
   * Angular may wrap the original error in:
   * - `{ rejection: <original> }` for unhandled promise rejections
   * - `{ error: <original> }` for some zone.js wrappers
   */
  private unwrap(error: unknown): unknown {
    if (error != null && typeof error === 'object') {
      if ('rejection' in error) {
        return (error as { rejection: unknown }).rejection;
      }
    }
    return error;
  }
}
