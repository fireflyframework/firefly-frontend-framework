import { computed, Directive, effect, inject, signal, type WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, type Params } from '@angular/router';

import type { PageResource } from './page-resource';

/** Discrete UI state surfaced by a list page. */
export type ListPageState = 'loading' | 'error' | 'empty' | 'filtered-empty' | 'data';

/**
 * Bidirectional URL ↔ filter-state codec for {@link ListPageBase.createUrlSyncedFilters}.
 * A page supplies pure functions to (de)serialise its filter object against the
 * route query params, plus a structural `equal` to break the read↔write loop.
 */
export interface UrlFilterCodec<F> {
  /** Build the filter state from a `queryParams` object (route snapshot/emit). */
  parse(params: Params): F;
  /** Serialise the filter state to a `queryParams` object for `Router.navigate`. */
  serialize(filters: F): Params;
  /** Structural equality — when `true`, a URL re-emit does not re-trigger the write. */
  equal(a: F, b: F): boolean;
}

/**
 * Base directive for list pages. Owns the loading / error / empty / data
 * state machine + retry. The concrete page provides the reactive data
 * source via the abstract `resource` field and the template (which composes
 * `host: 'page'` with the `.page__*` body kit from the `page` layout
 * catalogue — see standard-page-layouts.md §3.1).
 *
 * See firefly-docs/reference/standard-page-bases.md §2.1 for the doctrine.
 *
 * **Resource shape.** The doctrine uses Angular's `HttpResourceRef`. This
 * implementation uses a structural {@link PageResource} that fits both
 * `resource()` and `httpResource()` until consuming products migrate
 * their services over to the HTTP variant.
 */
@Directive()
export abstract class ListPageBase<T> {
  /**
   * The reactive data source. The page must assign this in its class body
   * (typically a `resource({...})` returning `T[]`).
   */
  protected abstract resource: PageResource<T[]>;

  /** Items currently rendered. Empty array while loading or on error. */
  protected readonly items = computed<T[]>(() => this.resource.value() ?? []);

  /** True while the resource is fetching. */
  protected readonly isLoading = computed(() => this.resource.isLoading());

  /** Latest error from the resource, or `null` when in a good state. */
  protected readonly error = computed(() => this.resource.error() ?? null);

  /** True when not loading, no error, and the items array is empty. */
  protected readonly isEmpty = computed(
    () => !this.isLoading() && !this.error() && this.items().length === 0,
  );

  /**
   * Discrete state. Subclasses override {@link hasActiveFilters} to
   * distinguish `empty` (no data at all) from `filtered-empty` (data
   * exists but the current filter set returns nothing).
   */
  protected readonly state = computed<ListPageState>(() => {
    if (this.isLoading()) return 'loading';
    if (this.error()) return 'error';
    if (!this.items().length) {
      return this.hasActiveFilters() ? 'filtered-empty' : 'empty';
    }
    return 'data';
  });

  /** Override to declare when filters are active. Default: false. */
  protected hasActiveFilters(): boolean {
    return false;
  }

  /** Reload the resource. Wired to the error banner's Retry button. */
  protected onRetry(): void {
    this.resource.reload();
  }

  /**
   * Opt-in bidirectional URL ↔ filter-state sync for list pages.
   *
   * Call once from a field initializer with a {@link UrlFilterCodec} and use
   * the returned writable signal as the page's `filters`:
   * - **URL → state:** reads `ActivatedRoute.queryParams` and re-derives the
   *   filters on every navigation (back/forward, deep link).
   * - **state → URL:** mirrors the filters back to the URL (`replaceUrl`),
   *   with `codec.equal` (set as the signal's `equal`) breaking the loop so a
   *   URL re-emit of the same state does not re-navigate.
   *
   * This is the **canonical home** for list-page URL-sync: the single
   * `route.queryParams` read lives here, not ad-hoc in every page. `ActivatedRoute`
   * / `Router` are injected lazily inside this method so pages that do not call
   * it carry no routing dependency.
   */
  protected createUrlSyncedFilters<F>(codec: UrlFilterCodec<F>): WritableSignal<F> {
    const route = inject(ActivatedRoute);
    const router = inject(Router);

    const filters = signal<F>(codec.parse(route.snapshot.queryParams), { equal: codec.equal });
    const urlParams = toSignal(route.queryParams, { initialValue: route.snapshot.queryParams });

    // URL → state
    effect(() => filters.set(codec.parse(urlParams())));
    // state → URL
    effect(() => {
      void router.navigate([], {
        relativeTo: route,
        queryParams: codec.serialize(filters()),
        replaceUrl: true,
      });
    });

    return filters;
  }
}
