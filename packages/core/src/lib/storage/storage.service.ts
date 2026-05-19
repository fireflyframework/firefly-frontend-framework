import { Injectable, InjectionToken, inject } from '@angular/core';
import { StorageConfig, StorageEntry, StorageType } from './storage.types';

/**
 * Injection token for the storage module configuration.
 *
 * Provided by `provideStorage()`. When absent, the service uses
 * defaults: prefix `'ff'`, defaultStorage `'local'`.
 */
export const STORAGE_CONFIG = new InjectionToken<StorageConfig>(
  'STORAGE_CONFIG',
);

/** Default prefix when no config is provided. */
const DEFAULT_PREFIX = 'ff';

/** Separator between prefix and key. */
const SEPARATOR = '.';

/**
 * Typed abstraction over `localStorage` and `sessionStorage`.
 *
 * Provides get/set with automatic JSON serialization, namespace
 * prefixing to prevent key collisions, and optional TTL expiration.
 *
 * When the Storage API is unavailable (SSR, restricted incognito),
 * the service falls back to an in-memory `Map` — data survives for
 * the current process but is not persisted.
 *
 * Usage:
 * ```typescript
 * const storage = inject(StorageService);
 *
 * storage.set('user-prefs', { theme: 'dark' });
 * const prefs = storage.get<{ theme: string }>('user-prefs');
 *
 * storage.setWithTTL('cache-token', 'abc123', 60_000); // expires in 1 min
 * ```
 */
@Injectable()
export class StorageService {
  private readonly _prefix: string;
  private readonly _defaultStorage: StorageType;

  /**
   * In-memory fallback maps for environments where the Storage API
   * is unavailable (SSR, sandboxed iframes, restricted incognito).
   * One map per storage type to preserve isolation semantics.
   */
  private readonly _memoryLocal = new Map<string, string>();
  private readonly _memorySession = new Map<string, string>();

  constructor() {
    const config = inject(STORAGE_CONFIG, { optional: true });
    this._prefix = config?.prefix ?? DEFAULT_PREFIX;
    this._defaultStorage = config?.defaultStorage ?? 'local';
  }

  /**
   * Retrieve a value from storage.
   *
   * Automatically deserializes JSON. If the key holds a TTL-wrapped
   * entry that has expired, it is auto-removed and `null` is returned.
   *
   * @param key - Storage key (without prefix)
   * @param storage - Backend to read from. Default: configured default.
   * @returns The deserialized value, or `null` if not found / expired
   */
  get<T>(key: string, storage?: StorageType): T | null {
    const fullKey = this._buildKey(key);
    const backend = this._getBackend(storage);
    const raw = backend.getItem(fullKey);
    if (raw === null) return null;

    try {
      const parsed: unknown = JSON.parse(raw);

      // Check for TTL-wrapped entry
      if (this._isStorageEntry(parsed)) {
        if (Date.now() > parsed.expiresAt) {
          // Expired — clean up and return null
          backend.removeItem(fullKey);
          return null;
        }
        return parsed.value as T;
      }

      return parsed as T;
    } catch {
      // Not valid JSON — return null
      return null;
    }
  }

  /**
   * Store a value. Serializes to JSON automatically.
   *
   * @param key - Storage key (without prefix)
   * @param value - Value to store (must be JSON-serializable)
   * @param storage - Backend to write to. Default: configured default.
   */
  set<T>(key: string, value: T, storage?: StorageType): void {
    const fullKey = this._buildKey(key);
    const backend = this._getBackend(storage);
    try {
      backend.setItem(fullKey, JSON.stringify(value));
    } catch {
      // Storage full or restricted — silently fail
    }
  }

  /**
   * Remove a single key from storage.
   *
   * @param key - Storage key (without prefix)
   * @param storage - Backend to remove from. Default: configured default.
   */
  remove(key: string, storage?: StorageType): void {
    const fullKey = this._buildKey(key);
    this._getBackend(storage).removeItem(fullKey);
  }

  /**
   * Clear all keys managed by this service (matching the prefix).
   *
   * Does NOT clear keys from other applications or modules
   * that use a different prefix.
   *
   * @param storage - Backend to clear. Default: configured default.
   */
  clear(storage?: StorageType): void {
    const backend = this._getBackend(storage);
    const prefix = this._prefix + SEPARATOR;
    const keysToRemove: string[] = [];
    for (let i = 0; i < backend.length; i++) {
      const k = backend.key(i);
      if (k?.startsWith(prefix)) {
        keysToRemove.push(k);
      }
    }
    for (const k of keysToRemove) {
      backend.removeItem(k);
    }
  }

  /**
   * Store a value with a time-to-live (TTL).
   *
   * The value is wrapped in a `StorageEntry` envelope with an
   * `expiresAt` timestamp. On `get()`, expired entries are
   * auto-removed (lazy expiration — no timers).
   *
   * @param key - Storage key (without prefix)
   * @param value - Value to store (must be JSON-serializable)
   * @param ttlMs - Time-to-live in milliseconds
   * @param storage - Backend to write to. Default: configured default.
   */
  setWithTTL<T>(key: string, value: T, ttlMs: number, storage?: StorageType): void {
    const entry: StorageEntry<T> = {
      __ff_entry: true,
      value,
      expiresAt: Date.now() + ttlMs,
    };
    const fullKey = this._buildKey(key);
    const backend = this._getBackend(storage);
    try {
      backend.setItem(fullKey, JSON.stringify(entry));
    } catch {
      // Storage full or restricted
    }
  }

  /**
   * Check if a key exists in storage.
   *
   * Returns `false` for expired TTL entries (and auto-removes them).
   *
   * @param key - Storage key (without prefix)
   * @param storage - Backend to check. Default: configured default.
   */
  has(key: string, storage?: StorageType): boolean {
    return this.get(key, storage) !== null;
  }

  /**
   * List all keys managed by this service (matching the prefix).
   *
   * Returns keys without the prefix (the "user-facing" key names).
   * Expired TTL entries are NOT filtered out by this method
   * (use `get()` or `has()` to trigger lazy cleanup).
   *
   * @param storage - Backend to list from. Default: configured default.
   * @returns Array of key names without the prefix
   */
  keys(storage?: StorageType): string[] {
    const backend = this._getBackend(storage);
    const prefix = this._prefix + SEPARATOR;
    const result: string[] = [];
    for (let i = 0; i < backend.length; i++) {
      const k = backend.key(i);
      if (k?.startsWith(prefix)) {
        result.push(k.slice(prefix.length));
      }
    }
    return result;
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /** Build the full namespaced key. */
  private _buildKey(key: string): string {
    return this._prefix + SEPARATOR + key;
  }

  /** Resolve the storage backend (real or in-memory fallback). */
  private _getBackend(type?: StorageType): Storage {
    const resolved = type ?? this._defaultStorage;
    const real = resolved === 'session' ? this._trySessionStorage() : this._tryLocalStorage();
    if (real) return real;

    // Fallback to in-memory adapter
    const map = resolved === 'session' ? this._memorySession : this._memoryLocal;
    return this._createMemoryStorage(map);
  }

  /** Try to access localStorage safely. */
  private _tryLocalStorage(): Storage | null {
    try {
      if (typeof localStorage !== 'undefined') {
        // Probe write to detect restricted mode
        localStorage.setItem('__ff_probe', '1');
        localStorage.removeItem('__ff_probe');
        return localStorage;
      }
    } catch {
      // Restricted
    }
    return null;
  }

  /** Try to access sessionStorage safely. */
  private _trySessionStorage(): Storage | null {
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('__ff_probe', '1');
        sessionStorage.removeItem('__ff_probe');
        return sessionStorage;
      }
    } catch {
      // Restricted
    }
    return null;
  }

  /** Type guard for StorageEntry. */
  private _isStorageEntry(value: unknown): value is StorageEntry {
    return (
      typeof value === 'object' &&
      value !== null &&
      '__ff_entry' in value &&
      (value as StorageEntry).__ff_entry === true
    );
  }

  /**
   * Create a Storage-compatible adapter backed by an in-memory Map.
   * Implements the minimum subset used by this service.
   */
  private _createMemoryStorage(map: Map<string, string>): Storage {
    return {
      get length() {
        return map.size;
      },
      getItem(key: string): string | null {
        return map.get(key) ?? null;
      },
      setItem(key: string, value: string): void {
        map.set(key, value);
      },
      removeItem(key: string): void {
        map.delete(key);
      },
      key(index: number): string | null {
        const keys = Array.from(map.keys());
        return keys[index] ?? null;
      },
      clear(): void {
        map.clear();
      },
    };
  }
}
