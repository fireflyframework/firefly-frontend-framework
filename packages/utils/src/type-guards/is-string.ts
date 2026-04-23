/**
 * Check whether a value is a `string`.
 *
 * @example
 * if (isString(val)) { val.toUpperCase(); }
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}
