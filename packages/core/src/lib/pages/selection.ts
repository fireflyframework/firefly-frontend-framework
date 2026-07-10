import { computed, signal, type Signal, type WritableSignal } from '@angular/core';

/** Reactive row-selection model returned by {@link createSelection}. */
export interface Selection<T> {
  /**
   * The selected rows. Writable and two-way bindable
   * (`[(selection)]="selection.selected"`).
   */
  readonly selected: WritableSignal<T[]>;
  /** Ids of the selected rows, via the supplied accessor. */
  readonly ids: Signal<string[]>;
  /** Number of selected rows. */
  readonly count: Signal<number>;
  /** Empties the selection (bulk action completed, filters changed…). */
  clear(): void;
}

/**
 * Row-selection state for a list with bulk actions: the raw signal a table
 * two-way binds, plus the derived ids/count every bulk handler needs and a
 * `clear()` for post-action resets — so pages stop re-rolling the same
 * signal + `computed` + reset trio.
 */
export function createSelection<T>(idOf: (item: T) => string): Selection<T> {
  const selected = signal<T[]>([]);
  return {
    selected,
    ids: computed(() => selected().map(idOf)),
    count: computed(() => selected().length),
    clear: () => selected.set([]),
  };
}
