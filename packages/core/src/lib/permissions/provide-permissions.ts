import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

/**
 * Configures the Permissions module.
 *
 * Currently PermissionService is `providedIn: 'root'` and requires
 * no additional setup, so this factory returns an empty provider set.
 * It exists as a consistent entry-point for product `app.config.ts`
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
  return makeEnvironmentProviders([]);
}
