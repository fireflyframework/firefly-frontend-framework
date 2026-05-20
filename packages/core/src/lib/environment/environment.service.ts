import { Injectable, InjectionToken, Signal, inject, signal, computed } from '@angular/core';
import type {
  Environment,
  EnvironmentConfig,
  EnvironmentEntry,
  ProtectedField,
} from './environment.types';

/**
 * Injection token for the environment module configuration.
 *
 * Provided by `provideEnvironment()`. When absent, the service starts
 * with minimal defaults (env `'dev'`, apiBaseUrl `'http://localhost'`).
 */
export const ENVIRONMENT_CONFIG = new InjectionToken<EnvironmentConfig>(
  'ENVIRONMENT_CONFIG',
);

/** Minimal fallback entry when no config is provided. */
const DEFAULT_ENTRY: EnvironmentEntry = {
  apiBaseUrl: 'http://localhost',
};

/**
 * Service that manages runtime environment configuration.
 *
 * Provides access to the active environment, API URLs per service,
 * runtime flags, and supports runtime mutation with optional
 * field protection.
 *
 * Unlike Angular's static `environment.ts`, this service is dynamic:
 * configuration can be loaded from an external JSON file or injected
 * programmatically, and the active environment can change at runtime.
 *
 * Usage:
 * ```typescript
 * const env = inject(EnvironmentService);
 *
 * // Load config programmatically
 * env.loadConfig({
 *   default: 'dev',
 *   environments: {
 *     dev: { apiBaseUrl: 'http://localhost:3000' },
 *     production: { apiBaseUrl: 'https://api.firefly.com' },
 *   },
 * });
 *
 * env.getApiUrl();            // 'http://localhost:3000'
 * env.getApiUrl('lending');   // resolves service-specific URL or fallback
 * env.isDev();                // true
 * ```
 */
@Injectable()
export class EnvironmentService {
  // ---------------------------------------------------------------------------
  // Internal state
  // ---------------------------------------------------------------------------

  private readonly _currentEnv = signal<Environment>('dev');
  private readonly _config = signal<EnvironmentConfig | null>(null);

  /**
   * Snapshot of the config at the time of the last `loadConfig()` call.
   * Used by `reset()` to restore the original state.
   */
  private _originalConfig: EnvironmentConfig | null = null;
  private _originalEnv: Environment = 'dev';

  /** Runtime override for apiBaseUrl (set by `setApiBaseUrl()`). */
  private _apiBaseUrlOverride: string | null = null;

  /** Runtime overrides for individual flags (set by `setFlag()`). */
  private readonly _flagOverrides = new Map<string, unknown>();

  // ---------------------------------------------------------------------------
  // Public signals (readonly)
  // ---------------------------------------------------------------------------

  /** The currently active environment name. */
  readonly currentEnv: Signal<Environment> = this._currentEnv.asReadonly();

  /** The full environment configuration, or `null` if not loaded. */
  readonly config: Signal<EnvironmentConfig | null> = computed(() => this._config());

  // ---------------------------------------------------------------------------
  // Constructor
  // ---------------------------------------------------------------------------

  constructor() {
    const injectedConfig = inject(ENVIRONMENT_CONFIG, { optional: true });
    if (injectedConfig) {
      this.loadConfig(injectedConfig);
    }
  }

  // ---------------------------------------------------------------------------
  // Loading
  // ---------------------------------------------------------------------------

  /**
   * Load environment configuration programmatically.
   *
   * This is the base primitive — all other loading methods delegate to it.
   * Sets the active environment to `config.default` and stores the config
   * as the baseline for `reset()`.
   *
   * @param config - Full environment configuration
   */
  loadConfig(config: EnvironmentConfig): void {
    this._config.set(config);
    this._currentEnv.set(config.default);
    this._originalConfig = config;
    this._originalEnv = config.default;
    this._apiBaseUrlOverride = null;
    this._flagOverrides.clear();
  }

  /**
   * Load environment configuration from an external JSON file.
   *
   * Fetches the JSON and delegates to `loadConfig()`. Usable as an
   * `APP_INITIALIZER` factory.
   *
   * If no URL is provided and a config was injected via
   * `ENVIRONMENT_CONFIG`, this is a no-op (config already loaded
   * in the constructor).
   *
   * @param configUrl - URL to fetch the JSON configuration from
   * @returns Promise that resolves when the config is loaded
   *
   * @example
   * ```typescript
   * // In app.config.ts as APP_INITIALIZER
   * {
   *   provide: APP_INITIALIZER,
   *   useFactory: () => {
   *     const env = inject(EnvironmentService);
   *     return () => env.loadEnvironment('/assets/env-config.json');
   *   },
   *   multi: true,
   * }
   * ```
   */
  async loadEnvironment(configUrl?: string): Promise<void> {
    if (!configUrl) return;

    const response = await fetch(configUrl);
    const config: EnvironmentConfig = await response.json();
    this.loadConfig(config);
  }

  // ---------------------------------------------------------------------------
  // Getters
  // ---------------------------------------------------------------------------

  /**
   * Get the API base URL for the current environment.
   *
   * If a `service` name is provided, checks the environment's `services`
   * map first. Falls back to `apiBaseUrl` if the service is not found.
   *
   * Respects `setApiBaseUrl()` overrides (applied to the base URL only,
   * not to service-specific URLs).
   *
   * @param service - Optional service name for service-specific URL resolution
   * @returns The resolved API URL
   */
  getApiUrl(service?: string): string {
    const entry = this._getCurrentEntry();

    // Service-specific URL takes priority
    if (service && entry.services?.[service]) {
      return entry.services[service];
    }

    // apiBaseUrl override takes priority over config
    if (this._apiBaseUrlOverride !== null) {
      return this._apiBaseUrlOverride;
    }

    return entry.apiBaseUrl;
  }

  /**
   * Check if the current environment is `'dev'`.
   */
  isDev(): boolean {
    return this._currentEnv() === 'dev';
  }

  /**
   * Check if the current environment is `'staging'`.
   */
  isStaging(): boolean {
    return this._currentEnv() === 'staging';
  }

  /**
   * Check if the current environment is `'production'`.
   */
  isProduction(): boolean {
    return this._currentEnv() === 'production';
  }

  /**
   * Get a runtime flag value for the current environment.
   *
   * Checks `setFlag()` overrides first, then the environment's `flags` map.
   *
   * @param key - Flag key
   * @returns The flag value, or `undefined` if not found
   */
  getFlag(key: string): unknown {
    // Check runtime overrides first
    if (this._flagOverrides.has(key)) {
      return this._flagOverrides.get(key);
    }

    const entry = this._getCurrentEntry();
    return entry.flags?.[key];
  }

  // ---------------------------------------------------------------------------
  // Mutation (respects protectedFields)
  // ---------------------------------------------------------------------------

  /**
   * Change the active environment at runtime.
   *
   * Clears `apiBaseUrl` and flag overrides since they belonged to
   * the previous environment context.
   *
   * Blocked when `'currentEnv'` is in `protectedFields`.
   *
   * @param env - Environment name to switch to
   */
  setEnvironment(env: Environment): void {
    if (this._isProtected('currentEnv')) return;
    this._currentEnv.set(env);
    this._apiBaseUrlOverride = null;
    this._flagOverrides.clear();
  }

  /**
   * Override the API base URL at runtime.
   *
   * This override takes priority over the config's `apiBaseUrl` but
   * NOT over service-specific URLs.
   *
   * Blocked when `'apiBaseUrl'` is in `protectedFields`.
   *
   * @param url - New base URL
   */
  setApiBaseUrl(url: string): void {
    if (this._isProtected('apiBaseUrl')) return;
    this._apiBaseUrlOverride = url;
  }

  /**
   * Override a single runtime flag at runtime.
   *
   * Overrides take priority over the environment's `flags` map.
   *
   * Blocked when `'flags'` is in `protectedFields`.
   *
   * @param key - Flag key
   * @param value - Flag value
   */
  setFlag(key: string, value: unknown): void {
    if (this._isProtected('flags')) return;
    this._flagOverrides.set(key, value);
  }

  /**
   * Reset the service to the state after the last `loadConfig()` call.
   *
   * Restores the original environment, clears all runtime overrides
   * (apiBaseUrl and flag overrides).
   */
  reset(): void {
    if (this._originalConfig) {
      this._config.set(this._originalConfig);
      this._currentEnv.set(this._originalEnv);
    }
    this._apiBaseUrlOverride = null;
    this._flagOverrides.clear();
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Get the EnvironmentEntry for the currently active environment.
   * Returns DEFAULT_ENTRY if the environment is not found in the config.
   */
  private _getCurrentEntry(): EnvironmentEntry {
    const cfg = this._config();
    if (!cfg) return DEFAULT_ENTRY;
    return cfg.environments[this._currentEnv()] ?? DEFAULT_ENTRY;
  }

  /**
   * Check if a field is protected against runtime mutation.
   * Logs a warning if the field is protected.
   */
  private _isProtected(field: ProtectedField): boolean {
    const cfg = this._config();
    if (!cfg?.protectedFields?.includes(field)) return false;

    console.warn(
      `[EnvironmentService] Cannot modify "${field}" — it is listed in protectedFields.`,
    );
    return true;
  }
}
