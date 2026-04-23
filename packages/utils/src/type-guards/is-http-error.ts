/**
 * Check whether an unknown value matches the shape of an HTTP error
 * (`{ status: number; message: string }`).
 *
 * @example
 * if (isHttpError(err)) { console.log(err.status, err.message); }
 */
export function isHttpError(error: unknown): error is { status: number; message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    'message' in error &&
    typeof (error as Record<string, unknown>)['status'] === 'number' &&
    typeof (error as Record<string, unknown>)['message'] === 'string'
  );
}
