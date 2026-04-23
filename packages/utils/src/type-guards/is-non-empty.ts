/**
 * Check whether a value is non-null, non-undefined, and not an empty string.
 * Useful for filtering out "blank" values while preserving the narrowed type.
 *
 * @example
 * const items = [name, null, ''].filter(isNonEmpty); // string[]
 */
export function isNonEmpty<T>(value: T | null | undefined | ''): value is T {
  return value !== null && value !== undefined && value !== '';
}
