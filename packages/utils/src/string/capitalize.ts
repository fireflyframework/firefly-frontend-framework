/**
 * Capitalize the first character of a string, leaving the rest unchanged.
 *
 * @example
 * capitalize('hello') // => 'Hello'
 */
export function capitalize(str: string): string {
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}
