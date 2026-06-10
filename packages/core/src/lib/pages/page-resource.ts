/**
 * Minimal structural type implemented by both Angular's `resource()`
 * (signal API) and `httpResource()` (HTTP signal API).
 *
 * The doctrine writes the page bases against `HttpResourceRef<T>` from
 * `@angular/common/http`. The bases accept anything that exposes the
 * four reactive accessors below — that includes the plain `resource()`
 * API, so products can adopt the bases before migrating their services
 * to the HTTP variant.
 *
 * This is the canonical shape; do NOT widen it further. When every
 * consumer has adopted `httpResource()`, this type can be replaced by
 * Angular's `HttpResourceRef<T>`.
 */
export interface PageResource<T> {
  /** Latest resolved value, or `undefined` while loading / on error. */
  value(): T | undefined;

  /** True while the resource is fetching. */
  isLoading(): boolean;

  /** Latest error, or `undefined` when the resource is in a good state. */
  error(): unknown;

  /** Trigger a re-fetch using the current parameters. */
  reload(): void;
}
