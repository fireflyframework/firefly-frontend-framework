# Changelog

All notable changes to `@fireflyframework/core` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.12.0] - 2026-05-20

### Added
- Security module: `provideSecurity(config?)` factory with `SECURITY_CONFIG` injection token
- `SecurityService` — signal-based CSRF config management, cookie/manual token read, SSR-safe
- `csrfInterceptor` — functional HTTP interceptor, adds CSRF header on mutation requests (POST/PUT/PATCH/DELETE)
- PII masking utilities: `maskNif()`, `maskCard()`, `maskPhone()`, `maskEmail()`, `maskIban()`
- `FfPiiMaskPipe` — standalone pipe for template-based PII masking (`{{ value | ffPiiMask:'nif' }}`)
- `FfPiiMaskDirective` — attribute directive with toggle show/hide and event emission
- HTML sanitization utilities: `sanitizeHtml()`, `escapeXss()`, `stripTags()`
- Types: `PiiFieldType`, `PiiMaskingMode`, `CsrfConfig`, `SecurityConfig`

## [0.11.0] - 2026-05-20

### Changed
- **BREAKING:** All 16 services now require explicit registration via `provideX()` factory functions
- Removed `providedIn: 'root'` from 12 services: ErrorService, FeatureFlagService, NavigationService, BreadcrumbService, PermissionService, AlertService, MasterDataService, TransportRegistry, ApiClient, AuthService, UserContextService, SessionService
- Updated 7 existing factories to register their service class (provideErrorHandling, provideFeatureFlags, provideNavigation, providePermissions, provideAlerts, provideMasterData, provideFireflyTransport)

### Added
- `provideAuth()` — factory for AuthService registration
- `provideSession(config?)` — factory for SessionService registration (accepts optional `SessionTimeoutConfig`)
- `provideBreadcrumb()` — factory for BreadcrumbService registration
- `provideApiClient()` — factory for ApiClient registration
- `provideUserContext()` — factory for UserContextService registration

### Migration
- Applications MUST add `provideAuth()`, `provideSession()`, `provideBreadcrumb()`, `provideApiClient()`, and `provideUserContext()` to their `app.config.ts` providers
- Tests that inject services directly MUST include the corresponding `provideX()` in `TestBed.configureTestingModule({ providers: [...] })`

## [0.10.1] - 2026-05-20

### Added
- `setServiceUrl(service, url)` — runtime override of individual service URLs
- `'services'` added to `ProtectedField` union type — blocks `setServiceUrl()` when listed in `protectedFields`
- `getApiUrl(service)` now checks runtime service overrides first (priority: serviceOverrides > config services > apiBaseUrlOverride > apiBaseUrl)
- Service URL overrides are cleared on `setEnvironment()`, `loadConfig()`, and `reset()`

## [0.10.0] - 2026-05-20

### Added
- Environment module: `EnvironmentService`, `provideEnvironment()`, `ENVIRONMENT_CONFIG`
- Runtime environment management with signal-based state (`currentEnv`, `config`)
- Multi-environment configuration: dev, staging, production, and custom environments
- API URL resolution: `getApiUrl(service?)` with per-service overrides and base URL fallback
- Environment detection: `isDev()`, `isStaging()`, `isProduction()`
- Runtime flags: `getFlag(key)`, `setFlag(key, value)`
- Runtime mutation: `setEnvironment()`, `setApiBaseUrl()` with optional field protection
- Protected fields: `protectedFields` config blocks setters with console warning
- External config loading: `loadEnvironment(url)` fetches JSON (APP_INITIALIZER compatible)
- Programmatic loading: `loadConfig(config)` as base primitive
- Full reset: `reset()` restores state to last `loadConfig()` snapshot
- Types: `Environment`, `EnvironmentEntry`, `EnvironmentConfig`, `ProtectedField`

## [0.9.0] - 2026-05-19

### Added
- Storage module: `StorageService`, `provideStorage()`, `STORAGE_CONFIG`
- Typed abstraction over `localStorage` and `sessionStorage` with automatic JSON serialization
- Namespace prefixing (configurable prefix, default `ff`) to prevent key collisions across apps
- TTL support: `setWithTTL()` with lazy expiration on `get()`/`has()`
- SSR/restricted environment fallback: in-memory `Map` adapter when Storage API is unavailable
- Full API: `get`, `set`, `remove`, `clear`, `setWithTTL`, `has`, `keys`
- Types: `StorageType`, `StorageConfig`, `StorageEntry`

## [0.8.0] - 2026-05-19

### Added
- Feature flags module: `FeatureFlagService`, `provideFeatureFlags()`, `FEATURE_FLAG_CONFIG`
- Structural directive: `FfFeatureFlagDirective` (`*ffFeatureFlag`) for conditional rendering based on flag state
- Built-in flag sources: `static` (inline defaults), `localStorage` (persisted), `endpoint` (remote HTTP)
- Custom source registry: `registerSource(name, loader)` — products can register their own flag providers (LaunchDarkly, Firebase, etc.)
- Multi-source composition: `loadFromSources(sources[])` — load and merge from multiple sources sequentially
- Change notifications: `flagsChanged` signal — reactive version counter incremented on every flag mutation
- Types: `FlagSource`, `BuiltInFlagSource`, `FeatureFlagConfig`, `FlagSnapshot`, `FlagLoader`

## [0.7.2] - 2026-05-19

### Added
- `retryInterceptor` — functional `HttpInterceptorFn` with exponential backoff for transient HTTP errors (408, 429, 500, 502, 503, 504)
- `TRANSPORT_OPTIONS` injection token — exposes `TransportGlobalOptions` to interceptors at runtime
- Configurable retry: `maxRetries`, `backoffMs`, `maxBackoffMs`, `retryableStatuses`, `idempotentOnly`
- Idempotent-only filter: by default only retries GET, PUT, DELETE, HEAD, OPTIONS (POST skipped unless `idempotentOnly: false`)

## [0.7.1] - 2026-05-18

### Added
- `ErrorOrigin` type — classifies error source as `'global'`, `'http'`, or `'programmatic'`
- `AppError.origin` field — set automatically by `FireflyErrorHandler` (`global`), `errorInterceptor` (`http`), or defaults to `programmatic` via `createAppError()`
- `BuiltinErrorCode` type — the 7 built-in error codes extracted as a named type
- `CustomErrorCodes` interface — extensible via module augmentation for product-specific error codes
- `ErrorCode` type now equals `BuiltinErrorCode | keyof CustomErrorCodes`

## [0.7.0] - 2026-05-14

### Added
- Error handling module: `ErrorService`, `provideErrorHandling()`, `ERROR_HANDLING_CONFIG`
- `errorInterceptor` — HTTP error classification (400, 403, 404, 408, 500+, network errors). 401 intentionally skipped (handled by `authInterceptor`)
- `FireflyErrorHandler` — replaces Angular default `ErrorHandler` for uncaught error capture
- `createAppError()` factory function for creating typed `AppError` instances
- Types: `AppError`, `ErrorCode`, `ErrorHandlingConfig`

## [0.6.3] - 2026-05-14

### Fixed
- `provideI18n()`: register `MessageFormatTranspiler` as flat provider instead of nested `EnvironmentProviders` — fixes ICU expressions rendering as raw text

## [0.6.2] - 2026-05-14

### Added
- ICU Message Format support via `@jsverse/transloco-messageformat` (opt-in)
- `useMessageFormat` flag in `I18nConfig` — enables pluralization and select expressions
- Optional peer dependency on `@jsverse/transloco-messageformat` ^8.3.0

## [0.6.1] - 2026-05-14

### Fixed
- `I18nService.switchLocale()`: load translations via `transloco.load()` before calling `setActiveLang()` — Transloco v8 does not auto-load on lang change

## [0.6.0] - 2026-05-08

### Added
- I18n module: `I18nService`, `provideI18n()`, `I18N_CONFIG`
- Translation pipe: `FfTranslatePipe` (`{{ key | ffTranslate }}`)
- Formatting pipes: `FfCurrencyPipe`, `FfDatePipe`, `FfPercentagePipe`, `FfIbanPipe`, `FfNifPipe`
- Types: `SupportedLocale`, `LocaleDefinition`, `I18nConfig`, `I18nState`
- Peer dependency on `@jsverse/transloco` ^8.3.0
- Peer dependency on `@fireflyframework/utils` >=0.1.0

## [0.5.0] - 2026-05-06

### Added
- Tenant theming module: `TenantThemeService`, `provideTenantTheming()`, `TENANT_THEMING_CONFIG`
- Types: `BrandingConfig`, `TenantThemeState`, `ColorMode`, `TenantThemingConfig`
- CSS custom properties injection, dark mode toggle, localStorage persistence

## [0.4.0] - 2026-05-03

### Added
- Alert service module: `AlertService`, `provideAlerts()`, `ALERT_CONFIG`
- Toast, banner, bottom sheet, and dialog support with signal-based state
- Types: `Toast`, `Banner`, `Dialog`, `BottomSheet`, `AlertConfig`

## [0.3.1] - 2026-04-30

### Added
- Dynamic permission guard: `dynamicPermissionGuard`, `provideDynamicPermissions()`
- Runtime permission resolution from API endpoints

## [0.3.0] - 2026-04-29

### Added
- Navigation module: `NavigationService`, `BreadcrumbService`, `provideNavigation()`
- Types: `NavItem`, `BreadcrumbItem`, `NavigationConfig`

## [0.2.0] - 2026-04-28

### Added
- Master data module: `MasterDataService`, `provideMasterData()`
- Types: `MasterDataSource`, `MasterDataState`

## [0.1.1] - 2026-04-26

### Added
- Permissions module: `PermissionService`, `providePermissions()`
- Guards: `permissionGuard`, `roleGuard`
- Directives: `HasPermissionDirective`, `HasRoleDirective`

## [0.1.0] - 2026-04-22

### Added
- Initial release of `@fireflyframework/core`
- Auth module: `AuthService`, `authGuard`, `authInterceptor`
- Session module: `SessionService`, `SESSION_TIMEOUT_CONFIG`
- User context module: `UserContextService`
- API runtime module: `ApiClient`, `TransportRegistry`, `HttpTransportAdapter`

[Unreleased]: https://github.com/fireflyframework/firefly-frontend-framework/compare/core@0.11.0...HEAD
[0.11.0]: https://github.com/fireflyframework/firefly-frontend-framework/compare/core@0.10.1...core@0.11.0
[0.10.0]: https://github.com/fireflyframework/firefly-frontend-framework/compare/core@0.9.0...core@0.10.0
[0.9.0]: https://github.com/fireflyframework/firefly-frontend-framework/compare/core@0.8.0...core@0.9.0
[0.8.0]: https://github.com/fireflyframework/firefly-frontend-framework/compare/core@0.7.2...core@0.8.0
[0.7.2]: https://github.com/fireflyframework/firefly-frontend-framework/compare/core@0.7.1...core@0.7.2
[0.7.1]: https://github.com/fireflyframework/firefly-frontend-framework/compare/core@0.7.0...core@0.7.1
[0.7.0]: https://github.com/fireflyframework/firefly-frontend-framework/compare/core@0.6.3...core@0.7.0
[0.6.3]: https://github.com/fireflyframework/firefly-frontend-framework/compare/core@0.6.2...core@0.6.3
[0.6.2]: https://github.com/fireflyframework/firefly-frontend-framework/compare/core@0.6.1...core@0.6.2
[0.6.1]: https://github.com/fireflyframework/firefly-frontend-framework/compare/core@0.6.0...core@0.6.1
[0.6.0]: https://github.com/fireflyframework/firefly-frontend-framework/compare/core@0.5.0...core@0.6.0
[0.5.0]: https://github.com/fireflyframework/firefly-frontend-framework/compare/core@0.4.0...core@0.5.0
[0.4.0]: https://github.com/fireflyframework/firefly-frontend-framework/compare/core@0.3.1...core@0.4.0
[0.3.1]: https://github.com/fireflyframework/firefly-frontend-framework/compare/core@0.3.0...core@0.3.1
[0.3.0]: https://github.com/fireflyframework/firefly-frontend-framework/compare/core@0.2.0...core@0.3.0
[0.2.0]: https://github.com/fireflyframework/firefly-frontend-framework/compare/core@0.1.1...core@0.2.0
[0.1.1]: https://github.com/fireflyframework/firefly-frontend-framework/compare/core@0.1.0...core@0.1.1
[0.1.0]: https://github.com/fireflyframework/firefly-frontend-framework/releases/tag/core@0.1.0
