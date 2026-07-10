import { computed, type Signal } from '@angular/core';

import type { PageResource } from './page-resource';

/** Discrete UI state surfaced by a list page. */
export type ListPageState = 'loading' | 'error' | 'empty' | 'filtered-empty' | 'data';

/** Reactive list-page state machine returned by {@link createListState}. */
export interface ListState<T> {
  /** Items currently rendered. Empty array while loading or on error. */
  readonly items: Signal<T[]>;
  /** True while the resource is fetching. */
  readonly isLoading: Signal<boolean>;
  /** Latest error from the resource, or `null` when in a good state. */
  readonly error: Signal<unknown>;
  /** True when not loading, no error, and the items array is empty. */
  readonly isEmpty: Signal<boolean>;
  /** Discrete state — `filtered-empty` when empty WITH active filters. */
  readonly state: Signal<ListPageState>;
}

/**
 * The loading / error / empty / filtered-empty / data state machine of a list,
 * as a standalone composable — {@link ListPageBase} delegates here, and
 * non-page consumers (embedded list panels) can use it directly.
 *
 * Both arguments are **getters** so the caller can point at fields that are
 * assigned after construction (a subclass `resource` field initializer).
 */
export function createListState<T>(
  resource: () => PageResource<T[]>,
  hasActiveFilters: () => boolean = () => false,
): ListState<T> {
  const items = computed<T[]>(() => resource().value() ?? []);
  const isLoading = computed(() => resource().isLoading());
  const error = computed(() => resource().error() ?? null);
  const isEmpty = computed(() => !isLoading() && !error() && items().length === 0);
  const state = computed<ListPageState>(() => {
    if (isLoading()) return 'loading';
    if (error()) return 'error';
    if (!items().length) return hasActiveFilters() ? 'filtered-empty' : 'empty';
    return 'data';
  });
  return { items, isLoading, error, isEmpty, state };
}
