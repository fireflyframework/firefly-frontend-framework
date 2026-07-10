import { computed, signal, type Signal, type WritableSignal } from '@angular/core';

import { persistedSignal } from '../storage/persisted-signal';

/** Value kinds {@link createSort} knows how to compare. */
export type SortValue = string | number | Date | null | undefined;

/** One named ordering: an accessor plus its direction (default `asc`). */
export interface SortSpec<T> {
  /** Extracts the comparable value. May read other signals — stays reactive. */
  by: (item: T) => SortValue;
  /** Sort direction. `desc` for "newest first" keys. */
  dir?: 'asc' | 'desc';
}

/** Configuration for {@link createSort}. */
export interface SortConfig<T, K extends string> {
  /** The named orderings the UI offers (sort chip / dropdown options). */
  keys: Record<K, SortSpec<T>>;
  /** Key applied when nothing else is selected/persisted. */
  fallback: K;
  /**
   * External key signal (e.g. an `input()` fed by the page). When omitted, the
   * composable creates its own writable signal — persisted across a detail
   * round trip when {@link SortConfig.persist} is set.
   */
  by?: Signal<K>;
  /** Storage key for the created signal (ignored when `by` is given). */
  persist?: string;
}

/** Reactive sorting returned by {@link createSort}. */
export interface Sort<T, K extends string> {
  /** The active sort key. Writable when the composable created it. */
  readonly by: Signal<K> | WritableSignal<K>;
  /** The input items, sorted by the active key. Recomputes reactively. */
  readonly items: Signal<T[]>;
}

/** Comparator over non-nullish {@link SortValue}s. */
function compareValues(a: NonNullable<SortValue>, b: NonNullable<SortValue>): number {
  if (typeof a === 'string' || typeof b === 'string') {
    return String(a).localeCompare(String(b));
  }
  return Number(a) - Number(b);
}

/**
 * Declarative client-side sorting: the active ordering is a **signal of a key
 * name** and `items` re-sorts reactively — both when the key changes and when
 * any signal read inside an accessor changes.
 *
 * Server-side sorting is out of scope on purpose: when the backend orders, the
 * sort key belongs in the page's URL-synced filters
 * ({@link createUrlSyncedFilters}), not here.
 *
 * When `persist` is set (and no external `by` is supplied) the key rides
 * {@link persistedSignal}, so the user's choice survives a detail-page round
 * trip — must then run in an injection context.
 */
export function createSort<T, K extends string>(
  items: Signal<T[]>,
  config: SortConfig<T, K>,
): Sort<T, K> {
  const by: Signal<K> =
    config.by ??
    (config.persist
      ? persistedSignal<K>(config.persist, {
          fallback: config.fallback,
          isValid: (raw): raw is K => raw in config.keys,
        })
      : signal<K>(config.fallback));

  const sorted = computed<T[]>(() => {
    const spec = config.keys[by()] ?? config.keys[config.fallback];
    const factor = spec.dir === 'desc' ? -1 : 1;
    return [...items()].sort((a, b) => {
      const aValue = spec.by(a);
      const bValue = spec.by(b);
      // Nullish sorts last regardless of direction (an unset date is not "the
      // newest" when descending).
      if (aValue == null) return bValue == null ? 0 : 1;
      if (bValue == null) return -1;
      return factor * compareValues(aValue, bValue);
    });
  });

  return { by, items: sorted };
}
