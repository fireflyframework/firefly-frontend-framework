import { Pipe, PipeTransform, inject } from '@angular/core';
import { formatDateTime } from '@fireflyframework/utils/formatting';

import { I18nService } from '../i18n.service';

/**
 * Formats an ISO timestamp as a short date-time label (`27 may 2026 · 14:32`),
 * resolving the locale through {@link I18nService} rather than hard-coding it.
 * Falsy / unparsable inputs render as the em-dash `—`.
 *
 * Impure so it re-formats when the active locale changes (mirrors
 * `FfRelativeDayPipe`); the per-cell cost is negligible for card meta rows.
 *
 * @example
 * ```html
 * <dd>{{ batch().createdAt | ffDateTime }}</dd>
 * ```
 */
@Pipe({ name: 'ffDateTime', standalone: true, pure: false })
export class FfDateTimePipe implements PipeTransform {
  private readonly i18n = inject(I18nService);

  transform(value: string | null | undefined): string {
    const locale = this.i18n.currentLocale() || 'es';
    return formatDateTime(value, locale) ?? '—';
  }
}
