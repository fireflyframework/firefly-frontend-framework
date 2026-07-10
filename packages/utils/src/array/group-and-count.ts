/**
 * Single bucket produced by {@link groupAndCount}. Carries the
 * canonical key for downstream lookups plus a presentation-friendly
 * label and the cardinality.
 */
export interface GroupedCount<TKey extends string> {
  /** Stable bucket key — used for routing, lookups, deduplication. */
  readonly key: TKey;
  /** Human-readable label rendered in tables, chart axes, tooltips. */
  readonly label: string;
  /** Number of source items that fell into the bucket. */
  readonly count: number;
}

/**
 * Options accepted by {@link groupAndCount}. Every field is optional;
 * the defaults match the most common case (string keys used verbatim
 * as labels, sorted by count descending).
 */
export interface GroupAndCountOptions<T, TKey extends string> {
  /**
   * Maps the canonical key to a presentation label. Defaults to the
   * key itself. Useful when the key is an id and the label should be
   * a display name; pass a closure over a lookup map for that case.
   */
  readonly labelFn?: (key: TKey, sample: T) => string;
  /**
   * Sort direction by count. `'desc'` (default) puts the largest
   * bucket first — typical for "top N" charts. `'asc'` puts the
   * smallest first; `'none'` preserves the order keys first
   * appeared in the input.
   */
  readonly sort?: 'desc' | 'asc' | 'none';
}

/**
 * Group items by a key derived from each item, count cardinalities
 * per bucket, sort and return as `GroupedCount[]`.
 *
 * Total over the input — every source item lands in exactly one
 * bucket. `null` / `undefined` keys (returned by `keyFn`) are
 * dropped silently so the caller does not have to filter upstream.
 *
 * @param items source items to bucket
 * @param keyFn extracts the canonical bucket key from each item
 * @param options sorting / labelling tweaks; see
 *   {@link GroupAndCountOptions}
 * @returns one entry per bucket, sorted per `options.sort`
 *
 * @example
 * groupAndCount(
 *   workflows,
 *   (w) => w.assignee ?? 'unassigned',
 *   { labelFn: (k) => k === 'unassigned' ? 'Unassigned' : k },
 * );
 * // → [{ key: 'alice', label: 'alice', count: 3 }, …]
 */
export function groupAndCount<T, TKey extends string = string>(
  items: ReadonlyArray<T>,
  keyFn: (item: T) => TKey | null | undefined,
  options: GroupAndCountOptions<T, TKey> = {},
): GroupedCount<TKey>[] {
  const sort = options.sort ?? 'desc';
  const labelFn = options.labelFn ?? ((k: TKey) => k);

  const counts = new Map<TKey, number>();
  const samples = new Map<TKey, T>();
  for (const item of items) {
    const key = keyFn(item);
    if (key === null || key === undefined) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
    if (!samples.has(key)) samples.set(key, item);
  }

  const buckets: GroupedCount<TKey>[] = Array.from(counts, ([key, count]) => ({
    key,
    label: labelFn(key, samples.get(key) as T),
    count,
  }));

  if (sort === 'desc') buckets.sort((a, b) => b.count - a.count);
  else if (sort === 'asc') buckets.sort((a, b) => a.count - b.count);

  return buckets;
}
