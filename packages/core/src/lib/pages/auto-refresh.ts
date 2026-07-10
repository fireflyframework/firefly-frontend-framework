import { afterNextRender, DestroyRef, inject } from '@angular/core';

import type { PageResource } from './page-resource';

/**
 * Opt-in polling composable for list pages (see
 * {@link ListPageBase.refreshIntervalMs}). While a positive interval is
 * reported by `intervalMs()`, calls `resource().reload()` on every tick —
 * skipping the tick while the browser tab is in the background
 * (`document.hidden`), so a backgrounded tab doesn't keep firing requests. A
 * `null` / non-positive interval leaves the composable inert (no timer).
 *
 * `intervalMs` and `resource` are **getters**, not plain values, so a base
 * class can point at fields a subclass assigns after construction: a field
 * declared on a subclass is only initialized once the base constructor has
 * returned, so reading them synchronously inside the base constructor would
 * still observe the base class's own defaults. Both getters are therefore only
 * invoked from inside `afterNextRender`, deferring the read until the
 * subclass's field initializers have run — mirroring how {@link scrollMemory}
 * defers its own `key()` read.
 *
 * Must run in an injection context (calls `inject(DestroyRef)` synchronously).
 *
 * @param intervalMs Getter for the poll period in milliseconds. `null` (or any
 *   value `<= 0`) disables polling entirely.
 * @param resource Getter for the page's reactive data source; `reload()` is
 *   invoked on it each tick.
 */
export function autoRefresh(
  intervalMs: () => number | null,
  resource: () => PageResource<unknown>,
): void {
  const destroyRef = inject(DestroyRef);
  let timerId: ReturnType<typeof setInterval> | undefined;

  afterNextRender(() => {
    const ms = intervalMs();
    if (ms === null || !Number.isFinite(ms) || ms <= 0) return;

    timerId = setInterval(() => {
      if (document.hidden) return;
      resource().reload();
    }, ms);
  });

  destroyRef.onDestroy(() => {
    if (timerId !== undefined) clearInterval(timerId);
  });
}
