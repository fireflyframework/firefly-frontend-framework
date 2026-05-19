import { Injectable, InjectionToken, Signal, computed, inject, signal } from '@angular/core';
import { FeatureFlagConfig, FlagLoader, FlagSnapshot, FlagSource } from './feature-flag.types';

/**
 * Injection token for the feature-flags module configuration.
 *
 * Provided by `provideFeatureFlags()`. When present, the service
 * loads default flags automatically on first injection.
 */
export const FEATURE_FLAG_CONFIG = new InjectionToken<FeatureFlagConfig>(
  'FEATURE_FLAG_CONFIG',
);

/**
 * Signal-based feature flag service.
 *
 * Provides runtime toggles for conditional feature activation.
 * Flags can be loaded from built-in sources (static, localStorage, endpoint),
 * custom sources registered via `registerSource()`, or a `FlagLoader` function.
 * All queries return reactive signals — UI updates automatically when flags change.
 *
 * Usage:
 * ```typescript
 * const flags = inject(FeatureFlagService);
 * const enabled = flags.isEnabled('new-dashboard'); // Signal<boolean>
 *
 * // Register custom source from product
 * flags.registerSource('firebase', async () => {
 *   const snapshot = await getRemoteConfig();
 *   return snapshot.flags;
 * });
 * await flags.loadFlags('firebase');
 * ```
 */
@Injectable({ providedIn: 'root' })
export class FeatureFlagService {
  private readonly _flags = signal<Map<string, boolean>>(new Map());
  private readonly _computedCache = new Map<string, Signal<boolean>>();
  private readonly _sourceRegistry = new Map<string, FlagLoader>();
  private readonly _version = signal(0);
  private readonly config = inject(FEATURE_FLAG_CONFIG, { optional: true });

  /** Current flags map (read-only). */
  readonly flags = this._flags.asReadonly();

  /**
   * Reactive version counter — incremented on every flag mutation.
   *
   * Useful for reacting to any flag change without tracking individual flags:
   * ```typescript
   * effect(() => {
   *   const v = flagService.flagsChanged();
   *   console.log('Flags updated, version:', v);
   * });
   * ```
   */
  readonly flagsChanged = this._version.asReadonly();

  constructor() {
    if (this.config?.defaults) {
      this.setFlags(this.config.defaults);
    }
  }

  /**
   * Check if a feature flag is enabled.
   *
   * Returns a cached computed signal — safe to call multiple times
   * with the same flag name without creating duplicate signals.
   *
   * @param flagName - Name of the feature flag
   * @returns Reactive signal that emits `true` when the flag is enabled
   */
  isEnabled(flagName: string): Signal<boolean> {
    let cached = this._computedCache.get(flagName);
    if (!cached) {
      cached = computed(() => this._flags().get(flagName) ?? false);
      this._computedCache.set(flagName, cached);
    }
    return cached;
  }

  /**
   * Set a single flag value. Creates the flag if it doesn't exist.
   *
   * @param flagName - Name of the feature flag
   * @param value - Whether the flag is enabled
   */
  setFlag(flagName: string, value: boolean): void {
    this._flags.update((current) => {
      const next = new Map(current);
      next.set(flagName, value);
      return next;
    });
    this._version.update((v) => v + 1);
  }

  /**
   * Merge multiple flags into the current state.
   * Existing flags not in the input are preserved.
   *
   * @param flags - Record mapping flag names to boolean values
   */
  setFlags(flags: Record<string, boolean>): void {
    this._flags.update((current) => {
      const next = new Map(current);
      for (const [key, value] of Object.entries(flags)) {
        next.set(key, value);
      }
      return next;
    });
    this._version.update((v) => v + 1);
  }

  /**
   * Register a custom flag source by name.
   *
   * Products can register their own sources (e.g. LaunchDarkly, Firebase Remote Config)
   * and then load from them using `loadFlags('my-source')`.
   *
   * @param name - Unique source name (e.g. `'firebase'`, `'launchdarkly'`)
   * @param loader - Async function that returns the flag record
   */
  registerSource(name: string, loader: FlagLoader): void {
    this._sourceRegistry.set(name, loader);
  }

  /**
   * Load flags from the specified source.
   *
   * Resolution order:
   * 1. If `config.loader` is provided, it takes precedence over everything
   * 2. If `source` matches a registered custom source, use its loader
   * 3. Otherwise, use the built-in handler (static, localStorage, endpoint)
   *
   * @param source - Where to load flags from (built-in or custom registered name)
   * @param config - Optional config override (defaults to the injected config)
   */
  async loadFlags(source: FlagSource, config?: FeatureFlagConfig): Promise<void> {
    const cfg = config ?? this.config ?? {};

    if (cfg.loader) {
      const flags = await cfg.loader();
      this.setFlags(flags);
      return;
    }

    // Check registry for custom sources
    const registeredLoader = this._sourceRegistry.get(source);
    if (registeredLoader) {
      const flags = await registeredLoader();
      this.setFlags(flags);
      return;
    }

    switch (source) {
      case 'static':
        if (cfg.defaults) {
          this.setFlags(cfg.defaults);
        }
        break;

      case 'localStorage': {
        if (typeof localStorage === 'undefined') break;
        const raw = localStorage.getItem('ff-flags');
        if (raw) {
          const parsed: unknown = JSON.parse(raw);
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            this.setFlags(parsed as Record<string, boolean>);
          }
        }
        break;
      }

      case 'endpoint': {
        if (!cfg.endpointUrl) break;
        const response = await fetch(cfg.endpointUrl);
        if (response.ok) {
          const data: Record<string, boolean> = await response.json();
          this.setFlags(data);
        }
        break;
      }
    }
  }

  /**
   * Load flags from multiple sources sequentially, merging results.
   *
   * Each source's flags are merged into the current state. Later sources
   * override earlier ones for the same flag name.
   *
   * @param sources - Array of source names to load from (built-in or custom)
   * @param config - Optional config override passed to each `loadFlags()` call
   */
  async loadFromSources(sources: FlagSource[], config?: FeatureFlagConfig): Promise<void> {
    for (const source of sources) {
      await this.loadFlags(source, config);
    }
  }

  /**
   * Return a snapshot of the current flag state.
   *
   * @returns Plain object with current flags
   */
  snapshot(): FlagSnapshot {
    return {
      flags: Object.fromEntries(this._flags()),
    };
  }

  /** Clear all flags and the computed cache. */
  clear(): void {
    this._flags.set(new Map());
    this._computedCache.clear();
    this._version.update((v) => v + 1);
  }
}
