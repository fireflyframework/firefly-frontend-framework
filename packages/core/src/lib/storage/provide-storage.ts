import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import type { StorageConfig } from './storage.types';
import { STORAGE_CONFIG, StorageService } from './storage.service';

/**
 * Configure the storage module.
 *
 * Registers `StorageService` and optionally the `STORAGE_CONFIG` token
 * so the service can read the prefix and default storage backend.
 *
 * Usage in app.config.ts:
 * ```ts
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideStorage({ prefix: 'myapp' }),
 *   ],
 * };
 * ```
 *
 * Without config, the service defaults to prefix `'ff'` and `localStorage`.
 *
 * @param config - Optional configuration for prefix and default storage type
 * @returns EnvironmentProviders to register in the application config
 */
export function provideStorage(
  config?: StorageConfig,
): EnvironmentProviders {
  return makeEnvironmentProviders([
    StorageService,
    ...(config
      ? [{ provide: STORAGE_CONFIG, useValue: config }]
      : []),
  ]);
}
