/**
 * Classification codes for application errors.
 *
 * Used by `errorInterceptor` to map HTTP status codes and by
 * `FireflyErrorHandler` to classify uncaught errors.
 */
export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'TIMEOUT_ERROR'
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR'
  | 'UNKNOWN_ERROR';

/**
 * Application-level error representation.
 *
 * Produced by `errorInterceptor` (HTTP errors) and `FireflyErrorHandler`
 * (uncaught errors). Stored in `ErrorService` and consumed by UI components.
 */
export interface AppError {
  /** Classification code for programmatic handling. */
  readonly code: ErrorCode;
  /** Human-readable error message. */
  readonly message: string;
  /** HTTP status code, if the error originated from an HTTP response. */
  readonly status?: number;
  /** Additional context (validation errors, server payload, etc.). */
  readonly details?: unknown;
  /** Timestamp when the error was created (epoch ms). */
  readonly timestamp: number;
}

/**
 * Optional configuration for `provideErrorHandling()`.
 */
export interface ErrorHandlingConfig {
  /** Maximum number of errors to keep in history. Default 50. */
  maxHistorySize?: number;
}

/**
 * Factory function to create an `AppError` with sensible defaults.
 *
 * @param code - Error classification code
 * @param message - Human-readable message
 * @param options - Optional status, details
 * @returns Immutable `AppError` instance
 */
export function createAppError(
  code: ErrorCode,
  message: string,
  options?: { status?: number; details?: unknown },
): AppError {
  return {
    code,
    message,
    status: options?.status,
    details: options?.details,
    timestamp: Date.now(),
  };
}
