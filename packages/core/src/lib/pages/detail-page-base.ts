import { computed, Directive } from '@angular/core';

import type { PageResource } from './page-resource';

/** Discrete UI state surfaced by a detail page. */
export type DetailPageState = 'loading' | 'error' | 'not-found' | 'data';

/**
 * Base directive for single-entity detail pages. Owns the
 * loading / error / not-found / data state machine + retry + default
 * back navigation. The concrete page provides the reactive data source
 * via the abstract `resource` field and the template (which composes
 * `host: 'page'` with the `.page__*` body kit from the `page` layout
 * catalogue — see standard-page-layouts.md §3.2).
 *
 * See firefly-docs/reference/standard-page-bases.md §2.2 for the doctrine.
 */
@Directive()
export abstract class DetailPageBase<T> {
  /**
   * The reactive data source. The page must assign this in its class body
   * (typically a `resource({...})` resolving to `T`).
   */
  protected abstract resource: PageResource<T>;

  /** Loaded entity, or `null` while loading / on error / not found. */
  protected readonly entity = computed<T | null>(
    () => (this.resource.value() as T | undefined) ?? null,
  );

  /** True while the resource is fetching. */
  protected readonly isLoading = computed(() => this.resource.isLoading());

  /** Latest error from the resource, or `null` when in a good state. */
  protected readonly error = computed(() => this.resource.error() ?? null);

  /** Discrete state used by the template. */
  protected readonly state = computed<DetailPageState>(() => {
    if (this.isLoading()) return 'loading';
    if (this.error()) return 'error';
    if (!this.entity()) return 'not-found';
    return 'data';
  });

  /** Reload the resource. Wired to the error banner's Retry button. */
  protected onRetry(): void {
    this.resource.reload();
  }

  /**
   * Default back navigation. Subclasses override when the back target is
   * non-trivial (e.g. needs to preserve filters). Uses `history.back()`
   * by default per doctrine.
   */
  protected onBack(): void {
    history.back();
  }
}
