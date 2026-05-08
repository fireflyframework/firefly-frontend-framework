import { inject, Pipe, PipeTransform } from '@angular/core';
import { formatCurrency } from '@fireflyframework/utils/formatting';

import { I18nService } from '../i18n.service';

/**
 * Format a number as a currency string using the active locale.
 *
 * @example
 * ```html
 * {{ 1234.5 | ffCurrency }}          <!-- 1.234,50 € (locale=es) -->
 * {{ 1234.5 | ffCurrency: 'USD' }}   <!-- 1.234,50 US$ (locale=es) -->
 * ```
 */
@Pipe({ name: 'ffCurrency', standalone: true, pure: false })
export class FfCurrencyPipe implements PipeTransform {
  private readonly i18n = inject(I18nService);

  transform(value: number | null | undefined, currency = 'EUR'): string {
    return formatCurrency(value, currency, this.i18n.currentLocale());
  }
}
