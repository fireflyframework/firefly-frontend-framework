import {
  EnvironmentProviders,
  makeEnvironmentProviders,
} from '@angular/core';

import {
  FF_TOAST_CONFIG,
  FF_TOAST_DEFAULT_CONFIG,
  FfToastGlobalConfig,
  FfToastService,
} from './toast.service';

/**
 * Registers `FfToastService` together with its global configuration.
 *
 * Required by every application using the imperative toast API. No markup is
 * needed on the consumer side: the service creates its own overlay container
 * and appends it to `document.body` the first time a toast is shown.
 *
 * @param config Partial global defaults; unset fields keep the built-in
 *   defaults (`timeout: 4000`, `position: 'top-right'`, `dismissible: true`,
 *   `progressBar: false`).
 * @returns Environment providers to add to `bootstrapApplication` or a route.
 *
 * @example
 * ```ts
 * // app.config.ts
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideFfToasts(),
 *   ],
 * };
 *
 * // Or with global overrides:
 * provideFfToasts({ position: 'bottom-center', timeout: 6000 });
 * ```
 */
export function provideFfToasts(
  config: Partial<FfToastGlobalConfig> = {}
): EnvironmentProviders {
  return makeEnvironmentProviders([
    FfToastService,
    {
      provide: FF_TOAST_CONFIG,
      useValue: { ...FF_TOAST_DEFAULT_CONFIG, ...config },
    },
  ]);
}
