import { Pipe, PipeTransform, inject } from '@angular/core';

import { I18nService } from '../i18n.service';

const DAY_MS = 86_400_000;

/**
 * Formats an ISO timestamp as a relative day label:
 * `Today` / `Yesterday` (resolved through {@link I18nService}, keys
 * `common.relativeDate.today` / `…yesterday` — the consuming product
 * must provide both translations) or a short, locale-aware date for
 * anything older (`Intl.DateTimeFormat(currentLocale, { day, month:'short' })`).
 * Falsy / unparsable inputs become the em-dash `—`.
 *
 * Generic and reusable — no domain coupling. Impure so it re-resolves when
 * the active locale changes (the today/yesterday text and the month name both
 * follow `I18nService.currentLocale()`); the per-cell cost is negligible for
 * table-sized lists.
 *
 * @example
 * ```html
 * <span>{{ item.startedAt | ffRelativeDay }}</span>
 * ```
 */
@Pipe({ name: 'ffRelativeDay', standalone: true, pure: false })
export class FfRelativeDayPipe implements PipeTransform {
  private readonly i18n = inject(I18nService);

  transform(value: string | undefined | null): string {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';

    const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const diffDays = Math.round((startOfDay(new Date()) - startOfDay(date)) / DAY_MS);

    if (diffDays === 0) return this.i18n.translate('common.relativeDate.today');
    if (diffDays === 1) return this.i18n.translate('common.relativeDate.yesterday');

    const locale = this.i18n.currentLocale() || 'es';
    return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(date);
  }
}
