import { TestBed } from '@angular/core/testing';
import { StorageService, STORAGE_CONFIG } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [StorageService],
    });
    service = TestBed.inject(StorageService);
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  // --- get / set ---

  describe('set and get', () => {
    it('should store and retrieve a string', () => {
      service.set('name', 'Alice');
      expect(service.get<string>('name')).toBe('Alice');
    });

    it('should store and retrieve an object', () => {
      const obj = { theme: 'dark', fontSize: 14 };
      service.set('prefs', obj);
      expect(service.get('prefs')).toEqual(obj);
    });

    it('should store and retrieve an array', () => {
      service.set('items', [1, 2, 3]);
      expect(service.get('items')).toEqual([1, 2, 3]);
    });

    it('should store and retrieve a number', () => {
      service.set('count', 42);
      expect(service.get<number>('count')).toBe(42);
    });

    it('should store and retrieve a boolean', () => {
      service.set('enabled', true);
      expect(service.get<boolean>('enabled')).toBe(true);
    });

    it('should return null for a non-existent key', () => {
      expect(service.get('missing')).toBeNull();
    });

    it('should return null for invalid JSON in storage', () => {
      localStorage.setItem('ff.bad', '{invalid');
      expect(service.get('bad')).toBeNull();
    });
  });

  // --- storage type ---

  describe('storage type', () => {
    it('should default to localStorage', () => {
      service.set('key', 'value');
      expect(localStorage.getItem('ff.key')).toBe('"value"');
      expect(sessionStorage.getItem('ff.key')).toBeNull();
    });

    it('should use sessionStorage when specified', () => {
      service.set('key', 'value', 'session');
      expect(sessionStorage.getItem('ff.key')).toBe('"value"');
      expect(localStorage.getItem('ff.key')).toBeNull();
    });

    it('should get from sessionStorage when specified', () => {
      service.set('key', 'session-val', 'session');
      expect(service.get('key', 'session')).toBe('session-val');
      expect(service.get('key', 'local')).toBeNull();
    });
  });

  // --- namespace ---

  describe('namespace prefix', () => {
    it('should prefix keys with ff. by default', () => {
      service.set('test', 123);
      expect(localStorage.getItem('ff.test')).toBe('123');
    });

    it('should not affect keys without the prefix', () => {
      localStorage.setItem('other.key', '"external"');
      expect(service.get('key')).toBeNull();
    });
  });

  // --- remove ---

  describe('remove', () => {
    it('should remove a key', () => {
      service.set('temp', 'data');
      service.remove('temp');
      expect(service.get('temp')).toBeNull();
      expect(localStorage.getItem('ff.temp')).toBeNull();
    });
  });

  // --- clear ---

  describe('clear', () => {
    it('should clear all keys with the prefix', () => {
      service.set('a', 1);
      service.set('b', 2);
      service.clear();
      expect(service.get('a')).toBeNull();
      expect(service.get('b')).toBeNull();
    });

    it('should not clear keys without the prefix', () => {
      localStorage.setItem('external', 'keep');
      service.set('internal', 'remove');
      service.clear();
      expect(localStorage.getItem('external')).toBe('keep');
    });

    it('should clear only the specified storage type', () => {
      service.set('local-key', 'val');
      service.set('session-key', 'val', 'session');
      service.clear('local');
      expect(service.get('local-key')).toBeNull();
      expect(service.get('session-key', 'session')).toBe('val');
    });
  });

  // --- setWithTTL ---

  describe('setWithTTL', () => {
    it('should retrieve a value before TTL expires', () => {
      service.setWithTTL('cache', 'fresh', 60_000);
      expect(service.get('cache')).toBe('fresh');
    });

    it('should return null after TTL expires', () => {
      // Set with TTL already expired (0ms)
      vi.spyOn(Date, 'now')
        .mockReturnValueOnce(1000) // setWithTTL call
        .mockReturnValueOnce(2001); // get call (1001ms later, TTL was 1000ms)
      service.setWithTTL('cache', 'stale', 1000);
      expect(service.get('cache')).toBeNull();
      vi.restoreAllMocks();
    });

    it('should auto-remove expired entry from storage on get', () => {
      vi.spyOn(Date, 'now')
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(5000);
      service.setWithTTL('temp', 'data', 1000);
      service.get('temp'); // triggers cleanup
      vi.restoreAllMocks();
      // Verify the raw entry was removed
      expect(localStorage.getItem('ff.temp')).toBeNull();
    });
  });

  // --- has ---

  describe('has', () => {
    it('should return true for an existing key', () => {
      service.set('exists', 'yes');
      expect(service.has('exists')).toBe(true);
    });

    it('should return false for a non-existent key', () => {
      expect(service.has('missing')).toBe(false);
    });

    it('should return false for an expired TTL key', () => {
      vi.spyOn(Date, 'now')
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(5000);
      service.setWithTTL('ttl-key', 'val', 1000);
      expect(service.has('ttl-key')).toBe(false);
      vi.restoreAllMocks();
    });
  });

  // --- keys ---

  describe('keys', () => {
    it('should return keys without the prefix', () => {
      service.set('alpha', 1);
      service.set('beta', 2);
      expect(service.keys().sort()).toEqual(['alpha', 'beta']);
    });

    it('should not include keys from other prefixes', () => {
      localStorage.setItem('other.key', 'val');
      service.set('mine', 'val');
      expect(service.keys()).toEqual(['mine']);
    });

    it('should return empty array when no keys exist', () => {
      expect(service.keys()).toEqual([]);
    });
  });
});

describe('StorageService with custom config', () => {
  let service: StorageService;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        StorageService,
        { provide: STORAGE_CONFIG, useValue: { prefix: 'myapp', defaultStorage: 'session' } },
      ],
    });
    service = TestBed.inject(StorageService);
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should use custom prefix', () => {
    service.set('key', 'val');
    expect(sessionStorage.getItem('myapp.key')).toBe('"val"');
    expect(localStorage.getItem('myapp.key')).toBeNull();
  });

  it('should default to sessionStorage', () => {
    service.set('data', 'test');
    expect(service.get('data')).toBe('test');
    expect(sessionStorage.getItem('myapp.data')).toBe('"test"');
  });

  it('should still allow explicit localStorage override', () => {
    service.set('local-data', 'test', 'local');
    expect(localStorage.getItem('myapp.local-data')).toBe('"test"');
  });
});
