import { Pipe, PipeTransform } from '@angular/core';

/**
 * Returns the last `len` characters of an id-like string. When the
 * id is shorter than `len`, returns the id verbatim. Falsy inputs
 * become the em-dash placeholder `'—'`.
 *
 * @example
 * ```html
 * <code>{{ row.id | ffShortId }}</code>          <!-- last 8 chars -->
 * <code>{{ row.id | ffShortId : 12 }}</code>     <!-- last 12 chars -->
 * ```
 */
@Pipe({ name: 'ffShortId', standalone: true })
export class FfShortIdPipe implements PipeTransform {
  transform(value: string | undefined | null, len = 8): string {
    if (!value) return '—';
    return value.length > len ? value.slice(-len) : value;
  }
}
