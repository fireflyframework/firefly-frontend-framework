/** The two Web Storage lifetimes: `local` survives the browser, `session` the tab. */
export type StorageKind = 'local' | 'session';

/** Resolves the requested storage, or `null` when access itself throws (sandboxed iframe). */
function storageFor(kind: StorageKind): Storage | null {
  try {
    return (kind === 'local' ? globalThis.localStorage : globalThis.sessionStorage) ?? null;
  } catch {
    return null;
  }
}

/**
 * `getItem` wrapper that swallows access errors (private-mode storage, quota,
 * disabled storage, SSR). Returns `null` when no value is available.
 */
export function readStorage(kind: StorageKind, key: string): string | null {
  try {
    return storageFor(kind)?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

/**
 * `setItem` wrapper that swallows quota / disabled errors. Callers keep the
 * value in memory for the lifetime of the tab even when persistence fails.
 */
export function writeStorage(kind: StorageKind, key: string, value: string): void {
  try {
    storageFor(kind)?.setItem(key, value);
  } catch {
    // Storage quota or disabled — silently ignored. The caller still holds the
    // value in memory for the lifetime of the tab.
  }
}

/** {@link readStorage} pinned to `localStorage` (preference services). */
export function readLocalStorage(key: string): string | null {
  return readStorage('local', key);
}

/** {@link writeStorage} pinned to `localStorage` (preference services). */
export function writeLocalStorage(key: string, value: string): void {
  writeStorage('local', key, value);
}
