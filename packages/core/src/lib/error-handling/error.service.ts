import { inject, Injectable, InjectionToken, signal } from '@angular/core';
import { AppError } from './app-error';

const DEFAULT_MAX_HISTORY = 50;

/**
 * Injection token for optional error handling configuration.
 *
 * Provided via `provideErrorHandling()`. If not provided, ErrorService
 * uses built-in defaults (maxHistorySize: 50).
 */
export const ERROR_HANDLING_CONFIG = new InjectionToken<{ maxHistorySize?: number }>(
  'ERROR_HANDLING_CONFIG',
);

/**
 * Central error state manager.
 *
 * Tracks the most recent application error and maintains a bounded
 * history. State is exposed as readonly signals for consumption in
 * templates and computed expressions.
 *
 * Errors are pushed in by `errorInterceptor` (HTTP errors) and
 * `FireflyErrorHandler` (uncaught errors). UI components read
 * `lastError` and `errorHistory` to display feedback.
 *
 * @example
 * ```typescript
 * private errors = inject(ErrorService);
 *
 * // Read in template
 * // @if (errors.lastError(); as err) { <p>{{ err.message }}</p> }
 *
 * // Clear
 * this.errors.clearError();
 * ```
 */
@Injectable()
export class ErrorService {
  private readonly config = inject(ERROR_HANDLING_CONFIG, { optional: true });

  private readonly _lastError = signal<AppError | null>(null);
  private readonly _errorHistory = signal<readonly AppError[]>([]);

  /** The most recent error, or `null` if no error / cleared. */
  readonly lastError = this._lastError.asReadonly();

  /** Bounded FIFO history of errors. Most recent last. */
  readonly errorHistory = this._errorHistory.asReadonly();

  /**
   * Record an application error.
   *
   * Sets `lastError` and appends to `errorHistory` (trimming oldest
   * entries when `maxHistorySize` is exceeded).
   */
  handleError(error: AppError): void {
    this._lastError.set(error);
    const max = this.config?.maxHistorySize ?? DEFAULT_MAX_HISTORY;
    this._errorHistory.update((history) => {
      const updated = [...history, error];
      return updated.length > max ? updated.slice(updated.length - max) : updated;
    });
  }

  /** Reset `lastError` to `null`. History is not affected. */
  clearError(): void {
    this._lastError.set(null);
  }

  /** Clear the error history. `lastError` is not affected. */
  clearHistory(): void {
    this._errorHistory.set([]);
  }
}
