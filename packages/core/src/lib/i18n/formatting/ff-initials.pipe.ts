import { Pipe, PipeTransform } from '@angular/core';

/**
 * Up-to-two-letter initials from a display name. `"María García"` → `"MG"`,
 * `"Luis"` → `"L"`, empty/nullish → the `fallback` (default `'??'`).
 *
 * @example
 * ```html
 * <span class="avatar">{{ user.name | ffInitials }}</span>
 * <span class="avatar">{{ user.name | ffInitials: '·' }}</span>
 * ```
 */
@Pipe({ name: 'ffInitials', standalone: true })
export class FfInitialsPipe implements PipeTransform {
  transform(name: string | null | undefined, fallback = '??'): string {
    const cleaned = (name ?? '').trim();
    if (!cleaned) return fallback;
    return cleaned
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }
}
