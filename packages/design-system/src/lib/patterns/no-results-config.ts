import {
  EnvironmentProviders,
  InjectionToken,
  inject,
  makeEnvironmentProviders,
} from '@angular/core';
import type { FfNoResultsConfig } from '@fireflyframework/design-system-contract';

/**
 * Internal multi-provider token accumulating every no-results configuration
 * registered via {@link provideFfNoResultsConfig}. The {@link FF_NO_RESULTS_CONFIG}
 * factory resolves them to the last registration, mirroring the "later wins"
 * semantics of `provideFfIcons` (a feature route registering its own copy
 * overrides the app-wide default without needing to know its value).
 *
 * Not part of the public API — consumers interact only with
 * {@link provideFfNoResultsConfig} and {@link FF_NO_RESULTS_CONFIG}.
 */
const FF_NO_RESULTS_CONFIGS = new InjectionToken<readonly FfNoResultsConfig[]>(
  'FF_NO_RESULTS_CONFIGS'
);

/**
 * Injection token exposing the effective no-results / empty-state text shared
 * by `ff-data-table` and `ff-list`.
 *
 * Populated by one or more {@link provideFfNoResultsConfig} calls. Both
 * patterns inject it optionally: without any registration they fall back to
 * a built-in default, and either pattern's own `emptyTitle` /
 * `emptyDescription` inputs still win over this global value when set.
 *
 * @example
 * ```ts
 * const config = inject(FF_NO_RESULTS_CONFIG, { optional: true });
 * const title = config?.title ?? 'No results found';
 * ```
 */
export const FF_NO_RESULTS_CONFIG = new InjectionToken<FfNoResultsConfig>(
  'FF_NO_RESULTS_CONFIG'
);

/**
 * Registers the application-wide no-results / empty-state text for
 * `ff-data-table` and `ff-list`.
 *
 * Multi-registration pattern: each call adds its configuration to an
 * internal multi-provider (`FF_NO_RESULTS_CONFIGS`) and (re)provides
 * {@link FF_NO_RESULTS_CONFIG} with a factory that resolves to the most
 * recently registered value. Because the factory always reads *all*
 * accumulated registrations, calling `provideFfNoResultsConfig` multiple
 * times (e.g. a base copy in `app.config.ts` plus a feature-specific
 * override in a lazy route) is safe — the later registration wins.
 *
 * @param config No-results title (required) and optional supporting description.
 * @returns Environment providers to add to `bootstrapApplication` or a route.
 *
 * @example
 * ```ts
 * // app.config.ts — application-wide default
 * providers: [
 *   provideFfNoResultsConfig({ title: 'No records found' }),
 * ]
 *
 * // feature route — override for a specific screen
 * providers: [
 *   provideFfNoResultsConfig({
 *     title: 'No invoices yet',
 *     description: 'Invoices you issue will show up here.',
 *   }),
 * ]
 * ```
 */
export function provideFfNoResultsConfig(
  config: FfNoResultsConfig
): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: FF_NO_RESULTS_CONFIGS, useValue: config, multi: true },
    {
      provide: FF_NO_RESULTS_CONFIG,
      useFactory: (): FfNoResultsConfig => {
        const configs = inject(FF_NO_RESULTS_CONFIGS);
        return configs[configs.length - 1];
      },
    },
  ]);
}
