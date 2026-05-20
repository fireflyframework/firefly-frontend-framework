import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MasterDataService } from './master-data.service';
import { MasterDataSource } from './master-data.types';
import { provideMasterData } from './provide-master-data';

describe('MasterDataService', () => {
  let service: MasterDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideMasterData([])] });
    service = TestBed.inject(MasterDataService);
  });

  describe('register', () => {
    it('should store sources without loading them', () => {
      const sources: MasterDataSource[] = [
        { key: 'cities', loader: () => Promise.resolve([{ id: 1, name: 'Madrid' }]) },
      ];

      service.register(sources);

      expect(service.state('cities')()).toBe('idle');
      expect(service.get('cities')()).toEqual([]);
    });
  });

  describe('loadAll', () => {
    it('should load all registered masters in parallel', async () => {
      const sources: MasterDataSource[] = [
        { key: 'cities', loader: () => Promise.resolve([{ id: 1, name: 'Madrid' }]) },
        { key: 'colors', loader: () => Promise.resolve([{ code: 'R', name: 'Red' }]) },
      ];

      service.register(sources);
      await service.loadAll();

      expect(service.get<{ id: number; name: string }>('cities')()).toEqual([{ id: 1, name: 'Madrid' }]);
      expect(service.get<{ code: string; name: string }>('colors')()).toEqual([{ code: 'R', name: 'Red' }]);
    });

    it('should mark failed masters as error without blocking others', async () => {
      const sources: MasterDataSource[] = [
        { key: 'cities', loader: () => Promise.resolve([{ id: 1, name: 'Madrid' }]) },
        { key: 'broken', loader: () => Promise.reject(new Error('fail')) },
      ];

      service.register(sources);
      await service.loadAll();

      expect(service.state('cities')()).toBe('loaded');
      expect(service.state('broken')()).toBe('error');
      expect(service.get('cities')()).toEqual([{ id: 1, name: 'Madrid' }]);
    });
  });

  describe('get', () => {
    it('should return data after loadAll', async () => {
      service.register([
        { key: 'items', loader: () => Promise.resolve([{ id: 1 }, { id: 2 }]) },
      ]);
      await service.loadAll();

      expect(service.get('items')()).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it('should return empty array for unknown key', () => {
      expect(service.get('unknown')()).toEqual([]);
    });
  });

  describe('state', () => {
    it('should transition idle -> loading -> loaded', async () => {
      const states: string[] = [];
      let resolveLoader!: (value: unknown[]) => void;
      const loader = () => new Promise<unknown[]>((resolve) => { resolveLoader = resolve; });

      service.register([{ key: 'cities', loader }]);
      states.push(service.state('cities')());

      const loadPromise = service.loadAll();
      states.push(service.state('cities')());

      resolveLoader([{ id: 1 }]);
      await loadPromise;
      states.push(service.state('cities')());

      expect(states).toEqual(['idle', 'loading', 'loaded']);
    });

    it('should transition idle -> loading -> error when loader fails', async () => {
      service.register([
        { key: 'broken', loader: () => Promise.reject(new Error('fail')) },
      ]);

      expect(service.state('broken')()).toBe('idle');
      await service.loadAll();
      expect(service.state('broken')()).toBe('error');
    });

    it('should return idle for unknown key', () => {
      expect(service.state('unknown')()).toBe('idle');
    });
  });

  describe('reload', () => {
    it('should reload a single master', async () => {
      let counter = 0;
      service.register([
        { key: 'items', loader: () => Promise.resolve([{ v: ++counter }]) },
      ]);

      await service.loadAll();
      expect(service.get('items')()).toEqual([{ v: 1 }]);

      await service.reload('items');
      expect(service.get('items')()).toEqual([{ v: 2 }]);
    });
  });

  describe('reloadAll', () => {
    it('should reload all registered masters', async () => {
      let counterA = 0;
      let counterB = 0;
      service.register([
        { key: 'a', loader: () => Promise.resolve([{ v: ++counterA }]) },
        { key: 'b', loader: () => Promise.resolve([{ v: ++counterB }]) },
      ]);

      await service.loadAll();
      expect(service.get('a')()).toEqual([{ v: 1 }]);
      expect(service.get('b')()).toEqual([{ v: 1 }]);

      await service.reloadAll();
      expect(service.get('a')()).toEqual([{ v: 2 }]);
      expect(service.get('b')()).toEqual([{ v: 2 }]);
    });
  });

  describe('ready', () => {
    it('should be true only when all masters are loaded', async () => {
      service.register([
        { key: 'cities', loader: () => Promise.resolve([]) },
        { key: 'colors', loader: () => Promise.resolve([]) },
      ]);

      expect(service.ready()).toBe(false);
      await service.loadAll();
      expect(service.ready()).toBe(true);
    });

    it('should be false when any master is in error', async () => {
      service.register([
        { key: 'cities', loader: () => Promise.resolve([]) },
        { key: 'broken', loader: () => Promise.reject(new Error('fail')) },
      ]);

      await service.loadAll();
      expect(service.ready()).toBe(false);
    });

    it('should be false when no masters are registered', () => {
      expect(service.ready()).toBe(false);
    });
  });

  describe('reactivity', () => {
    it('should update signal data when master is reloaded', async () => {
      let counter = 0;
      service.register([
        { key: 'items', loader: () => Promise.resolve([{ v: ++counter }]) },
      ]);

      const data = service.get('items');
      expect(data()).toEqual([]);

      await service.loadAll();
      expect(data()).toEqual([{ v: 1 }]);

      await service.reload('items');
      expect(data()).toEqual([{ v: 2 }]);
    });
  });

  describe('Observable support', () => {
    it('should support Observable-based loaders', async () => {
      service.register([
        { key: 'obs', loader: () => of([{ id: 1, name: 'Observable Data' }]) },
      ]);

      await service.loadAll();

      expect(service.get('obs')()).toEqual([{ id: 1, name: 'Observable Data' }]);
      expect(service.state('obs')()).toBe('loaded');
    });
  });
});
