import { Observable } from 'rxjs';

export interface MasterDataSource<T = unknown> {
  key: string;
  loader: () => Promise<T[]> | Observable<T[]>;
  ttl?: number;
}

export type MasterDataState = 'idle' | 'loading' | 'loaded' | 'error';
