import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { PermissionService } from './permission.service';

/**
 * Configures the Permissions module.
 *
 * Registers `PermissionService` and serves as a consistent entry-point for product `app.config.ts`
 * and as an extension point for future configuration (e.g. default
 * redirect route, permission loaders).
 *
 * Usage in app.config.ts:
 * ```ts
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     providePermissions(),
 *   ],
 * };
 * ```
 */
export function providePermissions(): EnvironmentProviders {
  return makeEnvironmentProviders([PermissionService]);
}
