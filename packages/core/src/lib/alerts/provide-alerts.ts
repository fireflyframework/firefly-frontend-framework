import {
  EnvironmentProviders,
  InjectionToken,
  makeEnvironmentProviders,
} from '@angular/core';
import { AlertConfig } from './alert.types';

/**
 * Injection token for optional alert configuration.
 *
 * Provided via `provideAlerts()`. If not provided, AlertService
 * uses built-in defaults (toast 3000ms, error 5000ms, max 5 toasts, max 3 banners).
 */
export const ALERT_CONFIG = new InjectionToken<AlertConfig>('ALERT_CONFIG');

/**
 * Configure the alerts module with custom defaults.
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
    ...(config ? [{ provide: ALERT_CONFIG, useValue: config }] : []),
  ]);
}
