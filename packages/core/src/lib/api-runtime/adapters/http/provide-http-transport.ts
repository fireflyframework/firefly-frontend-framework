import { EnvironmentProviders, inject, makeEnvironmentProviders, provideEnvironmentInitializer } from '@angular/core';
import { TransportRegistry } from '../../transport/transport-registry';
import { HttpTransportAdapter } from './http.adapter';

/**
 * Registers HttpTransportAdapter in the TransportRegistry.
 *
 * Usage in app.config.ts:
 * ```ts
 * provideHttpTransport()
 * ```
 *
 * Tree-shakeable: if not imported, HttpTransportAdapter is excluded from the bundle.
 */
export function provideHttpTransport(): EnvironmentProviders {
  return makeEnvironmentProviders([
    HttpTransportAdapter,
    provideEnvironmentInitializer(() => {
      const registry = inject(TransportRegistry);
      const adapter = inject(HttpTransportAdapter);
      registry.registerAdapter(adapter);
    }),
  ]);
}
