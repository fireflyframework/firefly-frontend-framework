/**
 * Format a numeric value as a percentage string using `Intl.NumberFormat`.
 *
 * The value is expected as a fraction (e.g. 0.15 for 15%).
 *
 * @example
 * formatPercentage(0.1534, 'es', 2)  // => '15,34 %'
 * formatPercentage(0.1534, 'en', 1)  // => '15.3%'
 * formatPercentage(null, 'es')        // => ''
 */
export function formatPercentage(
  value: number | null | undefined,
  locale = 'es',
  decimals = 2,
): string {
  if (value == null || Number.isNaN(value)) return '';
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
