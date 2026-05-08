import { inject, Pipe, PipeTransform } from '@angular/core';

import { I18nService } from './i18n.service';

/**
 * Translate a key using the active locale.
 *
 * Wraps `I18nService.translate()` so that product templates
 * never import from `@jsverse/transloco` directly.
 *
 * @example
 * ```html
 * {{ 'common.greeting' | ffTranslate }}
 * {{ 'common.greeting' | ffTranslate: { name: 'World' } }}
 * ```
 */
@Pipe({ name: 'ffTranslate', standalone: true, pure: false })
export class FfTranslatePipe implements PipeTransform {
  private readonly i18n = inject(I18nService);

  transform(key: string, params?: Record<string, unknown>): string {
    return this.i18n.translate(key, params);
  }
}
