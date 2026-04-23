/**
 * Check whether a value is `null` or `undefined`.
 * Narrows the type accordingly via TypeScript type predicate.
 *
 * @example
 * if (isNullOrUndefined(val)) { /* val is null | undefined *​/ }
 */
export function isNullOrUndefined(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}
