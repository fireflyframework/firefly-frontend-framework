// ---------------------------------------------------------------------------
// Storage type
// ---------------------------------------------------------------------------

/**
 * Browser storage backend to use.
 *
 * - `'local'`   — `window.localStorage` (persists across sessions)
 * - `'session'` — `window.sessionStorage` (cleared when tab closes)
 */
export type StorageType = 'local' | 'session';

// ---------------------------------------------------------------------------
// Provider configuration
// ---------------------------------------------------------------------------

/**
 * Configuration for `provideStorage()`.
 *
 * Controls the namespace prefix and default storage backend.
 *
 * @example
 * ```typescript
 * provideStorage({
 *   prefix: 'myapp',
 *   defaultStorage: 'local',
 * })
 * ```
 */
export interface StorageConfig {
  /**
   * Namespace prefix for all keys. Prevents collisions between
   * different applications or modules on the same origin.
   *
   * Keys are stored as `{prefix}.{key}` (e.g. `ff.user-prefs`).
   * Default: `'ff'`.
   */
  readonly prefix?: string;

  /**
   * Default storage backend when not specified per-call.
   * Default: `'local'`.
   */
  readonly defaultStorage?: StorageType;
}

// ---------------------------------------------------------------------------
// Internal entry wrapper (for TTL support)
// ---------------------------------------------------------------------------

/**
 * Internal wrapper for stored values that support expiration.
 *
 * When a value is stored via `setWithTTL()`, it is wrapped in this
 * envelope with an `expiresAt` timestamp. On `get()`, the service
 * checks expiration and auto-removes expired entries.
 *
 * Values stored via plain `set()` are NOT wrapped — they are stored
 * as raw JSON. The service distinguishes between the two formats
 * by checking for the `__ff_entry` marker.
 */
export interface StorageEntry<T = unknown> {
  /** Marker to distinguish TTL-wrapped entries from raw values. */
  readonly __ff_entry: true;
  /** The stored value. */
  readonly value: T;
  /** Expiration timestamp in ms (from `Date.now()`). `undefined` = never expires. */
  readonly expiresAt: number;
}
