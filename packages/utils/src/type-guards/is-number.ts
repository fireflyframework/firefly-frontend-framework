/**
 * Check whether a value is a finite `number` (excludes `NaN`).
 *
 * @example
 * if (isNumber(val)) { val.toFixed(2); }
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}
