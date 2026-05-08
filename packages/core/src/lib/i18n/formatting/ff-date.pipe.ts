import { inject, Pipe, PipeTransform } from '@angular/core';
import { formatDate } from '@fireflyframework/utils/formatting';

import { I18nService } from '../i18n.service';

/**
 * Format a date value using the active locale.
 *
 * @example
 * ```html
 * {{ myDate | ffDate }}              <!-- 25/12/2025 (locale=es, short) -->
 * {{ myDate | ffDate: 'long' }}      <!-- 25 de diciembre de 2025 -->
 * ```
 */
@Pipe({ name: 'ffDate', standalone: true, pure: false })
export class FfDatePipe implements PipeTransform {
  private readonly i18n = inject(I18nService);

  transform(
    value: Date | string | null | undefined,
    format: 'short' | 'medium' | 'long' | 'full' = 'short',
  ): string {
    return formatDate(value, format, this.i18n.currentLocale());
  }
}
