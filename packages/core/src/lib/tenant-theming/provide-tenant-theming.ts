import {
  EnvironmentProviders,
  inject,
  InjectionToken,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { TenantThemeService } from './tenant-theme.service';
import { TenantThemingConfig } from './tenant-theme.types';

/**
 * Injection token for tenant-theming configuration.
 * Provided via `provideTenantTheming()`.
 */
export const TENANT_THEMING_CONFIG = new InjectionToken<TenantThemingConfig>(
  'TENANT_THEMING_CONFIG'
);

/**
 * Configure the tenant-theming module.
 *
 * Registers `TenantThemeService`, applies initial color mode,
 * and runs the branding loader at application bootstrap via
 * `provideAppInitializer()`. If the loader throws, the app
 * continues with Design System defaults.
 *
 * @param config - Theming configuration with a loader function
 * @returns EnvironmentProviders to register in the application config
 *
 * @example
 * ```ts
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideTenantTheming({
 *       loader: () => fetch('/api/branding/default').then(r => r.json()),
 *       defaultColorMode: 'system',
 *     }),
 *   ],
 * };
 * ```
 */
export function provideTenantTheming(
  config: TenantThemingConfig,
): EnvironmentProviders {
  return makeEnvironmentProviders([
    TenantThemeService,
    { provide: TENANT_THEMING_CONFIG, useValue: config },
    provideAppInitializer(() => {
      const service = inject(TenantThemeService);
      const themingConfig = inject(TENANT_THEMING_CONFIG);

      service.configure(
        themingConfig.storageKey ?? 'ff-color-mode',
        themingConfig.defaultColorMode ?? 'system',
      );

      service.setLoading(true);

      return themingConfig
        .loader()
        .then((branding) => {
          service.loadBranding(branding);
          service.setLoading(false);
        })
        .catch((err: unknown) => {
          const message =
            err instanceof Error ? err.message : 'Failed to load branding';
          service.setError(message);
        });
    }),
  ]);
}
