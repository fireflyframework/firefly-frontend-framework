import { computed, Directive } from '@angular/core';

import type { PageResource } from './page-resource';

/**
 * Base directive for dashboard pages (KPI grids, multi-widget aggregator
 * screens). Owns a "fan-in" of multiple resources: dashboard-level
 * loading/error states + a coordinated refresh-all action.
 *
 * The concrete page declares the {@link widgets} array — typically one
 * `resource()` per KPI / chart — and the template (which composes
 * `host: 'page'` with the `.page__*` body kit from the `page` layout
 * catalogue — see standard-page-layouts.md §3.4).
 *
 * See firefly-docs/reference/standard-page-bases.md §2.4 for the doctrine.
 */
@Directive()
export abstract class DashboardPageBase {
  /**
   * The widget resources this dashboard depends on. Subclass declares
   * them at construction time (typically by aggregating each per-widget
   * `resource()` into a tuple).
   */
  protected abstract widgets: ReadonlyArray<PageResource<unknown>>;

  /** True when at least one widget is currently fetching. */
  protected readonly isLoading = computed(() =>
    this.widgets.some((w) => w.isLoading()),
  );

  /**
   * First non-null widget error, or `null`. Dashboard-level error UI
   * surfaces this; per-widget error UI can still consume each widget's
   * own `error()` signal directly.
   */
  protected readonly error = computed<Error | null>(() => {
    for (const w of this.widgets) {
      const err = w.error();
      if (err) return err instanceof Error ? err : new Error(String(err));
    }
    return null;
  });

  /** Refresh every widget in parallel. */
  protected refreshAll(): void {
    for (const w of this.widgets) w.reload();
  }
}
