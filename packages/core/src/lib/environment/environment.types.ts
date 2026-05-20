// ---------------------------------------------------------------------------
// Environment type
// ---------------------------------------------------------------------------

/**
 * Supported runtime environments.
 *
 * Three built-in values are provided with autocomplete support.
 * Products can use any custom string (e.g. `'sandbox'`, `'uat'`).
 *
 * @example
 * ```typescript
 * const env: Environment = 'staging';     // built-in
 * const env: Environment = 'sandbox';     // custom — valid
 * ```
 */
export type Environment = 'dev' | 'staging' | 'production' | (string & {});

// ---------------------------------------------------------------------------
// Environment entry (per-environment config)
// ---------------------------------------------------------------------------

/**
 * Configuration for a single environment.
 *
 * Each environment defines a base API URL, optional per-service
 * URL overrides, and optional runtime flags.
 *
 * @example
 * ```typescript
 * const dev: EnvironmentEntry = {
 *   apiBaseUrl: 'http://localhost:3000',
 *   services: {
 *     lending: 'http://localhost:3001',
 *     auth: 'http://localhost:4000',
 *   },
 *   flags: { enableBeta: true },
 * };
 * ```
 */
export interface EnvironmentEntry {
  /** Base URL for API calls. Used as fallback when no service-specific URL is defined. */
  readonly apiBaseUrl: string;

  /**
   * Optional per-service URL overrides.
   *
   * When `getApiUrl('lending')` is called, the service checks this map first.
   * If not found, it falls back to `apiBaseUrl`.
   */
  readonly services?: Readonly<Record<string, string>>;

  /** Optional runtime flags specific to this environment. */
  readonly flags?: Readonly<Record<string, unknown>>;
}

// ---------------------------------------------------------------------------
// Protected fields
// ---------------------------------------------------------------------------

/**
 * Fields that can be protected against runtime mutation.
 *
 * When a field is listed in `protectedFields`, the corresponding
 * setter (`setEnvironment`, `setApiBaseUrl`, `setFlag`) becomes a
 * no-op and logs a warning in dev mode.
 *
 * - `'currentEnv'`  — blocks `setEnvironment()`
 * - `'apiBaseUrl'`  — blocks `setApiBaseUrl()`
 * - `'flags'`       — blocks `setFlag()`
 */
export type ProtectedField = 'currentEnv' | 'apiBaseUrl' | 'flags';

// ---------------------------------------------------------------------------
// Module configuration
// ---------------------------------------------------------------------------

/**
 * Configuration for `provideEnvironment()`.
 *
 * Defines all available environments, the default one, and optionally
 * which fields are protected against runtime changes.
 *
 * @example
 * ```typescript
 * provideEnvironment({
 *   default: 'dev',
 *   environments: {
 *     dev: { apiBaseUrl: 'http://localhost:3000' },
 *     staging: { apiBaseUrl: 'https://api.stg.firefly.com' },
 *     production: { apiBaseUrl: 'https://api.firefly.com' },
 *   },
 *   protectedFields: ['currentEnv', 'apiBaseUrl'],
 * })
 * ```
 */
export interface EnvironmentConfig {
  /** Environment to activate on startup. */
  readonly default: Environment;

  /** Map of environment name → configuration. */
  readonly environments: Readonly<Record<string, EnvironmentEntry>>;

  /**
   * Fields protected against runtime mutation.
   * Setters for protected fields become no-ops with a console warning.
   * Default: none (all fields mutable).
   */
  readonly protectedFields?: readonly ProtectedField[];
}
