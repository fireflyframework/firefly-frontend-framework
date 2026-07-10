import { TestBed } from '@angular/core/testing';

import { persistedSignal } from './persisted-signal';

type Sort = 'recent' | 'oldest';
const isSort = (raw: string): raw is Sort => raw === 'recent' || raw === 'oldest';

/** Creates the signal inside an injection context, as the `effect` requires. */
const create = (key: string, storage?: 'local' | 'session') =>
  TestBed.runInInjectionContext(() =>
    persistedSignal<Sort>(key, { fallback: 'recent', isValid: isSort, storage }),
  );

describe('persistedSignal', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it('seeds from the fallback when nothing is stored', () => {
    expect(create('k')()).toBe('recent');
  });

  it('seeds synchronously from a previously stored value', () => {
    sessionStorage.setItem('k', 'oldest');
    expect(create('k')()).toBe('oldest');
  });

  it('ignores a stored value that fails validation', () => {
    sessionStorage.setItem('k', 'tampered');
    expect(create('k')()).toBe('recent');
  });

  it('mirrors every change back to storage', () => {
    const sort = create('k');
    TestBed.tick();
    sort.set('oldest');
    TestBed.tick();
    expect(sessionStorage.getItem('k')).toBe('oldest');
  });

  it('defaults to the session lifetime', () => {
    create('k');
    TestBed.tick();
    expect(sessionStorage.getItem('k')).toBe('recent');
    expect(localStorage.getItem('k')).toBeNull();
  });

  it('honours the local lifetime when asked', () => {
    create('k', 'local');
    TestBed.tick();
    expect(localStorage.getItem('k')).toBe('recent');
    expect(sessionStorage.getItem('k')).toBeNull();
  });

  it('keeps working in memory when storage is unavailable', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    const sort = create('k');
    TestBed.tick();
    sort.set('oldest');
    TestBed.tick();
    expect(sort()).toBe('oldest');
    spy.mockRestore();
  });
});
