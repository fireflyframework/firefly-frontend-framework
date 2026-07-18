import { InjectionToken } from '@angular/core';
import { AlertConfig } from './alert.types';

/**
 * Injection token for optional alert configuration.
 *
 * Provided via `provideAlerts()`. If not provided, AlertService
 * uses built-in defaults (toast 3000ms, error 5000ms, max 5 toasts, max 3 banners).
 *
 * Lives in its own leaf module (instead of `provide-alerts.ts`) so that
 * `alert.service.ts` never imports `provide-alerts.ts` — `provide-alerts.ts`
 * wires the `@Confirm` decorator (confirm/confirm.decorator.ts), which in turn
 * uses `AlertService`; keeping this token here breaks that import cycle.
 */
export const ALERT_CONFIG = new InjectionToken<AlertConfig>('ALERT_CONFIG');
