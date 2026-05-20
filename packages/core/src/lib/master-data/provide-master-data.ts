import {
  EnvironmentProviders,
  inject,
  InjectionToken,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { MasterDataService } from './master-data.service';
import { MasterDataSource } from './master-data.types';

/** @internal Token to hold the master-data sources for the initializer. */
const MASTER_DATA_SOURCES = new InjectionToken<MasterDataSource[]>(
  'MASTER_DATA_SOURCES'
);

/**
 * Configures the MasterData module with the given sources.
 *
 * Registers the sources into `MasterDataService` and sets up an
 * `APP_INITIALIZER` that blocks rendering until all masters are
 * loaded (or failed — individual failures do not prevent startup).
 *
 * Usage in app.config.ts:
 * ```ts
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideMasterData([
 *       { key: 'cities', loader: () => fetch('/api/cities').then(r => r.json()) },
 *       { key: 'colors', loader: () => fetch('/api/colors').then(r => r.json()) },
 *     ]),
 *   ],
 * };
 * ```
 */
export function provideMasterData(
  sources: MasterDataSource[]
): EnvironmentProviders {
  return makeEnvironmentProviders([
    MasterDataService,
    {
      provide: MASTER_DATA_SOURCES,
      useValue: sources,
    },
    provideAppInitializer(() => {
      const service = inject(MasterDataService);
      const registeredSources = inject(MASTER_DATA_SOURCES);
      service.register(registeredSources);
      return service.loadAll();
    }),
  ]);
}
