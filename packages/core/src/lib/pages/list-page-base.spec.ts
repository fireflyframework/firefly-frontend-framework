import { Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute, Router, type Params } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { ListPageBase, type UrlFilterCodec } from './list-page-base';
import type { PageResource } from './page-resource';

function makeResource<T>(initial: {
  value?: T;
  isLoading?: boolean;
  error?: unknown;
} = {}): PageResource<T> & { setValue: (v: T | undefined) => void; setLoading: (v: boolean) => void; setError: (e: unknown) => void; reload: ReturnType<typeof vi.fn> } {
  const v = signal<T | undefined>(initial.value);
  const l = signal<boolean>(initial.isLoading ?? false);
  const e = signal<unknown>(initial.error);
  const reload = vi.fn();
  return {
    value: () => v(),
    isLoading: () => l(),
    error: () => e(),
    reload,
    setValue: v.set,
    setLoading: l.set,
    setError: e.set,
  };
}

@Component({ standalone: true, template: '' })
class TestListPage extends ListPageBase<number> {
  filtersActive = signal(false);
  protected override resource = makeResource<number[]>({ isLoading: true });
  protected override hasActiveFilters(): boolean {
    return this.filtersActive();
  }

  // Test helpers — expose protected accessors.
  public readState() {
    return this.state();
  }
  public readItems() {
    return this.items();
  }
  public readIsLoading() {
    return this.isLoading();
  }
  public readIsEmpty() {
    return this.isEmpty();
  }
  public readError() {
    return this.error();
  }
  public callRetry() {
    this.onRetry();
  }
  public setResource(value: number[] | undefined, loading = false, error: unknown = undefined): void {
    const r = this.resource as ReturnType<typeof makeResource<number[]>>;
    r.setValue(value);
    r.setLoading(loading);
    r.setError(error);
  }
  public getReloadSpy() {
    return (this.resource as ReturnType<typeof makeResource<number[]>>).reload;
  }
}

function mount(): TestListPage {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ imports: [TestListPage] });
  return TestBed.createComponent(TestListPage).componentInstance;
}

describe('ListPageBase', () => {
  it("yields state='loading' while isLoading is true", () => {
    const c = mount();
    c.setResource(undefined, true);
    expect(c.readState()).toBe('loading');
    expect(c.readIsLoading()).toBe(true);
    expect(c.readItems()).toEqual([]);
  });

  it("yields state='error' when the resource reports an error", () => {
    const c = mount();
    c.setResource(undefined, false, new Error('boom'));
    expect(c.readState()).toBe('error');
    expect(c.readError()).toBeInstanceOf(Error);
  });

  it("yields state='empty' on empty list with no active filters", () => {
    const c = mount();
    c.filtersActive.set(false);
    c.setResource([], false);
    expect(c.readState()).toBe('empty');
    expect(c.readIsEmpty()).toBe(true);
  });

  it("yields state='filtered-empty' on empty list with active filters", () => {
    const c = mount();
    c.filtersActive.set(true);
    c.setResource([], false);
    expect(c.readState()).toBe('filtered-empty');
  });

  it("yields state='data' when items are present", () => {
    const c = mount();
    c.setResource([1, 2, 3], false);
    expect(c.readState()).toBe('data');
    expect(c.readItems()).toEqual([1, 2, 3]);
    expect(c.readIsEmpty()).toBe(false);
  });

  it('onRetry triggers a resource reload', () => {
    const c = mount();
    c.callRetry();
    expect(c.getReloadSpy()).toHaveBeenCalledTimes(1);
  });

  it('exposes error() as null (not undefined) when resource has no error', () => {
    const c = mount();
    c.setResource([42], false);
    expect(c.readError()).toBeNull();
  });
});

// ── createUrlSyncedFilters ───────────────────────────────────────────────

interface TestFilters {
  q?: string;
  page: number;
}

const TEST_CODEC: UrlFilterCodec<TestFilters> = {
  parse: (p) => ({
    q: typeof p['q'] === 'string' && p['q'].length > 0 ? p['q'] : undefined,
    page: Number(p['page']) || 0,
  }),
  serialize: (f) => {
    const out: Params = {};
    if (f.q) out['q'] = f.q;
    if (f.page) out['page'] = String(f.page);
    return out;
  },
  equal: (a, b) => a.q === b.q && a.page === b.page,
};

@Component({ standalone: true, template: '' })
class UrlSyncedPage extends ListPageBase<number> {
  protected override resource = makeResource<number[]>({ value: [] });
  readonly filters = this.createUrlSyncedFilters(TEST_CODEC);
}

function mountUrlSynced(initial: Params): {
  fixture: ComponentFixture<UrlSyncedPage>;
  page: UrlSyncedPage;
  queryParams$: BehaviorSubject<Params>;
  navigate: ReturnType<typeof vi.fn>;
} {
  TestBed.resetTestingModule();
  const queryParams$ = new BehaviorSubject<Params>(initial);
  const navigate = vi.fn().mockResolvedValue(true);
  TestBed.configureTestingModule({
    imports: [UrlSyncedPage],
    providers: [
      { provide: ActivatedRoute, useValue: { snapshot: { queryParams: initial }, queryParams: queryParams$.asObservable() } },
      { provide: Router, useValue: { navigate } },
    ],
  });
  const fixture = TestBed.createComponent(UrlSyncedPage);
  fixture.detectChanges();
  return { fixture, page: fixture.componentInstance, queryParams$, navigate };
}

describe('ListPageBase.createUrlSyncedFilters', () => {
  it('hydrates filters from the route query params on mount', () => {
    const { page } = mountUrlSynced({ q: 'hello', page: '2' });
    expect(page.filters()).toEqual({ q: 'hello', page: 2 });
  });

  it('mirrors filter changes back to the URL (serialised, replaceUrl)', () => {
    const { fixture, page, navigate } = mountUrlSynced({});
    navigate.mockClear();

    page.filters.set({ q: 'invoices', page: 3 });
    fixture.detectChanges();

    expect(navigate).toHaveBeenCalled();
    const extras = navigate.mock.calls.at(-1)?.[1];
    expect(extras).toMatchObject({ replaceUrl: true, queryParams: { q: 'invoices', page: '3' } });
  });

  it('re-hydrates filters when the route query params emit (back/forward)', () => {
    const { fixture, page, queryParams$ } = mountUrlSynced({});
    queryParams$.next({ q: 'contracts', page: '5' });
    fixture.detectChanges();
    expect(page.filters()).toEqual({ q: 'contracts', page: 5 });
  });

  it('does not re-navigate when the URL re-emits a structurally equal state', () => {
    const { fixture, queryParams$, navigate } = mountUrlSynced({ page: '1' });
    fixture.detectChanges();
    navigate.mockClear();
    // Same state re-emitted → equal() short-circuits the writable signal → no write.
    queryParams$.next({ page: '1' });
    fixture.detectChanges();
    expect(navigate).not.toHaveBeenCalled();
  });
});
