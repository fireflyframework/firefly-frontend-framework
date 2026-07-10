/**
 * Converts a backend identifier (`identity_card`, `Invoice-2024`) into a
 * sentence-case human label (`Identity card`, `Invoice 2024`), collapsing
 * `_`/`-` runs into single spaces and upper-casing only the first letter.
 * Already-human strings pass through with just the first letter raised.
 *
 * Missing/empty input returns `emptyFallback` (default `''`; pass `'—'` for
 * table cells). Input that collapses to nothing after cleaning (e.g. `"___"`)
 * returns the raw string untouched.
 *
 * Sentence-case sibling of the Title-Case {@link humanizeColumnName} — pick
 * this one for free-standing labels, that one for column headers.
 *
 * @example
 * humanizeLabel('identity_card')  // => 'Identity card'
 * humanizeLabel(null, '—')        // => '—'
 */
export function humanizeLabel(raw: string | null | undefined, emptyFallback = ''): string {
  if (!raw) return emptyFallback;
  const cleaned = raw.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (!cleaned) return raw;
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

/**
 * Pretty-prints a backend field/column identifier as a Title-Case label
 * (`participaciones` → `Participaciones`, `cap_table-vigente` →
 * `Cap Table Vigente`). Empty/blank input collapses to `''`.
 *
 * Title-case sibling of the sentence-case {@link humanizeLabel} — pick this
 * one for table column headers / array-row labels.
 *
 * @example
 * humanizeColumnName('cap_table_vigente')  // => 'Cap Table Vigente'
 */
export function humanizeColumnName(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
