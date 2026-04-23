/**
 * Truncate a string to `maxLength` characters, appending a suffix
 * (default `'...'`) when truncation occurs.
 * Returns the original string if it is already within the limit.
 *
 * @example
 * truncate('Hello World', 5) // => 'Hello...'
 */
export function truncate(str: string, maxLength: number, suffix = '...'): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + suffix;
}
