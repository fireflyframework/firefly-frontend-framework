import {
  EnvironmentProviders,
  inject,
  Injectable,
  InjectionToken,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  provideTransloco,
  Translation,
  TranslocoLoader,
  TranslocoService,
} from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';

import { I18nService } from './i18n.service';
import { I18nConfig, LocaleDefinition, SupportedLocale } from './i18n.types';

/**
 * Injection token for i18n configuration.
 * Provided via `provideI18n()`.
 */
export const I18N_CONFIG = new InjectionToken<I18nConfig>('I18N_CONFIG');

/**
 * Configure the i18n module.
 *
 * Registers `I18nService`, configures Transloco for translation loading,
 * and pre-loads the default (or persisted) locale's translations at
 * bootstrap via `provideAppInitializer()`.
 *
 * Requires `provideHttpClient()` to be registered in the application.
 *
 * @param config - I18n configuration
 * @returns EnvironmentProviders to register in the application config
 *
 * @example
 * ```ts
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideHttpClient(),
 *     provideI18n({
 *       defaultLocale: 'es',
 *       availableLocales: [
 *         { code: 'es', displayName: 'Español' },
 *         { code: 'en', displayName: 'English' },
 *       ],
 *       translationsPath: 'assets/i18n',
 *     }),
 *   ],
 * };
 * ```
 */
export function provideI18n(config: I18nConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    I18nService,
    { provide: I18N_CONFIG, useValue: config },
    ...provideTransloco({
      config: {
        availableLangs: extractLangCodes(config.availableLocales),
        defaultLang: config.defaultLocale,
        reRenderOnLangChange: config.reRenderOnLangChange ?? true,
        prodMode: config.production ?? false,
      },
      loader: TranslocoHttpTranslationLoader,
    }),
    provideAppInitializer(() => {
      const service = inject(I18nService);
      const i18nConfig = inject(I18N_CONFIG);
      const transloco = inject(TranslocoService);

      service.configure(i18nConfig);
      service.setLoading(true);

      const activeLang = transloco.getActiveLang();

      return firstValueFrom(transloco.load(activeLang))
        .then(() => {
          service.setLoading(false);
        })
        .catch((err: unknown) => {
          const message =
            err instanceof Error ? err.message : 'Failed to load translations';
          service.setError(message);
        });
    }),
  ]);
}

// ---------------------------------------------------------------------------
// HTTP Translation Loader (private)
// ---------------------------------------------------------------------------

@Injectable()
class TranslocoHttpTranslationLoader implements TranslocoLoader {
  private readonly http = inject(HttpClient);
  private readonly config = inject(I18N_CONFIG);

  getTranslation(lang: string): Observable<Translation> {
    const basePath = this.config.translationsPath ?? 'assets/i18n';
    return this.http.get<Translation>(`${basePath}/${lang}.json`);
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractLangCodes(
  locales: ReadonlyArray<SupportedLocale | LocaleDefinition>,
): string[] {
  return locales.map((l) => (typeof l === 'string' ? l : l.code));
}
