import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  readLocalStorage,
  readStorage,
  writeLocalStorage,
  writeStorage,
} from './safe-storage';

/** Minimal in-memory Storage stand-in; `throwOn` simulates quota / private mode. */
function fakeStorage(throwOn?: 'get' | 'set'): Storage {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => {
      if (throwOn === 'get') throw new Error('denied');
      return map.get(key) ?? null;
    },
    setItem: (key: string, value: string) => {
      if (throwOn === 'set') throw new Error('quota');
      map.set(key, value);
    },
    removeItem: (key: string) => void map.delete(key),
    clear: () => map.clear(),
    key: () => null,
    get length() {
      return map.size;
    },
  } as Storage;
}

function stub(kind: 'localStorage' | 'sessionStorage', value: unknown): void {
  vi.stubGlobal(kind, value);
}

describe('safe storage', () => {
  beforeEach(() => {
    stub('localStorage', fakeStorage());
    stub('sessionStorage', fakeStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('round-trips a value through the requested lifetime', () => {
    writeStorage('local', 'k', 'v');
    expect(readStorage('local', 'k')).toBe('v');
    expect(readStorage('session', 'k')).toBeNull();
  });

  it('keeps the two lifetimes independent', () => {
    writeStorage('session', 'k', 'tab');
    expect(readStorage('session', 'k')).toBe('tab');
    expect(readStorage('local', 'k')).toBeNull();
  });

  it('pins the local helpers to localStorage', () => {
    writeLocalStorage('k', 'v');
    expect(readLocalStorage('k')).toBe('v');
    expect(readStorage('session', 'k')).toBeNull();
  });

  it('returns null instead of throwing when reads are denied', () => {
    stub('localStorage', fakeStorage('get'));
    expect(readStorage('local', 'k')).toBeNull();
  });

  it('swallows a write that exceeds quota', () => {
    stub('localStorage', fakeStorage('set'));
    expect(() => writeStorage('local', 'k', 'v')).not.toThrow();
  });

  it('degrades when storage is absent altogether (SSR)', () => {
    stub('localStorage', undefined);
    expect(readStorage('local', 'k')).toBeNull();
    expect(() => writeStorage('local', 'k', 'v')).not.toThrow();
  });
});
