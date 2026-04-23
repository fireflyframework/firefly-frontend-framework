/**
 * Flatten one level of nesting from an array.
 *
 * @example
 * flatten([[1, 2], [3], 4]) // => [1, 2, 3, 4]
 */
export function flatten<T>(arr: (T | T[])[]): T[] {
  const result: T[] = [];
  for (const item of arr) {
    if (Array.isArray(item)) {
      result.push(...item);
    } else {
      result.push(item);
    }
  }
  return result;
}
