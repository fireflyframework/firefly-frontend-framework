/**
 * Check whether a value is neither `null` nor `undefined`.
 * Narrows `T | null | undefined` to `T`.
 *
 * @example
 * const defined = items.filter(isDefined); // removes nulls
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}
