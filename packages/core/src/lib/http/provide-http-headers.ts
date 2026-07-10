import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import { HttpHeadersConfig, HTTP_HEADERS_CONFIG } from './http-headers.config';

/**
 * Configure the generic HTTP header interceptors (tenant id + idempotency key).
 *
 * **Important:** this does NOT register the interceptors. Add them explicitly
 * so the application controls ordering:
 *
 * ```ts
 * import {
 *   idempotencyKeyInterceptor,
 *   provideHttpHeaders,
 *   tenantIdInterceptor,
 * } from '@fireflyframework/core';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideHttpClient(
 *       withInterceptors([tenantIdInterceptor, idempotencyKeyInterceptor]),
 *     ),
 *     provideHttpHeaders({ tenantId: environment.tenantId }),
 *   ],
 * };
 * ```
 *
 * @param config Optional header configuration. Omitting it leaves both
 *   interceptors as no-ops (the default empty config).
 */
export function provideHttpHeaders(
  config?: HttpHeadersConfig,
): EnvironmentProviders {
  return makeEnvironmentProviders([
    ...(config ? [{ provide: HTTP_HEADERS_CONFIG, useValue: config }] : []),
  ]);
}
