/**
 * Create a new object containing only the specified keys from `obj`.
 * Keys not present in `obj` are silently ignored.
 *
 * @example
 * pick({ a: 1, b: 2, c: 3 }, ['a', 'c'])
 * // => { a: 1, c: 3 }
 */
export function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in (obj as object)) {
      result[key] = obj[key];
    }
  }
  return result;
}
