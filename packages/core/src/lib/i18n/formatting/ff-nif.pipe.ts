import { Pipe, PipeTransform } from '@angular/core';
import { formatNIF } from '@fireflyframework/utils/formatting';

/**
 * Format a Spanish NIF/NIE into visual format (XX.XXX.XXX-L).
 *
 * Locale-independent — always formats the same way.
 *
 * @example
 * ```html
 * {{ '12345678Z' | ffNif }}  <!-- 12.345.678-Z -->
 * {{ 'X1234567L' | ffNif }}  <!-- X-1.234.567-L -->
 * ```
 */
@Pipe({ name: 'ffNif', standalone: true })
export class FfNifPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return formatNIF(value);
  }
}
