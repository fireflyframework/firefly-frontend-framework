/**
 * Source from which feature flags can be loaded.
 *
 * - `'static'` — flags provided inline via `FeatureFlagConfig.defaults`
 * - `'localStorage'` — flags persisted in `localStorage` under `'ff-flags'`
 * - `'endpoint'` — flags fetched from a remote HTTP endpoint
 */
export type FlagSource = 'static' | 'localStorage' | 'endpoint';

/**
 * Configuration for the feature-flags module.
 *
 * Passed to `provideFeatureFlags()` to control how flags are resolved.
 *
 * @example
 * ```typescript
 * provideFeatureFlags({
 *   source: 'static',
 *   defaults: { 'new-dashboard': true, 'beta-reports': false },
 * })
 * ```
 */
export interface FeatureFlagConfig {
  /** Primary source for loading flags. Default: `'static'`. */
  readonly source?: FlagSource;

  /** URL of the remote flag service. Required when `source` is `'endpoint'`. */
  readonly endpointUrl?: string;

  /** Polling interval in ms for refreshing remote flags. Default: 60000 (1 min). */
  readonly pollIntervalMs?: number;

  /** Inline flag defaults for dev/testing override. */
  readonly defaults?: Record<string, boolean>;

  /** Custom loader function. When provided, takes precedence over `source`. */
  readonly loader?: FlagLoader;
}

/**
 * Read-only snapshot of the current flag state.
 * Useful for debugging, serialization, and testing.
 */
export interface FlagSnapshot {
  readonly flags: Readonly<Record<string, boolean>>;
}

/**
 * Async function that resolves a set of feature flags.
 * Used as an extension point for custom flag sources.
 *
 * @returns Record mapping flag names to their boolean values
 */
export type FlagLoader = () => Promise<Record<string, boolean>>;
