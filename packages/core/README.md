# @fireflyframework/core

Angular services, providers, pipes, and guards for the Firefly Frontend Framework.

## Installation

```bash
npm install @fireflyframework/core
```

### Peer dependencies

```bash
npm install @angular/core @angular/common @angular/router rxjs @jsverse/transloco @fireflyframework/utils
```

## Modules

| Module | Provider | Service | Key exports |
|--------|----------|---------|-------------|
| Auth | `provideAuth()` | `AuthService` | `authGuard`, `authInterceptor` |
| Session | `provideSession()` | `SessionService` | `SESSION_TIMEOUT_CONFIG` |
| User context | — | `UserContextService` | — |
| API runtime | `provideApiRuntime()` | `ApiClient` | `TransportRegistry`, `HttpTransportAdapter` |
| Permissions | `providePermissions()` | `PermissionService` | `permissionGuard`, `roleGuard`, `HasPermissionDirective` |
| Master data | `provideMasterData()` | `MasterDataService` | — |
| Navigation | `provideNavigation()` | `NavigationService` | `BreadcrumbService` |
| Alerts | `provideAlerts()` | `AlertService` | `ALERT_CONFIG` |
| Tenant theming | `provideTenantTheming()` | `TenantThemeService` | `TENANT_THEMING_CONFIG` |
| I18n | `provideI18n()` | `I18nService` | `FfTranslatePipe`, formatting pipes |

## Quick start

```typescript
// app.config.ts
import { provideI18n } from '@fireflyframework/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideI18n({
      defaultLocale: 'es',
      availableLocales: [
        { code: 'es', label: 'Espanol' },
        { code: 'en', label: 'English' },
      ],
    }),
  ],
};
```

```html
<!-- template -->
{{ 'common.greeting' | ffTranslate }}
{{ amount | ffCurrency:'es' }}
```

## License

Private — Firefly Framework
