import { makeEnvironmentProviders, EnvironmentProviders } from '@angular/core';
import { AuthService, AUTH_CONFIG } from './auth.service';
import { AuthConfig } from './auth.types';

/**
 * Provide the auth module (`AuthService`) and, optionally, its configuration.
 *
 * @param config Optional auth configuration. Supply `loginBodyMapper` when the
 *   backend's login contract differs from the framework's credentials shape.
 *
 * @example
 * ```ts
 * provideAuth({
 *   loginBodyMapper: ({ username, password }) => ({
 *     email: username,
 *     password,
 *     tenantSlug: environment.tenantSlug,
 *   }),
 * });
 * ```
 */
export function provideAuth(config?: AuthConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    AuthService,
    ...(config ? [{ provide: AUTH_CONFIG, useValue: config }] : []),
  ]);
}
