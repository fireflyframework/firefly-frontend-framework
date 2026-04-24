import { EnvironmentProviders, inject, makeEnvironmentProviders, provideEnvironmentInitializer } from '@angular/core';
import { TransportRegistry } from './transport/transport-registry';
import { TransportConfig } from './transport/transport-config';
import { TransportRoute } from './transport/transport-route';

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
