# @fireflyframework/core

Angular infrastructure for Firefly products.

This package contains the cross-cutting services, providers, guards, directives, interceptors, pipes, and runtime adapters used by Firefly applications.

For ecosystem context, see `../../../firefly-docs/reference/framework-packages.md` from this package directory.

## Installation

```bash
npm install @fireflyframework/core
```

Peer dependencies:

```bash
npm install @angular/core @angular/common @angular/router rxjs @jsverse/transloco @fireflyframework/utils
```

Optional peers used by specific file exporters:

```bash
npm install jspdf jspdf-autotable exceljs
```

## Quick start

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  authInterceptor,
  errorInterceptor,
  provideApiClient,
  provideAuth,
  provideFireflyTransport,
  provideHttpTransport,
  provideSession,
} from '@fireflyframework/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideHttpTransport(),
    provideFireflyTransport({
      defaultProtocol: 'http',
      routes: [
        { service: '*', protocol: 'http', baseUrl: 'https://api.example.com' },
      ],
    }),
    provideApiClient(),
    provideAuth(),
    provideSession(),
  ],
};
```

## Modules

| Module | Provider | Main services | Key exports |
|---|---|---|---|
| Alerts | `provideAlerts()` | `AlertService` | `ALERT_CONFIG`, toast/banner/bottom-sheet/dialog types |
| API runtime | `provideFireflyTransport()`, `provideApiClient()`, `provideHttpTransport()` | `ApiClient`, `TransportRegistry`, `HttpTransportAdapter` | transport config, routes, errors, retry interceptor |
| Auth | `provideAuth()` | `AuthService` | `authGuard`, `authInterceptor` |
| Environment | `provideEnvironment()` | `EnvironmentService` | `ENVIRONMENT_CONFIG` |
| Error handling | `provideErrorHandling()` | `ErrorService`, `FireflyErrorHandler` | `createAppError`, `errorInterceptor`, `ERROR_HANDLING_CONFIG` |
| Event bus | `provideEventBus()` | `EventBusService`, `EventQueueService`, `EventHistoryService` | event types, queue status |
| Feature flags | `provideFeatureFlags()` | `FeatureFlagService` | `FfFeatureFlagDirective`, `FEATURE_FLAG_CONFIG` |
| Files | `provideFiles()` | validation, picker, upload, download, preview, export services | `FILES_CONFIG`, file/export types |
| I18n | `provideI18n()` | `I18nService` | `FfTranslatePipe`, currency/date/percentage/IBAN/NIF pipes |
| Master data | `provideMasterData()` | `MasterDataService` | master-data types |
| Navigation | `provideNavigation()`, `provideBreadcrumb()` | `NavigationService`, `BreadcrumbService` | nav and breadcrumb types |
| Notifications | `provideNotifications()` | `NotificationService` | console/noop/slack/webhook/email adapters |
| Permissions | `providePermissions()`, `provideDynamicPermissions()` | `PermissionService` | `permissionGuard`, `roleGuard`, `dynamicPermissionGuard`, permission/role directives |
| Security | `provideSecurity()` | `SecurityService` | `csrfInterceptor`, PII mask pipe/directive, sanitization helpers |
| Session | `provideSession()` | `SessionService` | `SESSION_TIMEOUT_CONFIG`, `DEFAULT_SESSION_TIMEOUT` |
| Storage | `provideStorage()` | `StorageService` | `STORAGE_CONFIG` |
| Tenant theming | `provideTenantTheming()` | `TenantThemeService` | `TENANT_THEMING_CONFIG` |
| User context | `provideUserContext()` | `UserContextService` | `ROLE_PRIORITY` |

## Transport runtime

The transport runtime decouples product code from protocol-specific clients.

Typical setup:

```typescript
import {
  provideApiClient,
  provideFireflyTransport,
  provideHttpTransport,
} from '@fireflyframework/core';

export const providers = [
  provideHttpTransport(),
  provideFireflyTransport({
    defaultProtocol: 'http',
    routes: [
      { service: 'lending', protocol: 'http', baseUrl: 'https://lending.example.com' },
      { service: '*', protocol: 'http', baseUrl: 'https://api.example.com' },
    ],
    options: {
      retry: {
        maxRetries: 3,
        backoffMs: 500,
        maxBackoffMs: 5000,
        retryableStatuses: [408, 429, 500, 502, 503, 504],
        idempotentOnly: true,
      },
    },
  }),
  provideApiClient(),
];
```

The showcase also registers SSE, WebSocket, and gRPC demo adapters locally. Those adapters are app-level examples, not public exports of this package.

## Auth, session, and user context

Use this block when a product needs authenticated routes, auth headers, inactivity timeout, and decoded user profile state:

```typescript
import {
  authGuard,
  authInterceptor,
  provideAuth,
  provideSession,
  provideUserContext,
} from '@fireflyframework/core';
```

Common integration points:

- `authInterceptor` attaches auth data to outgoing HTTP requests.
- `authGuard` protects Angular routes.
- `SESSION_TIMEOUT_CONFIG` overrides warning and inactivity timings.
- `UserContextService` exposes user profile and role-oriented context.

## Permissions

Permissions can be checked imperatively, through guards, or through structural directives:

```typescript
import {
  HasPermissionDirective,
  HasRoleDirective,
  dynamicPermissionGuard,
  permissionGuard,
  providePermissions,
  roleGuard,
} from '@fireflyframework/core';
```

Use static guards for simple route requirements and dynamic permissions when route access depends on a configured route map or runtime state.

## Files

`provideFiles()` configures upload, validation, preview, download, and export services. CSV export is lightweight; PDF and Excel exporters rely on optional peer dependencies.

The pure exporter helpers are intentionally not re-exported from the package root to avoid forcing optional peers to resolve for consumers that only need basic file services.

## I18n

```typescript
import { provideI18n } from '@fireflyframework/core';

provideI18n({
  defaultLocale: 'es',
  availableLocales: [
    { code: 'es', displayName: 'Espanol' },
    { code: 'en', displayName: 'English' },
  ],
  useMessageFormat: true,
});
```

Templates can use:

```html
{{ 'common.greeting' | ffTranslate }}
{{ amount | ffCurrency:'EUR':'es' }}
{{ createdAt | ffDate:'short':'es' }}
```

## Showcase references

`firefly-showcase` demonstrates most modules under `src/app/features/core-modules` and configures the full provider stack in `src/app/app.config.ts`.

Use the showcase as the first place to add or verify examples when changing this package.

## Commands

```bash
nx build core
nx lint core
```

There is no explicit `test` target in `packages/core/project.json` at the time of writing, even though the package contains `.spec.ts` files. Confirm the intended test command before documenting it as official.
