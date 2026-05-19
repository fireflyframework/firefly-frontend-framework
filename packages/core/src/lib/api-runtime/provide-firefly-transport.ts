import { EnvironmentProviders, inject, makeEnvironmentProviders, provideEnvironmentInitializer } from '@angular/core';
import { TransportRegistry } from './transport/transport-registry';
import { TransportConfig } from './transport/transport-config';
import { TransportRoute } from './transport/transport-route';
import { TRANSPORT_OPTIONS } from './transport/retry.interceptor';

/**
 * Configures the Transport Layer with routes from TransportConfig.
 *
 * Sets up service-to-adapter routing in TransportRegistry, including
 * a wildcard '*' route from config.defaultProtocol.
 *
 * Usage in app.config.ts:
 * ```ts
 * provideFireflyTransport({
 *   defaultProtocol: 'http',
 *   routes: [
 *     { service: 'lending-engine', protocol: 'http', baseUrl: 'https://lending.api.com' },
 *   ],
 * })
 * ```
 *
 * Tree-shakeable: only included when explicitly imported.
 */
export function provideFireflyTransport(config: TransportConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    ...(config.options ? [{ provide: TRANSPORT_OPTIONS, useValue: config.options }] : []),
    provideEnvironmentInitializer(() => {
      const registry = inject(TransportRegistry);

      const wildcardRoute: TransportRoute = {
        service: '*',
        protocol: config.defaultProtocol,
        baseUrl: '',
      };

      registry.setRoutes([...config.routes, wildcardRoute]);
    }),
  ]);
}
