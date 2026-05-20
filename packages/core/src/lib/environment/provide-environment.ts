import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import type { EnvironmentConfig } from './environment.types';
import { ENVIRONMENT_CONFIG, EnvironmentService } from './environment.service';

/**
 * Configure the environment module.
 *
 * Registers `EnvironmentService` and optionally the `ENVIRONMENT_CONFIG`
 * token so the service loads the configuration on construction.
 *
 * Usage in app.config.ts:
 * ```ts
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideEnvironment({
 *       default: 'dev',
 *       environments: {
 *         dev: { apiBaseUrl: 'http://localhost:3000' },
 *         production: { apiBaseUrl: 'https://api.firefly.com' },
 *       },
 *     }),
 *   ],
 * };
 * ```
 *
 * Without config, the service starts with minimal defaults
 * (env `'dev'`, apiBaseUrl `'http://localhost'`).
 *
 * @param config - Optional environment configuration
 * @returns EnvironmentProviders to register in the application config
 */
export function provideEnvironment(
  config?: EnvironmentConfig,
): EnvironmentProviders {
  return makeEnvironmentProviders([
    EnvironmentService,
    ...(config
      ? [{ provide: ENVIRONMENT_CONFIG, useValue: config }]
      : []),
  ]);
}
