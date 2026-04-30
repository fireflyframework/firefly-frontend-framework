import { ApplicationInitStatus } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MasterDataService } from './master-data.service';
import { MasterDataSource } from './master-data.types';
import { provideMasterData } from './provide-master-data';

describe('provideMasterData', () => {
  it('should return valid EnvironmentProviders', () => {
    const sources: MasterDataSource[] = [
      { key: 'cities', loader: () => Promise.resolve([]) },
    ];

    const providers = provideMasterData(sources);
    expect(providers).toBeDefined();
  });

  it('should register sources and call loadAll via APP_INITIALIZER', async () => {
    const sources: MasterDataSource[] = [
      { key: 'cities', loader: () => Promise.resolve([{ id: 1, name: 'Madrid' }]) },
      { key: 'colors', loader: () => Promise.resolve([{ code: 'R', name: 'Red' }]) },
    ];

    TestBed.configureTestingModule({
      providers: [provideMasterData(sources)],
    });

    const initStatus = TestBed.inject(ApplicationInitStatus);
    await initStatus.donePromise;

    const service = TestBed.inject(MasterDataService);
    expect(service.get('cities')()).toEqual([{ id: 1, name: 'Madrid' }]);
    expect(service.get('colors')()).toEqual([{ code: 'R', name: 'Red' }]);
    expect(service.state('cities')()).toBe('loaded');
    expect(service.state('colors')()).toBe('loaded');
    expect(service.ready()).toBe(true);
  });

  it('should not block startup when loaders fail', async () => {
    const sources: MasterDataSource[] = [
      { key: 'ok', loader: () => Promise.resolve([{ id: 1 }]) },
      { key: 'fail', loader: () => Promise.reject(new Error('network error')) },
    ];

    TestBed.configureTestingModule({
      providers: [provideMasterData(sources)],
    });

    const initStatus = TestBed.inject(ApplicationInitStatus);
    await initStatus.donePromise;

    const service = TestBed.inject(MasterDataService);
    expect(service.state('ok')()).toBe('loaded');
    expect(service.state('fail')()).toBe('error');
    expect(service.ready()).toBe(false);
  });
});
