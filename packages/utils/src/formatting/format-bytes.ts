const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const;
const STEP = 1024;

/**
 * Formats a byte count into a human-readable size, e.g. `1258291 → "1.2 MB"`.
 *
 * Returns `''` for `null` / `undefined` / negative / `NaN` input so callers can
 * chain their own placeholder (`formatBytes(size) || '—'`) or let a template
 * `@if` collapse the surrounding segment. Whole byte values below 1 KB render
 * without a decimal (`512 → "512 B"`); larger units show one decimal with the
 * trailing `.0` trimmed (`2097152 → "2 MB"`, `1572864 → "1.5 MB"`). Uses a
 * `.`-decimal regardless of UI locale to match design mocks.
 *
 * TS-side core of `FfFileSizePipe`, so view-model builders can format sizes
 * without instantiating the pipe.
 *
 * @example
 * formatBytes(1258291)  // => '1.2 MB'
 * formatBytes(512)      // => '512 B'
 * formatBytes(null)     // => ''
 */
export function formatBytes(bytes: number | undefined | null): string {
  if (bytes === undefined || bytes === null || bytes < 0 || Number.isNaN(bytes)) return '';
  if (bytes < STEP) return `${bytes} B`;

  let size = bytes;
  let unit = 0;
  while (size >= STEP && unit < UNITS.length - 1) {
    size /= STEP;
    unit += 1;
  }
  const rounded = size.toFixed(1).replace(/\.0$/, '');
  return `${rounded} ${UNITS[unit]}`;
}
