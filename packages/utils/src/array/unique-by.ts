/**
 * Remove duplicates from an array using a key function to determine identity.
 * The first occurrence of each key is kept.
 *
 * @example
 * uniqueBy(users, u => u.role) // keeps first item per role
 */
export function uniqueBy<T>(arr: T[], keyFn: (item: T) => unknown): T[] {
  const seen = new Set<unknown>();
  const result: T[] = [];
  for (const item of arr) {
    const k = keyFn(item);
    if (!seen.has(k)) {
      seen.add(k);
      result.push(item);
    }
  }
  return result;
}
