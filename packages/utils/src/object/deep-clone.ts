/**
 * Create a deep copy of `obj` with no shared references.
 * Uses the native `structuredClone` API.
 *
 * @example
 * const clone = deepClone({ a: { b: 1 } });
 */
export function deepClone<T>(obj: T): T {
  return structuredClone(obj);
}
