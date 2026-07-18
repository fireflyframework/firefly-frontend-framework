import {
  EnvironmentInjector,
  makeEnvironmentProviders,
  provideAppInitializer,
  inject,
  type EnvironmentProviders,
  type Type,
} from '@angular/core';

import { AlertConfirmService } from './alert-confirm.service';
import { setConfirmInjector } from './confirm.decorator';
import { ConfirmService } from './confirm.service';

/**
 * Configure the confirm-guard module.
 *
 * Binds the product's dialog-backed implementation to the abstract
 * {@link ConfirmService} token that `[ffConfirm]` injects, and captures the root
 * injector so the `@Confirm` decorator can reach the service from outside an
 * injection context.
 *
 * ```ts
 * export const appConfig: ApplicationConfig = {
 *   providers: [provideConfirm(HubModalConfirmService)],
 * };
 * ```
 *
 * @param implementation The product's concrete `ConfirmService`.
 */
export function provideConfirm(implementation: Type<ConfirmService>): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: ConfirmService, useClass: implementation },
    provideAppInitializer(() => {
      setConfirmInjector(inject(EnvironmentInjector));
    }),
  ]);
}

/**
 * Configure the confirm-guard module with the framework's default
 * {@link AlertConfirmService}: confirmations render as Promise-based dialogs
 * of core's headless `AlertService` — no product-specific `ConfirmService`
 * needed. Sugar for `provideConfirm(AlertConfirmService)`; products with
 * their own dialog mechanism keep using {@link provideConfirm}.
 *
 * Requires `provideAlerts()` in the application providers, plus a dialog
 * presenter in the UI layer (e.g. the design system's `ff-dialog-container`)
 * bound to `alerts.activeDialogs()` / `alerts.resolveDialog()`.
 *
 * ```ts
 * export const appConfig: ApplicationConfig = {
 *   providers: [provideAlerts(), provideAlertConfirm()],
 * };
 * ```
 */
export function provideAlertConfirm(): EnvironmentProviders {
  return provideConfirm(AlertConfirmService);
}
