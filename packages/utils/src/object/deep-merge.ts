/**
 * Recursively merge `source` into `target`, producing a new object.
 * Nested plain objects are merged; arrays and primitives are overwritten.
 *
 * @example
 * deepMerge({ a: { x: 1 } }, { a: { y: 2 } })
 * // => { a: { x: 1, y: 2 } }
 */
export function deepMerge<T>(target: T, source: Partial<T>): T {
  const result = { ...target } as Record<string, unknown>;

  for (const key of Object.keys(source as Record<string, unknown>)) {
    const targetVal = (target as Record<string, unknown>)[key];
    const sourceVal = (source as Record<string, unknown>)[key];

    if (
      isPlainObject(targetVal) &&
      isPlainObject(sourceVal)
    ) {
      result[key] = deepMerge(targetVal, sourceVal);
    } else {
      result[key] = sourceVal;
    }
  }

  return result as T;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
