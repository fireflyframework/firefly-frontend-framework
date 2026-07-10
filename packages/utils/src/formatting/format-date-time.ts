/**
 * Formats an ISO timestamp as a short locale-aware date-time pair:
 * `2026-05-27T14:32:00Z` → `27 may 2026 · 14:32` (es) /
 * `May 27, 2026 · 14:32` (en).
 *
 * The abbreviated-month dot some locales emit (`may.`) is stripped so the
 * label matches the design mock. Returns `null` when the input is missing or
 * unparsable so callers can decide their own placeholder (`'—'`, raw value,
 * hidden row, …).
 *
 * Callers inside Angular should resolve `locale` through
 * `I18nService.currentLocale()` (see `FfDateTimePipe`) — never hard-code it.
 *
 * @example
 * formatDateTime('2026-05-27T14:32:00Z', 'es')  // => '27 may 2026 · 14:32'
 * formatDateTime(null, 'es')                    // => null
 */
export function formatDateTime(iso: string | null | undefined, locale: string): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const datePart = date
    .toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })
    .replace('.', '');
  const timePart = date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return `${datePart} · ${timePart}`;
}
