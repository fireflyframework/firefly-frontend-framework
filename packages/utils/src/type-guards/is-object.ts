/**
 * Check whether a value is a plain object (not `null`, not an array).
 *
 * @example
 * if (isObject(val)) { Object.keys(val); }
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
