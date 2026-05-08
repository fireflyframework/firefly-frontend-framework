// ---------------------------------------------------------------------------
// Color mode
// ---------------------------------------------------------------------------

/** Color mode for tenant theming. 'system' resolves via prefers-color-scheme. */
export type ColorMode = 'light' | 'dark' | 'system';

// ---------------------------------------------------------------------------
// Branding configuration (loaded from backend)
// ---------------------------------------------------------------------------

/**
 * Branding configuration for a tenant.
 *
 * Mapped from the backend BrandingController response.
 * The `tokens` / `darkTokens` maps contain CSS custom property
 * names (e.g. `--ff-color-primary-600`) as keys and CSS values as values.
 */
export interface BrandingConfig {
  /** Unique branding identifier (UUID from backend). */
  readonly id: string;
  /** Human-readable branding name. */
  readonly name: string;
  /** Optional description. */
  readonly description?: string;
  /** Whether this branding is the light or dark variant. */
  readonly type: 'light' | 'dark';
  /** Whether this is the default branding for the tenant. */
  readonly isDefault: boolean;
  /** Tenant logo URL. Applied dynamically by the service. */
  readonly logoUrl?: string;
  /** Tenant favicon URL. Applied dynamically by the service. */
  readonly faviconUrl?: string;
  /** Optional custom font family name. */
  readonly fontFamily?: string;
  /** Optional loading animation URL (e.g. Lottie JSON). */
  readonly loadingAnimationUrl?: string;
  /**
   * CSS custom property overrides for light mode.
   * Keys must match DS token names (e.g. `--ff-color-primary-600`).
   */
  readonly tokens: Record<string, string>;
  /**
   * CSS custom property overrides for dark mode.
   * Applied on top of `tokens` when dark mode is active.
   * If omitted, the DS dark defaults are used.
   */
  readonly darkTokens?: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Service state (internal, exposed as readonly signals)
// ---------------------------------------------------------------------------

/** Internal state shape managed by TenantThemeService. */
export interface TenantThemeState {
  /** Currently applied branding configuration, or null before first load. */
  readonly config: BrandingConfig | null;
  /** Resolved color mode (never 'system' — resolved to 'light' or 'dark'). */
  readonly resolvedMode: 'light' | 'dark';
  /** User-selected color mode preference (may be 'system'). */
  readonly preferredMode: ColorMode;
  /** Whether branding is currently being loaded. */
  readonly isLoading: boolean;
  /** Last loading error message, or null if no error. */
  readonly error: string | null;
}

// ---------------------------------------------------------------------------
// Provider configuration
// ---------------------------------------------------------------------------

/**
 * Configuration for `provideTenantTheming()`.
 *
 * The product supplies a `loader` function that fetches branding
 * from its own backend. The framework calls it at bootstrap via
 * `provideAppInitializer()`.
 */
export interface TenantThemingConfig {
  /**
   * Async function that loads the branding configuration.
   * Called once at application bootstrap.
   * If it throws, the app continues with DS defaults.
   */
  loader: () => Promise<BrandingConfig>;
  /** Initial color mode preference. Default: 'system'. */
  defaultColorMode?: ColorMode;
  /** localStorage key for persisting color mode. Default: 'ff-color-mode'. */
  storageKey?: string;
}
