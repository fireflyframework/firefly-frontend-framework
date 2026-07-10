import { Pipe, PipeTransform } from '@angular/core';
import { initialsFrom, type InitialsSource } from '@fireflyframework/utils/string';

/**
 * Up-to-two-letter initials for an avatar. Accepts either a display name
 * (`"María García"` → `"MG"`, `"Luis"` → `"L"`) or the richer
 * {@link InitialsSource} shape, which also derives from `firstName`/`lastName`
 * or the email local-part. Empty/nullish input renders the `fallback`
 * (default `'??'`).
 *
 * Wraps `initialsFrom` from `@fireflyframework/utils/string`, so TS-side
 * consumers and this pipe never drift.
 *
 * @example
 * ```html
 * <span class="avatar">{{ user.name | ffInitials }}</span>
 * <span class="avatar">{{ user | ffInitials: '·' }}</span>
 * ```
 */
@Pipe({ name: 'ffInitials', standalone: true })
export class FfInitialsPipe implements PipeTransform {
  transform(source: string | InitialsSource | null | undefined, fallback = '??'): string {
    if (source === null || source === undefined) return fallback;
    return initialsFrom(typeof source === 'string' ? { name: source } : source, fallback);
  }
}
