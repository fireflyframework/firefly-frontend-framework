/**
 * Index an array into a record keyed by the value of `key`.
 * If duplicate keys exist, the last item wins.
 *
 * @example
 * keyBy(users, 'id') // => { '1': user1, '2': user2 }
 */
export function keyBy<T>(arr: T[], key: keyof T): Record<string, T> {
  const result: Record<string, T> = {};
  for (const item of arr) {
    result[String(item[key])] = item;
  }
  return result;
}
