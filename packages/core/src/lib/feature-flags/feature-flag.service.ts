import { Injectable, InjectionToken, Signal, computed, inject, signal } from '@angular/core';
import { FeatureFlagConfig, FlagSnapshot, FlagSource } from './feature-flag.types';

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
 * Flags can be loaded from static config, localStorage, or a remote
 * endpoint. All queries return reactive signals — UI updates
 * automatically when flags change.
 *
 * Usage:
 * ```typescript
 * const flags = inject(FeatureFlagService);
 * const enabled = flags.isEnabled('new-dashboard'); // Signal<boolean>
 * ```
 */
@Injectable({ providedIn: 'root' })
export class FeatureFlagService {
  private readonly _flags = signal<Map<string, boolean>>(new Map());
  private readonly _computedCache = new Map<string, Signal<boolean>>();
  private readonly config = inject(FEATURE_FLAG_CONFIG, { optional: true });

  /** Current flags map (read-only). */
  readonly flags = this._flags.asReadonly();

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
  }

  /**
   * Load flags from the specified source.
   *
   * @param source - Where to load flags from (`'static'`, `'localStorage'`, `'endpoint'`)
   * @param config - Optional config override (defaults to the injected config)
   */
  async loadFlags(source: FlagSource, config?: FeatureFlagConfig): Promise<void> {
    const cfg = config ?? this.config ?? {};

    if (cfg.loader) {
      const flags = await cfg.loader();
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
  }
}
