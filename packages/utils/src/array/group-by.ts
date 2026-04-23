/**
 * Group array items into a record keyed by the value of `key`.
 *
 * @example
 * groupBy([{ role: 'admin' }, { role: 'user' }], 'role')
 * // => { admin: [{ role: 'admin' }], user: [{ role: 'user' }] }
 */
export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  const result: Record<string, T[]> = {};
  for (const item of arr) {
    const k = String(item[key]);
    if (!result[k]) {
      result[k] = [];
    }
    result[k].push(item);
  }
  return result;
}
