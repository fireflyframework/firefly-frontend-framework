/**
 * Returns a copy of `items` sorted by their `priority` field in
 * descending order. Items missing `priority` (`undefined` or `null`)
 * collapse to the tail and keep their relative order.
 *
 * Stable per `Array.prototype.sort` (V8 / SpiderMonkey since ES2019).
 * Pure function — does not mutate the input.
 *
 * @example
 * ```ts
 * sortByPriorityDesc([
 *   { id: 'a', priority: 1 },
 *   { id: 'b', priority: 5 },
 *   { id: 'c' },
 *   { id: 'd', priority: 3 },
 * ]);
 * // → [ { id: 'b', priority: 5 }, { id: 'd', priority: 3 },
 * //     { id: 'a', priority: 1 }, { id: 'c' } ]
 * ```
 */
export function sortByPriorityDesc<T extends { priority?: number }>(
  items: ReadonlyArray<T>,
): T[] {
  return [...items].sort((a, b) => {
    const pa = a.priority ?? Number.NEGATIVE_INFINITY;
    const pb = b.priority ?? Number.NEGATIVE_INFINITY;
    return pb - pa;
  });
}
