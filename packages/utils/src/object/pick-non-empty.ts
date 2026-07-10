/**
 * Copies the requested keys of `raw`, skipping the EMPTY ones — where
 * empty means `''`, `null` or `undefined`, on purpose NOT falsy:
 * `0` and `false` are legitimate values and are kept (pruning by
 * truthiness is the classic bug of this pattern).
 *
 * The standard "omit empty optionals" builder for API payloads from
 * form `getRawValue()`: send nothing instead of empty strings so the
 * backend never overwrites stored values with blanks.
 *
 * @example
 * pickNonEmpty({ a: 'x', b: '', c: 0, d: null }, ['a', 'b', 'c', 'd'])
 * // => { a: 'x', c: 0 }
 */
export function pickNonEmpty<T extends object, K extends keyof T>(
  raw: T,
  keys: readonly K[],
): Partial<Pick<T, K>> {
  const out: Partial<Pick<T, K>> = {};
  for (const key of keys) {
    const value = raw[key];
    if (value === '' || value === null || value === undefined) continue;
    out[key] = value;
  }
  return out;
}
