import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, type Params } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createUrlSyncedFilters, type UrlFilterCodec } from './url-synced-filters';

interface Filters {
  readonly q: string;
  readonly page: number;
}

/** Codec whose activity notion ignores pagination unless `isActive` is dropped. */
function codec(overrides: Partial<UrlFilterCodec<Filters>> = {}): UrlFilterCodec<Filters> {
  return {
    parse: (params: Params) => ({ q: params['q'] ?? '', page: Number(params['page'] ?? 1) }),
    serialize: (f) => ({ q: f.q || undefined, page: f.page === 1 ? undefined : f.page }),
    equal: (a, b) => a.q === b.q && a.page === b.page,
    ...overrides,
  };
}

const queryParams = new BehaviorSubject<Params>({});
const navigate = vi.fn();

/** Configures the TestBed with a route seeded at `initial`. */
function setup(initial: Params = {}): void {
  queryParams.next(initial);
  navigate.mockClear();
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      {
        provide: ActivatedRoute,
        useValue: { queryParams, snapshot: { queryParams: initial } },
      },
      { provide: Router, useValue: { navigate } },
    ],
  });
}

describe('createUrlSyncedFilters', () => {
  beforeEach(() => setup());

  it('seeds the filter state from the route snapshot', () => {
    setup({ q: 'invoice' });
    const synced = TestBed.runInInjectionContext(() => createUrlSyncedFilters(codec()));
    expect(synced.filters()).toEqual({ q: 'invoice', page: 1 });
  });

  it('mirrors a state change back to the URL', () => {
    const synced = TestBed.runInInjectionContext(() => createUrlSyncedFilters(codec()));
    TestBed.tick();
    navigate.mockClear();

    synced.filters.set({ q: 'invoice', page: 1 });
    TestBed.tick();

    expect(navigate).toHaveBeenCalledOnce();
    expect(navigate.mock.calls[0][1]).toMatchObject({
      queryParams: { q: 'invoice', page: undefined },
      replaceUrl: true,
    });
  });

  it('does not re-navigate when the URL re-emits an equal state', () => {
    const synced = TestBed.runInInjectionContext(() => createUrlSyncedFilters(codec()));
    TestBed.tick();
    navigate.mockClear();

    queryParams.next({});
    TestBed.tick();

    expect(synced.filters()).toEqual({ q: '', page: 1 });
    expect(navigate).not.toHaveBeenCalled();
  });

  it('derives hasActiveFilters from a clean URL when no isActive is given', () => {
    const synced = TestBed.runInInjectionContext(() => createUrlSyncedFilters(codec()));
    expect(synced.hasActiveFilters()).toBe(false);

    synced.filters.set({ q: 'invoice', page: 1 });
    expect(synced.hasActiveFilters()).toBe(true);
  });

  it('counts pagination as a filter without isActive, and not with it', () => {
    const plain = TestBed.runInInjectionContext(() => createUrlSyncedFilters(codec()));
    plain.filters.set({ q: '', page: 3 });
    expect(plain.hasActiveFilters()).toBe(true);

    const scoped = TestBed.runInInjectionContext(() =>
      createUrlSyncedFilters(codec({ isActive: (f) => f.q !== '' })),
    );
    scoped.filters.set({ q: '', page: 3 });
    expect(scoped.hasActiveFilters()).toBe(false);
  });
});
