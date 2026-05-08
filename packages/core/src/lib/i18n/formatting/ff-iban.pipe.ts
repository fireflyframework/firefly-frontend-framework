import { Pipe, PipeTransform } from '@angular/core';
import { formatIBAN } from '@fireflyframework/utils/formatting';

/**
 * Format an IBAN string into groups of 4 characters.
 *
 * Locale-independent — always formats the same way.
 *
 * @example
 * ```html
 * {{ 'ES7921000813610123456789' | ffIban }}  <!-- ES79 2100 0813 6101 2345 6789 -->
 * ```
 */
@Pipe({ name: 'ffIban', standalone: true })
export class FfIbanPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return formatIBAN(value);
  }
}
