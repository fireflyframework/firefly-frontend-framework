import { computed, Directive, signal, type Signal, type WritableSignal } from '@angular/core';

import { autoRefresh } from './auto-refresh';
import { createListState } from './list-state';
import { scrollMemory, type ScrollMemoryOptions } from './scroll-memory';
import { createUrlSyncedFilters, type UrlFilterCodec } from './url-synced-filters';
import type { PageResource } from './page-resource';

// Re-exported so `from './list-page-base'` imports keep resolving after the
// state machine and the URL codec moved into their own composables.
export type { ListPageState } from './list-state';
export type { UrlFilterCodec } from './url-synced-filters';

/**
 * Base directive for list pages. The behavior lives in standalone composables
 * — {@link createListState}, {@link createUrlSyncedFilters},
 * {@link scrollMemory}, {@link autoRefresh} (plus `createSort` /
 * `createSelection` for pages that need them) — and this base is the thin
 * façade that composes them, so a page gets the doctrine surface by extending
 * it while embedded / non-page consumers can reach for the composables
 * directly.
 *
 * The concrete page provides the reactive data source via the abstract
 * `resource` field and the template (which composes `host: 'page'` with the
 * `.page__*` body kit from the `page` layout catalogue — see
 * standard-page-layouts.md §3.1).
 *
 * See standard-page-bases.md §2.1 for the doctrine.
 *
 * **Resource shape.** The doctrine uses Angular's `HttpResourceRef`. This
 * implementation uses a structural {@link PageResource} that fits both
 * `resource()` and `httpResource()` until consuming products migrate their
 * services over to the HTTP variant.
 */
@Directive()
export abstract class ListPageBase<T> {
  /**
   * The reactive data source. The page must assign this in its class body
   * (typically a `resource({...})` returning `T[]`).
   */
  protected abstract resource: PageResource<T[]>;

  /**
   * Opt-in scroll memory: set to a unique page key (e.g. `'inbox'`) and the
   * base persists the scroll offset when the page is torn down (row click →
   * detail, any away-navigation) and restores it on the next visit. Leave
   * `null` (default) on pages that don't navigate to a detail. See
   * {@link scrollMemory}.
   */
  protected readonly scrollMemoryKey: string | null = null;

  /**
   * Tunes how {@link scrollMemoryKey} finds the scroll container and where it
   * persists. Defaults to the nearest scrollable ancestor, in `sessionStorage`.
   */
  protected readonly scrollMemoryOptions: ScrollMemoryOptions = {};

  /**
   * Opt-in auto-refresh: set to a positive number of milliseconds (e.g.
   * `30_000` to poll every 30s) and the base periodically calls
   * `this.resource.reload()` for as long as the page is alive. Reloads are
   * skipped while the browser tab is in the background (`document.hidden`) so
   * an unattended tab doesn't keep firing requests, and the underlying timer
   * is cleared automatically when the page is destroyed. Leave `null` (default)
   * on pages that don't need polling. See {@link autoRefresh}.
   */
  protected readonly refreshIntervalMs: number | null = null;

  /**
   * Set by {@link ListPageBase.createUrlSyncedFilters}; drives the default
   * {@link hasActiveFilters}. A signal-of-signal so the assignment itself is
   * reactive — a computed that evaluated before the page's field initializer
   * ran still picks the codec up.
   */
  private readonly urlFiltersActive = signal<Signal<boolean> | null>(null);

  // The state machine reads `this.resource` through lazy getters, so the
  // subclass field initializer (which runs after this) is safely picked up.
  private readonly listState = createListState<T>(
    () => this.resource,
    () => this.hasActiveFilters(),
  );

  /** Items currently rendered. Empty array while loading or on error. */
  protected readonly items = this.listState.items;

  /** True while the resource is fetching. */
  protected readonly isLoading = this.listState.isLoading;

  /** Latest error from the resource, or `null` when in a good state. */
  protected readonly error = this.listState.error;

  /** True when not loading, no error, and the items array is empty. */
  protected readonly isEmpty = this.listState.isEmpty;

  /**
   * Discrete state. `filtered-empty` (data exists but the current filter set
   * returns nothing) is driven by {@link hasActiveFilters}, which URL-synced
   * pages get for free (see {@link createUrlSyncedFilters}).
   */
  protected readonly state = this.listState.state;

  /** Reactive mirror of {@link hasActiveFilters}, for template bindings. */
  protected readonly filtersActive = computed(() => this.hasActiveFilters());

  constructor() {
    scrollMemory(
      () => this.scrollMemoryKey,
      () => this.scrollMemoryOptions,
    );
    autoRefresh(
      () => this.refreshIntervalMs,
      () => this.resource,
    );
  }

  /**
   * Declares when filters are active. Defaults to the URL-synced filters' own
   * notion when {@link createUrlSyncedFilters} was called (the codec's
   * `isActive`, or "state differs from a clean URL"); `false` otherwise. Pages
   * with client-side filters override it.
   */
  protected hasActiveFilters(): boolean {
    return this.urlFiltersActive()?.() ?? false;
  }

  /** Reload the resource. Wired to the error banner's Retry button. */
  protected onRetry(): void {
    this.resource.reload();
  }

  /**
   * Opt-in bidirectional URL ↔ filter-state sync for list pages — delegates to
   * the {@link createUrlSyncedFilters} composable (see its docs) and wires the
   * codec's activity notion into {@link hasActiveFilters}. Call once from a
   * field initializer and use the returned writable signal as the page's
   * `filters`.
   */
  protected createUrlSyncedFilters<F>(codec: UrlFilterCodec<F>): WritableSignal<F> {
    const synced = createUrlSyncedFilters(codec);
    this.urlFiltersActive.set(synced.hasActiveFilters);
    return synced.filters;
  }
}
