export function keyBy<T>(arr: T[], key: keyof T): Record<string, T> {
  const result: Record<string, T> = {};
  for (const item of arr) {
    result[String(item[key])] = item;
  }
  return result;
}
