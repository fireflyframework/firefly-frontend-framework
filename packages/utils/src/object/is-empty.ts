/**
 * Check whether a value is "empty".
 *
 * - `null` / `undefined` → `true`
 * - `string` → `true` if length is 0
 * - `Array` → `true` if length is 0
 * - `object` → `true` if it has no own keys
 * - everything else (numbers, booleans) → `false`
 */
export function isEmpty(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === 'string') return value.length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}
