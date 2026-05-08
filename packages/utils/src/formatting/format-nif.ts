/**
 * Format a Spanish NIF/NIE into the visual format `XX.XXX.XXX-L`.
 *
 * Strips any existing separators before reformatting.
 * Returns the original value unformatted if it does not match the
 * expected 8-digit + 1-letter pattern (NIF) or X/Y/Z + 7-digit + letter (NIE).
 *
 * @example
 * formatNIF('12345678Z')   // => '12.345.678-Z'
 * formatNIF('X1234567L')   // => 'X-1.234.567-L'
 * formatNIF(null)           // => ''
 */
export function formatNIF(value: string | null | undefined): string {
  if (!value) return '';
  const clean = value.replace(/[\s.-]/g, '').toUpperCase();

  // NIF: 8 digits + 1 letter
  const nifMatch = clean.match(/^(\d{2})(\d{3})(\d{3})([A-Z])$/);
  if (nifMatch) {
    return `${nifMatch[1]}.${nifMatch[2]}.${nifMatch[3]}-${nifMatch[4]}`;
  }

  // NIE: X/Y/Z + 7 digits + 1 letter
  const nieMatch = clean.match(/^([XYZ])(\d{1})(\d{3})(\d{3})([A-Z])$/);
  if (nieMatch) {
    return `${nieMatch[1]}-${nieMatch[2]}.${nieMatch[3]}.${nieMatch[4]}-${nieMatch[5]}`;
  }

  return clean;
}
