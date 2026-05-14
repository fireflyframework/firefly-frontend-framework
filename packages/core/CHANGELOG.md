# Changelog

All notable changes to `@fireflyframework/core` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/fireflyframework/firefly-frontend-framework/compare/core@0.6.2...HEAD
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
