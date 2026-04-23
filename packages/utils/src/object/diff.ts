/**
 * Return a partial object containing only the keys of `b` whose values
 * differ from `a` (shallow comparison via `!==`).
 *
 * @example
 * diff({ x: 1, y: 2 }, { x: 1, y: 5 })
 * // => { y: 5 }
 */
export function diff<T extends Record<string, unknown>>(a: T, b: T): Partial<T> {
  const result: Partial<T> = {};

  for (const key of Object.keys(b) as (keyof T)[]) {
    if (a[key] !== b[key]) {
      result[key] = b[key];
    }
  }

  return result;
}
