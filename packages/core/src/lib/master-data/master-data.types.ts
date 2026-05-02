import { Observable } from 'rxjs';

/**
 * Definition of a master-data source registered via `provideMasterData()`.
 *
 * @typeParam T - Type of the items returned by the loader
 */
export interface MasterDataSource<T = unknown> {
  /** Unique key used to query this master via `MasterDataService.get(key)`. */
  key: string;
  /** Async loader function that fetches the master data. */
  loader: () => Promise<T[]> | Observable<T[]>;
  /** Time-to-live in ms. When elapsed, state reverts to `idle` for lazy reload. */
  ttl?: number;
}

/** Loading lifecycle state of a registered master-data source. */
export type MasterDataState = 'idle' | 'loading' | 'loaded' | 'error';
