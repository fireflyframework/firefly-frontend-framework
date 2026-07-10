import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';

import { createSort } from './sort';

interface Row {
  name: string;
  receivedAt: string | null;
}

const rows: Row[] = [
  { name: 'bravo', receivedAt: '2026-07-02T10:00:00Z' },
  { name: 'alfa', receivedAt: '2026-07-04T10:00:00Z' },
  { name: 'charlie', receivedAt: null },
];

function make(by?: ReturnType<typeof signal<'recent' | 'oldest' | 'name'>>, persist?: string) {
  return createSort(signal(rows), {
    keys: {
      recent: { by: (r: Row) => r.receivedAt, dir: 'desc' },
      oldest: { by: (r: Row) => r.receivedAt },
      name: { by: (r: Row) => r.name },
    },
    fallback: 'recent',
    by,
    persist,
  });
}

describe('createSort', () => {
  afterEach(() => sessionStorage.clear());

  it('sorts by the fallback key initially (desc — newest first, nullish last)', () => {
    const sort = make();
    expect(sort.items().map((r) => r.name)).toEqual(['alfa', 'bravo', 'charlie']);
  });

  it('re-sorts reactively when the external key signal changes', () => {
    const by = signal<'recent' | 'oldest' | 'name'>('recent');
    const sort = make(by);
    by.set('name');
    expect(sort.items().map((r) => r.name)).toEqual(['alfa', 'bravo', 'charlie']);
    by.set('oldest');
    expect(sort.items().map((r) => r.name)).toEqual(['bravo', 'alfa', 'charlie']);
  });

  it('persists the created key when `persist` is set and resumes on the next instance', () => {
    const first = TestBed.runInInjectionContext(() => make(undefined, 't.sort'));
    (first.by as ReturnType<typeof signal<'recent' | 'oldest' | 'name'>>).set('name');
    TestBed.tick();
    const second = TestBed.runInInjectionContext(() => make(undefined, 't.sort'));
    expect(second.by()).toBe('name');
  });
});
