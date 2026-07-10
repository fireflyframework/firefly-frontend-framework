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
