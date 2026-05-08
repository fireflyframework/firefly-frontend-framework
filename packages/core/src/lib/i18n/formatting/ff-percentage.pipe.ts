import { inject, Pipe, PipeTransform } from '@angular/core';
import { formatPercentage } from '@fireflyframework/utils/formatting';

import { I18nService } from '../i18n.service';

/**
 * Format a fraction as a percentage string using the active locale.
 *
 * The input is expected as a fraction (e.g. 0.15 for 15%).
 *
 * @example
 * ```html
 * {{ 0.1534 | ffPercentage }}        <!-- 15,34 % (locale=es) -->
 * {{ 0.1534 | ffPercentage: 1 }}     <!-- 15,3 % (locale=es) -->
 * ```
 */
@Pipe({ name: 'ffPercentage', standalone: true, pure: false })
export class FfPercentagePipe implements PipeTransform {
  private readonly i18n = inject(I18nService);

  transform(value: number | null | undefined, decimals = 2): string {
    return formatPercentage(value, this.i18n.currentLocale(), decimals);
  }
}
