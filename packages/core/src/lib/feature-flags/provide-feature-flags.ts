import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import type { FeatureFlagConfig } from './feature-flag.types';
import { FEATURE_FLAG_CONFIG } from './feature-flag.service';

/**
 * Configure the feature-flags module.
 *
 * Registers the `FEATURE_FLAG_CONFIG` token so that `FeatureFlagService`
 * can read the initial configuration (source, defaults, endpoint URL, etc.).
 *
 * Usage in app.config.ts:
 * ```ts
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideFeatureFlags({
 *       source: 'static',
 *       defaults: { 'new-dashboard': true },
 *     }),
 *   ],
 * };
 * ```
 *
 * @param config - Optional configuration. Defaults to static source with no flags.
 * @returns EnvironmentProviders to register in the application config
 */
export function provideFeatureFlags(
  config?: FeatureFlagConfig,
): EnvironmentProviders {
  return makeEnvironmentProviders([
    ...(config
      ? [{ provide: FEATURE_FLAG_CONFIG, useValue: config }]
      : []),
  ]);
}
