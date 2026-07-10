import { Pipe, PipeTransform, inject } from '@angular/core';

import { I18nService } from '../i18n.service';

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const MONTH_MS = 30 * DAY_MS;

/**
 * Formats an ISO timestamp as a localised relative-time string:
 *
 *  - `< 60 s` → "just now" (i18n key `common.relativeDate.justNow` — the
 *    consuming product must provide the translation)
 *  - `< 1 h`  → minutes via `Intl.RelativeTimeFormat`
 *  - `< 24 h` → hours
 *  - `< 30 d` → days
 *  - older    → absolute date via `Intl.DateTimeFormat`
 *
 * Falsy / unparsable input renders as the em-dash `—`. Overlaps with
 * {@link FfRelativeDayPipe} on purpose: that one buckets to Today/Yesterday for
 * listing columns, this one keeps sub-day granularity for card footers
 * ("updated 12 min ago").
 *
 * Locale and the "just now" copy resolve through {@link I18nService} — impure
 * so it re-formats on locale change.
 *
 * @example
 * ```html
 * <span>{{ project.updatedAt | ffRelativeTime }}</span>
 * ```
 */
@Pipe({ name: 'ffRelativeTime', standalone: true, pure: false })
export class FfRelativeTimePipe implements PipeTransform {
  private readonly i18n = inject(I18nService);

  transform(value: string | null | undefined, now: Date = new Date()): string {
    if (!value) return '—';
    const then = Date.parse(value);
    if (Number.isNaN(then)) return '—';

    const delta = now.getTime() - then;
    const locale = this.i18n.currentLocale() || 'es';

    if (delta < MINUTE_MS) return this.i18n.translate('common.relativeDate.justNow');

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto', style: 'short' });
    if (delta < HOUR_MS) return rtf.format(-Math.round(delta / MINUTE_MS), 'minute');
    if (delta < DAY_MS) return rtf.format(-Math.round(delta / HOUR_MS), 'hour');
    if (delta < MONTH_MS) return rtf.format(-Math.round(delta / DAY_MS), 'day');

    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(then));
  }
}
