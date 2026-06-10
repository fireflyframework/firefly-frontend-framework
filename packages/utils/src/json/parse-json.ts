/**
 * Result of {@link tryParseJson} — the parsed value when valid,
 * the human-readable error message otherwise. Discriminated by
 * checking `error === null`.
 */
export interface ParseJsonResult<T> {
  readonly value: T | null;
  readonly error: string | null;
}

/**
 * Parse `text` as JSON and return a `{ value, error }` tuple
 * instead of throwing.
 *
 * Generic `T` lets the caller assert the expected shape — the
 * function does NOT validate against `T`, it only confirms the
 * input is syntactically valid JSON. Use a separate schema check
 * if you need structural guarantees.
 *
 * Common consumer patterns:
 * - `const { value, error } = tryParseJson<MyShape>(raw);`
 * - `if (error !== null) return error;`
 */
export function tryParseJson<T = unknown>(text: string): ParseJsonResult<T> {
  try {
    return { value: JSON.parse(text) as T, error: null };
  } catch (err) {
    return { value: null, error: err instanceof Error ? err.message : 'Invalid JSON.' };
  }
}

/**
 * Returns `null` when `text` parses as JSON, the parser's error
 * message otherwise. Useful for textarea-level validation where
 * the caller only needs the syntax flag (and parses separately
 * at submit time).
 */
export function validateJson(text: string): string | null {
  return tryParseJson(text).error;
}
