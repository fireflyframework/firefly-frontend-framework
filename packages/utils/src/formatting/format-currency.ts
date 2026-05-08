/**
 * Format a numeric value as a currency string using `Intl.NumberFormat`.
 *
 * @example
 * formatCurrency(1234.5, 'EUR', 'es')  // => '1.234,50 €'
 * formatCurrency(1234.5, 'EUR', 'en')  // => '€1,234.50'
 * formatCurrency(null, 'EUR', 'es')    // => ''
 */
export function formatCurrency(
  value: number | null | undefined,
  currency = 'EUR',
  locale = 'es',
): string {
  if (value == null || Number.isNaN(value)) return '';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
}
