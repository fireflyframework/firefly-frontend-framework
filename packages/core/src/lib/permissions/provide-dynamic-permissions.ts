import {
  EnvironmentProviders,
  InjectionToken,
  makeEnvironmentProviders,
} from '@angular/core';
import { DynamicPermissionConfig } from './dynamic-permission.types';

/**
 * Token for the global dynamic permission guard configuration.
 *
 * Used by `dynamicPermissionGuard()` when called without inline config.
 * Provided via `provideDynamicPermissions()`.
 */
export const DYNAMIC_PERMISSION_CONFIG =
  new InjectionToken<DynamicPermissionConfig>('DYNAMIC_PERMISSION_CONFIG');

/**
 * Configures the dynamic permission guard globally.
 *
 * Usage in app.config.ts:
 * ```ts
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideDynamicPermissions({
 *       permissionMap: { '/admin/*': 'admin.access' },
 *       fallbackBehavior: 'deny',
 *     }),
 *   ],
 * };
 * ```
 *
 * @param config - Route-to-permission mapping and guard behavior options
 * @returns EnvironmentProviders to register in the application config
 */
export function provideDynamicPermissions(
  config: DynamicPermissionConfig,
): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: DYNAMIC_PERMISSION_CONFIG,
      useValue: config,
    },
  ]);
}
