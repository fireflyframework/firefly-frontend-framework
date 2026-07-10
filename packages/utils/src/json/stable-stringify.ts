/**
 * Recursively sorts object keys (arrays keep their element order) so two
 * structurally-equal values serialize to the identical string regardless of
 * the order their keys were assigned in.
 */
function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, entry]) => [key, canonicalize(entry)]),
    );
  }
  return value;
}

/**
 * `JSON.stringify` with keys sorted recursively, so two values that are
 * structurally equal but were built with keys in a different order compare
 * equal as strings. Useful for cheap deep-equality checks — draft-vs-baseline
 * dirty flags, cache invalidation, memoized computed inputs.
 *
 * @returns `undefined` for inputs `JSON.stringify` itself cannot serialize
 *   (mirrors the native function's contract), the JSON string otherwise.
 *
 * @example
 * stableStringify({ b: 1, a: 2 }) === stableStringify({ a: 2, b: 1 })  // => true
 */
export function stableStringify(value: unknown): string | undefined {
  return JSON.stringify(canonicalize(value));
}
