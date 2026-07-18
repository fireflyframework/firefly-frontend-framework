import {
  EnvironmentInjector,
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { ALERT_CONFIG } from './alert-config.token';
import { AlertConfig } from './alert.types';
import { AlertService } from './alert.service';
import { setConfirmInjector } from './confirm/confirm.decorator';

export { ALERT_CONFIG } from './alert-config.token';

/**
 * Configure the alerts module with custom defaults.
 *
 * Also captures the root injector so the `@Confirm` method decorator can reach
 * `AlertService` (its default confirm path) from outside an injection context —
 * with `provideAlerts()` alone, `@Confirm` and `[ffConfirm]` work out of the box.
 *
 * Usage in app.config.ts:
 * ```ts
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideAlerts({
 *       defaultToastDuration: 5000,
 *       maxVisibleToasts: 3,
 *       defaultToastPosition: 'bottom-left',
 *     }),
 *   ],
 * };
 * ```
 *
 * @param config - Partial configuration to override defaults
 * @returns EnvironmentProviders to register in the application config
 */
export function provideAlerts(
  config?: AlertConfig,
): EnvironmentProviders {
  return makeEnvironmentProviders([
    AlertService,
    provideAppInitializer(() => {
      setConfirmInjector(inject(EnvironmentInjector));
    }),
    ...(config ? [{ provide: ALERT_CONFIG, useValue: config }] : []),
  ]);
}
