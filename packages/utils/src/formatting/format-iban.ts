/**
 * Format an IBAN string into groups of 4 characters separated by spaces.
 *
 * Non-alphanumeric characters are stripped before formatting.
 *
 * @example
 * formatIBAN('ES7921000813610123456789')  // => 'ES79 2100 0813 6101 2345 6789'
 * formatIBAN('ES79 2100 0813')            // => 'ES79 2100 0813'
 * formatIBAN(null)                         // => ''
 */
export function formatIBAN(value: string | null | undefined): string {
  if (!value) return '';
  const clean = value.replace(/[^A-Za-z0-9]/g, '');
  return clean.replace(/(.{4})(?=.)/g, '$1 ');
}
