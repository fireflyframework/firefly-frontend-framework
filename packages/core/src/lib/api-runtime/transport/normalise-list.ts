/**
 * Coerces a backend list response into a plain `T[]`, accepting both the
 * wrapped `{ items: [...] }` envelope and the flat array shape — many APIs
 * oscillate between the two across endpoints or environments. A missing
 * `items` collapses to `[]` so callers never null-check.
 *
 * @example
 * ```ts
 * const res = await this.api.request<{ items?: UserSummary[] } | UserSummary[]>({ … });
 * return normaliseList(res);
 * ```
 */
export function normaliseList<T>(res: { items?: T[] } | T[]): T[] {
  if (Array.isArray(res)) return res;
  return res.items ?? [];
}
