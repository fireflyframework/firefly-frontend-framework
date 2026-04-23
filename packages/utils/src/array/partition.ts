/**
 * Split an array into two groups based on a predicate.
 * Returns `[pass, fail]` where `pass` contains items for which the predicate
 * returned `true`.
 *
 * @example
 * partition([1, 2, 3, 4], n => n % 2 === 0) // => [[2, 4], [1, 3]]
 */
export function partition<T>(arr: T[], predicate: (item: T) => boolean): [T[], T[]] {
  const pass: T[] = [];
  const fail: T[] = [];
  for (const item of arr) {
    if (predicate(item)) {
      pass.push(item);
    } else {
      fail.push(item);
    }
  }
  return [pass, fail];
}
