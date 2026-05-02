import { Injectable, signal, computed } from '@angular/core';
import { TransportProtocol } from './transport-request';
import { TransportAdapter } from './transport-adapter';
import { TransportError } from './transport-error';
import { TransportRoute, ResolvedTransport } from './transport-route';

/**
 * Central router of the Transport Layer.
 *
 * Maintains:
 * 1. A map of registered adapters, indexed by protocol (http -> HttpTransportAdapter, etc.)
 * 2. An array of routes, configured from firefly.config.yaml (service -> protocol + baseUrl)
 *
 * Resolution algorithm (resolve):
 * 1. Find exact route by service name
 * 2. If no exact match, use wildcard route (service: '*')
 * 3. If no wildcard, throw TransportError
 * 4. With the resolved route, find the registered adapter for that protocol
 * 5. If no adapter for that protocol, throw TransportError
 *
 * The registry is immutable after bootstrap. Routes are loaded once from
 * configuration and adapters are registered in the providers.
 * No dynamic re-routing at runtime.
 */
@Injectable({ providedIn: 'root' })
export class TransportRegistry {
  /** Configured routes — loaded from firefly.config.yaml by provideFireflyTransport() */
  private readonly routes = signal<TransportRoute[]>([]);

  /** Registered adapters — indexed by protocol */
  private readonly adapters = new Map<TransportProtocol, TransportAdapter>();

  /** Reactive signal: currently registered protocols (for debug/logging) */
  readonly registeredProtocols = computed(() =>
    Array.from(this.adapters.keys()),
  );

  /** Reactive signal: services with explicit route (for debug/logging) */
  readonly configuredServices = computed(() =>
    this.routes().map(r => r.service),
  );

  /**
   * Register an adapter for a protocol.
   *
   * Called by provider functions (provideHttpTransport(), provideGrpcTransport(), etc.)
   * during application bootstrap. If an adapter is already registered for this protocol,
   * it replaces it (useful for testing: register MockTransportAdapter over the real one).
   *
   * @param adapter - Transport adapter instance to register
   */
  registerAdapter(adapter: TransportAdapter): void {
    this.adapters.set(adapter.protocol, adapter);
  }

  /**
   * Load routes from configuration.
   *
   * Called once by provideFireflyTransport() during bootstrap.
   *
   * @param routes - Array of service-to-protocol route mappings
   */
  setRoutes(routes: TransportRoute[]): void {
    this.routes.set(routes);
  }

  /**
   * Resolve which adapter and route to use for a service.
   *
   * @param service - Service name (e.g. 'lending-engine')
   * @returns ResolvedTransport with the adapter and the route
   * @throws TransportError if no route/wildcard found, or no adapter for the protocol
   */
  resolve(service: string): ResolvedTransport {
    // 1. Find exact route
    const exactRoute = this.routes().find(r => r.service === service);

    // 2. Fallback to wildcard
    const route = exactRoute ?? this.routes().find(r => r.service === '*');

    if (!route) {
      throw new TransportError(
        `No transport route configured for service '${service}' and no wildcard ('*') fallback found. ` +
          `Add a route in firefly.config.yaml backend.transport.routes.`,
        'http',
        'TransportRegistry',
        service,
        'resolve',
      );
    }

    // 3. Find adapter for the route's protocol
    const adapter = this.adapters.get(route.protocol);

    if (!adapter) {
      throw new TransportError(
        `No adapter registered for protocol '${route.protocol}'. ` +
          `Add provide${capitalize(route.protocol)}Transport() to your app.config.ts providers.`,
        route.protocol,
        'TransportRegistry',
        service,
        'resolve',
      );
    }

    // 4. Expand baseUrl template if it contains {service}
    const expandedRoute: TransportRoute = {
      ...route,
      baseUrl: route.baseUrl.replace('{service}', service),
    };

    return { adapter, route: expandedRoute };
  }

  /**
   * Destroy all registered adapters.
   * Called by the EnvironmentInjector teardown.
   */
  destroyAll(): void {
    this.adapters.forEach(adapter => adapter.destroy());
    this.adapters.clear();
  }
}

/**
 * Capitalize first letter — inline to avoid circular dependency with utils.
 *
 * @param s - String to capitalize
 * @returns String with the first character uppercased
 */
function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
