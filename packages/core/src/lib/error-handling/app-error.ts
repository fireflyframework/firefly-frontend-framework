/**
 * Indicates where the error originated from.
 *
 * - `'global'` — uncaught error captured by `FireflyErrorHandler`
 * - `'http'` — HTTP error classified by `errorInterceptor`
 * - `'programmatic'` — explicitly created via `createAppError()`
 */
export type ErrorOrigin = 'global' | 'http' | 'programmatic';

/**
 * Built-in classification codes for application errors.
 *
 * Used by `errorInterceptor` to map HTTP status codes and by
 * `FireflyErrorHandler` to classify uncaught errors.
 */
export type BuiltinErrorCode =
  | 'VALIDATION_ERROR'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'TIMEOUT_ERROR'
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR'
  | 'UNKNOWN_ERROR';

/**
 * Extend this interface via module augmentation to add product-specific
 * error codes without modifying the framework.
 *
 * @example
 * ```typescript
 * // In your product code:
 * declare module '@fireflyframework/core' {
 *   interface CustomErrorCodes {
 *     LEASE_EXPIRED: true;
 *     DOCUMENT_UPLOAD_FAILED: true;
 *   }
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CustomErrorCodes {}

/**
 * Classification code for application errors.
 *
 * Includes the 7 built-in codes plus any product-specific codes
 * declared via `CustomErrorCodes` module augmentation.
 */
export type ErrorCode = BuiltinErrorCode | keyof CustomErrorCodes;

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
  /** Where the error originated from. */
  readonly origin: ErrorOrigin;
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
 * @param options - Optional status, details, origin (defaults to 'programmatic')
 * @returns Immutable `AppError` instance
 */
export function createAppError(
  code: ErrorCode,
  message: string,
  options?: { status?: number; details?: unknown; origin?: ErrorOrigin },
): AppError {
  return {
    code,
    message,
    origin: options?.origin ?? 'programmatic',
    status: options?.status,
    details: options?.details,
    timestamp: Date.now(),
  };
}
