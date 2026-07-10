/**
 * Formats the duration since `startedAt` into a short string suitable
 * for table cells and badges.
 *
 * - `< 60s` → `"42s"`
 * - `< 60m` → `"15m"`
 * - `< 24h` → `"3h"` or `"3h 12m"` when the minute remainder is non-zero
 * - `>= 24h` → `"2d"` or `"2d 5h"` when the hour remainder is non-zero
 *
 * Returns `'—'` when the input is missing or unparseable so callers
 * can drop it straight into a template without a guard.
 *
 * The second argument exists for deterministic testing — production
 * callers should leave it at the default and let the function read
 * the current clock.
 */
export function formatElapsed(
  startedAt: string | undefined | null,
  now: number = Date.now(),
): string {
  if (!startedAt) return '—';
  const t = Date.parse(startedAt);
  if (Number.isNaN(t)) return '—';
  const seconds = Math.max(0, Math.floor((now - t) / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remMin = minutes - hours * 60;
  if (hours < 24) return remMin === 0 ? `${hours}h` : `${hours}h ${remMin}m`;
  const days = Math.floor(hours / 24);
  const remHours = hours - days * 24;
  return remHours === 0 ? `${days}d` : `${days}d ${remHours}h`;
}
