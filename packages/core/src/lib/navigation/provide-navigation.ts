import {
  EnvironmentProviders,
  inject,
  InjectionToken,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { NavigationService } from './navigation.service';
import { NavigationConfig } from './navigation.types';

/** @internal Token to hold the navigation config for the initializer. */
const NAVIGATION_CONFIG = new InjectionToken<NavigationConfig>(
  'NAVIGATION_CONFIG'
);

/**
 * Configures the Navigation module with the given items.
 *
 * Registers the navigation tree into `NavigationService` via a
 * synchronous `APP_INITIALIZER`. Unlike `provideMasterData`, this
 * does not block rendering — it simply sets the initial config.
 *
 * Usage in app.config.ts:
 * ```ts
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideNavigation({
 *       items: [
 *         { id: 'home', label: 'Home', route: '/' },
 *         {
 *           id: 'catalog', label: 'Catalog',
 *           requiredPermission: 'catalog.read',
 *           children: [
 *             { id: 'products', label: 'Products', route: '/catalog/products' },
 *           ],
 *         },
 *       ],
 *     }),
 *   ],
 * };
 * ```
 */
export function provideNavigation(
  config: NavigationConfig
): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: NAVIGATION_CONFIG,
      useValue: config,
    },
    provideAppInitializer(() => {
      const service = inject(NavigationService);
      const navConfig = inject(NAVIGATION_CONFIG);
      service.configure(navConfig);
    }),
  ]);
}
