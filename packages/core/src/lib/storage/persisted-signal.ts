import { effect, signal, type WritableSignal } from '@angular/core';
import { readStorage, writeStorage, type StorageKind } from '@fireflyframework/utils/storage';

/** Configuration for {@link persistedSignal}. */
export interface PersistedSignalOptions<T extends string> {
  /** Value used when nothing (or an invalid value) is stored. */
  fallback: T;
  /** Validates a raw stored string — guards against stale/tampered entries. */
  isValid: (raw: string) => raw is T;
  /**
   * Storage lifetime. Defaults to `session` — the right scope for a transient
   * "resume where I left off" affordance (outlives the component, not the tab).
   * Use `local` for real user preferences.
   */
  storage?: StorageKind;
}

/**
 * A writable signal whose value survives component teardown: it seeds
 * synchronously from Web Storage and mirrors every change back, so a
 * "click a row → open detail → go back" round trip resumes where the user
 * left off.
 *
 * Reads and writes are defensive (`readStorage` / `writeStorage` from
 * `@fireflyframework/utils/storage`): when storage is unavailable the signal
 * still works for the lifetime of the component — persistence just degrades to
 * the fallback on the next visit.
 *
 * Must be created in an injection context (a field initializer), because the
 * write-back rides an `effect`.
 *
 * @example
 * ```ts
 * readonly sortBy = persistedSignal<InboxSortKey>('inbox.sort', {
 *   fallback: 'recent',
 *   isValid: (raw): raw is InboxSortKey =>
 *     raw === 'recent' || raw === 'oldest' || raw === 'name',
 * });
 * ```
 */
export function persistedSignal<T extends string>(
  key: string,
  options: PersistedSignalOptions<T>,
): WritableSignal<T> {
  const kind = options.storage ?? 'session';
  const raw = readStorage(kind, key);
  const value = signal<T>(raw !== null && options.isValid(raw) ? raw : options.fallback);
  effect(() => writeStorage(kind, key, value()));
  return value;
}
