import { Pipe, PipeTransform } from '@angular/core';
import { formatBytes } from '@fireflyframework/utils/formatting';

/**
 * Formats a byte count into a human-readable size, e.g. `1258291 → "1.2 MB"`.
 * Wraps `formatBytes` from `@fireflyframework/utils/formatting`, where the
 * formatting semantics — including the `''` fallback that lets a template
 * collapse the surrounding segment — are documented.
 *
 * @example
 * ```html
 * @if (item.sizeBytes | ffFileSize; as size) { <span>{{ size }}</span> }
 * ```
 */
@Pipe({ name: 'ffFileSize', standalone: true })
export class FfFileSizePipe implements PipeTransform {
  transform(bytes: number | undefined | null): string {
    return formatBytes(bytes);
  }
}
