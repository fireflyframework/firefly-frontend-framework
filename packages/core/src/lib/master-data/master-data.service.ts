import { Injectable, Signal, computed, signal } from '@angular/core';
import { firstValueFrom, isObservable } from 'rxjs';
import { MasterDataSource, MasterDataState } from './master-data.types';

interface MasterDataEntry {
  source: MasterDataSource;
  data: ReturnType<typeof signal<unknown[]>>;
  state: ReturnType<typeof signal<MasterDataState>>;
  ttlTimer?: ReturnType<typeof setTimeout>;
}

/**
 * Generic master-data registry.
 *
 * Provides the **mechanics** of master data: register, load, cache,
 * reactive access, and invalidation.
 * The **semantics** (which masters exist, where they come from, what
 * types they have) are defined by the product layer via
 * `provideMasterData()`.
 *
 * All queries return reactive signals — UI updates automatically
 * when data changes.
 */
@Injectable({ providedIn: 'root' })
export class MasterDataService {
  private readonly entries = new Map<string, MasterDataEntry>();
  private readonly stateSignals = signal<Map<string, Signal<MasterDataState>>>(new Map());

  /** `true` only when every registered master is in `loaded` state. */
  readonly ready: Signal<boolean> = computed(() => {
    const states = this.stateSignals();
    if (states.size === 0) return false;
    for (const s of states.values()) {
      if (s() !== 'loaded') return false;
    }
    return true;
  });

  /**
   * Register master-data sources. Does NOT load them — only stores
   * the source definitions. Call `loadAll()` to trigger loading.
   */
  register(sources: MasterDataSource[]): void {
    for (const source of sources) {
      const entry: MasterDataEntry = {
        source,
        data: signal<unknown[]>([]),
        state: signal<MasterDataState>('idle'),
      };
      this.entries.set(source.key, entry);
    }
    this.rebuildStateSignals();
  }

  /**
   * Load all registered masters in parallel.
   * Uses `Promise.allSettled` so a single failure does not block others.
   */
  async loadAll(): Promise<void> {
    const promises = Array.from(this.entries.keys()).map((key) => this.loadOne(key));
    await Promise.allSettled(promises);
  }

  /**
   * Get the data for a registered master.
   * Returns `Signal<T[]>` that starts empty and fills after loading.
   * If the key does not exist, returns a signal that always emits `[]`.
   */
  get<T>(key: string): Signal<T[]> {
    const entry = this.entries.get(key);
    if (!entry) return signal<T[]>([]).asReadonly() as Signal<T[]>;
    return entry.data.asReadonly() as Signal<T[]>;
  }

  /**
   * Get the loading state of a registered master.
   * If the key does not exist, returns a signal that always emits `'idle'`.
   */
  state(key: string): Signal<MasterDataState> {
    const entry = this.entries.get(key);
    if (!entry) return signal<MasterDataState>('idle').asReadonly();
    return entry.state.asReadonly();
  }

  /** Reload a single master by key. */
  async reload(key: string): Promise<void> {
    await this.loadOne(key);
  }

  /** Reload all registered masters. */
  async reloadAll(): Promise<void> {
    await this.loadAll();
  }

  // ------- private -------

  private async loadOne(key: string): Promise<void> {
    const entry = this.entries.get(key);
    if (!entry) return;

    entry.state.set('loading');
    this.rebuildStateSignals();

    try {
      const result = entry.source.loader();
      const data = isObservable(result) ? await firstValueFrom(result) : await result;
      entry.data.set(data);
      entry.state.set('loaded');

      this.scheduleTtl(entry);
    } catch {
      entry.state.set('error');
    } finally {
      this.rebuildStateSignals();
    }
  }

  private scheduleTtl(entry: MasterDataEntry): void {
    if (entry.ttlTimer) clearTimeout(entry.ttlTimer);
    if (!entry.source.ttl) return;

    entry.ttlTimer = setTimeout(() => {
      entry.state.set('idle');
      this.rebuildStateSignals();
    }, entry.source.ttl);
  }

  /**
   * Rebuild the top-level stateSignals map so the `ready` computed
   * picks up new/changed entries.
   */
  private rebuildStateSignals(): void {
    const map = new Map<string, Signal<MasterDataState>>();
    for (const [key, entry] of this.entries) {
      map.set(key, entry.state.asReadonly());
    }
    this.stateSignals.set(map);
  }
}
