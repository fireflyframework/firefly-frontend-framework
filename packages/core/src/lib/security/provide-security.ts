import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { SecurityConfig } from './security.types';
import { SecurityService, SECURITY_CONFIG } from './security.service';

/**
 * Configure the security module.
 *
 * Provides `SecurityService` and optionally sets `SecurityConfig`
 * for CSRF protection and PII masking behavior.
 *
 * **Important:** This does NOT register `csrfInterceptor`. CSRF
 * protection requires the interceptor to be added separately:
 *
 * ```ts
 * import { csrfInterceptor, provideSecurity } from '@fireflyframework/core';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideHttpClient(withInterceptors([csrfInterceptor])),
 *     provideSecurity({ csrf: { enabled: true } }),
 *   ],
 * };
 * ```
 *
 * @param config - Optional security configuration. Defaults apply if omitted.
 * @returns EnvironmentProviders to register in the application config
 */
export function provideSecurity(
  config?: SecurityConfig,
): EnvironmentProviders {
  return makeEnvironmentProviders([
    SecurityService,
    ...(config ? [{ provide: SECURITY_CONFIG, useValue: config }] : []),
  ]);
}
