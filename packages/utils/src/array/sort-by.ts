/**
 * Return a sorted copy of the array using a key function for comparison.
 * Does not mutate the original array.
 *
 * @example
 * sortBy(users, u => u.name) // ascending by name
 */
export function sortBy<T>(arr: T[], keyFn: (item: T) => string | number): T[] {
  return [...arr].sort((a, b) => {
    const ka = keyFn(a);
    const kb = keyFn(b);
    if (ka < kb) return -1;
    if (ka > kb) return 1;
    return 0;
  });
}
