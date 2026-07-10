import { computed, effect, inject, signal, type Signal, type WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, type Params } from '@angular/router';

/**
 * Bidirectional URL ↔ filter-state codec for {@link createUrlSyncedFilters}.
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
  /**
   * Optional: declares when a filter state counts as "actively filtering"
   * (drives the `filtered-empty` vs `empty` distinction). When omitted, any
   * state not `equal` to `parse({})` counts as active — override it when some
   * fields (pagination) should not count.
   */
  isActive?(filters: F): boolean;
}

/** Reactive pair returned by {@link createUrlSyncedFilters}. */
export interface UrlSyncedFilters<F> {
  /** The page's writable filter state, kept in lockstep with the URL. */
  readonly filters: WritableSignal<F>;
  /** True when the current state counts as "actively filtering" (see codec). */
  readonly hasActiveFilters: Signal<boolean>;
}

/**
 * Opt-in bidirectional URL ↔ filter-state sync for list pages, as a standalone
 * composable — {@link ListPageBase.createUrlSyncedFilters} delegates here.
 * Must run in an injection context.
 *
 * - **URL → state:** reads `ActivatedRoute.queryParams` and re-derives the
 *   filters on every navigation (back/forward, deep link).
 * - **state → URL:** mirrors the filters back to the URL (`replaceUrl`), with
 *   `codec.equal` (set as the signal's `equal`) breaking the loop so a URL
 *   re-emit of the same state does not re-navigate.
 *
 * This is the canonical home for list-page URL-sync: the single
 * `route.queryParams` read lives here, not ad-hoc in every page.
 */
export function createUrlSyncedFilters<F>(codec: UrlFilterCodec<F>): UrlSyncedFilters<F> {
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

  const hasActiveFilters = computed(() =>
    codec.isActive ? codec.isActive(filters()) : !codec.equal(filters(), codec.parse({})),
  );

  return { filters, hasActiveFilters };
}
