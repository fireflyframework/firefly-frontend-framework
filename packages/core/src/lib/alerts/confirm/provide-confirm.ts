import {
  EnvironmentInjector,
  makeEnvironmentProviders,
  provideAppInitializer,
  inject,
  type EnvironmentProviders,
  type Type,
} from '@angular/core';

import { setConfirmInjector } from './confirm.decorator';
import { ConfirmService } from './confirm.service';

/**
 * Bind a product's own dialog-backed implementation to the legacy
 * {@link ConfirmService} port. `@Confirm` and `[ffConfirm]` prefer it over
 * their default `AlertService.confirm(options)` path, so an existing custom
 * dialog integration keeps working unchanged.
 *
 * Also captures the root injector so the `@Confirm` decorator can reach the
 * service from outside an injection context.
 *
 * ```ts
 * export const appConfig: ApplicationConfig = {
 *   providers: [provideConfirm(HubModalConfirmService)],
 * };
 * ```
 *
 * @deprecated The confirm lives in `AlertService` — this port is removed in
 * the next minor. The presentation swap point is the dialog container, not the
 * service: products with their own implementation migrate to rendering
 * `AlertService.activeDialogs()` with their own container and resolving via
 * `resolveDialog()`. With `provideAlerts()` alone, `@Confirm` / `[ffConfirm]`
 * already work through `AlertService.confirm(options)`.
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
