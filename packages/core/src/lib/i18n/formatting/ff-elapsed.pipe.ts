import { Pipe, PipeTransform } from '@angular/core';
import { formatElapsed } from '@fireflyframework/utils/formatting';

/**
 * Formats the duration since `startedAt` into a short human string
 * (`42s` / `15m` / `3h 12m` / `2d 5h`). Wraps `formatElapsed` from
 * `@fireflyframework/utils/formatting`.
 *
 * Pure pipe: Angular memoises the result per input — when the source
 * field on the row does not change, the cell does not re-render. The
 * "now" value is captured at evaluation time; once the table refresh
 * triggers change detection, the pipe re-evaluates and the output
 * updates.
 *
 * @example
 * ```html
 * <td>{{ row.startedAt | ffElapsed }}</td>
 * ```
 */
@Pipe({ name: 'ffElapsed', standalone: true })
export class FfElapsedPipe implements PipeTransform {
  transform(value: string | undefined | null): string {
    return formatElapsed(value);
  }
}
