/**
 * Remove duplicate primitive values from an array, preserving order.
 *
 * @example
 * unique([1, 2, 2, 3]) // => [1, 2, 3]
 */
export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}
