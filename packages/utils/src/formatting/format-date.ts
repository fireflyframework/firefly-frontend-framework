/**
 * Format a date value as a locale-aware string using `Intl.DateTimeFormat`.
 *
 * Supported format shortcuts:
 * - `'short'`  — numeric day/month/year (e.g. 25/12/2025)
 * - `'medium'` — abbreviated month (e.g. 25 dic 2025)
 * - `'long'`   — full month name (e.g. 25 de diciembre de 2025)
 * - `'full'`   — weekday + full date
 *
 * @example
 * formatDate(new Date(2025, 11, 25), 'short', 'es')  // => '25/12/2025'
 * formatDate('2025-12-25', 'medium', 'en')            // => 'Dec 25, 2025'
 * formatDate(null, 'short', 'es')                      // => ''
 */
export function formatDate(
  value: Date | string | null | undefined,
  format: 'short' | 'medium' | 'long' | 'full' = 'short',
  locale = 'es',
): string {
  if (value == null) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const options: Intl.DateTimeFormatOptions = FORMAT_OPTIONS[format];
  return new Intl.DateTimeFormat(locale, options).format(date);
}

const FORMAT_OPTIONS: Record<string, Intl.DateTimeFormatOptions> = {
  short: { day: '2-digit', month: '2-digit', year: 'numeric' },
  medium: { day: 'numeric', month: 'short', year: 'numeric' },
  long: { day: 'numeric', month: 'long', year: 'numeric' },
  full: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
};
