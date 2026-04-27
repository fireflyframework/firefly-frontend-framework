import { TransportProtocol } from './transport-request';
import { TransportAdapter } from './transport-adapter';

/**
 * Configuration of a route for a service.
 *
 * Maps a service name to a protocol and baseUrl.
 * Derived from firefly.config.yaml section backend.transport (G9-004/G9-010).
 *
 * The service '*' (wildcard) acts as fallback for services without explicit route.
 * There should be EXACTLY one wildcard — if there is none, services without
 * explicit route will fail with TransportError.
 */
export interface TransportRoute {
  /**
   * Target service name.
   * - Exact name: 'lending-engine', 'exp-security', etc.
   * - Wildcard: '*' — fallback for services without explicit route.
   */
  service: string;

  /** Protocol to use for this service */
  protocol: TransportProtocol;

  /**
   * Base URL of the service.
   * The adapter concatenates the path/operation to this URL.
   * Supports template: 'https://{service}.firefly.bank' expands with the service name.
   */
  baseUrl: string;

  /**
   * Protocol-specific options for this route.
   * - HTTP: { withCredentials?: boolean }
   * - gRPC: { packageName?: string, useTls?: boolean }
   * - WebSocket: { reconnectIntervalMs?: number, maxReconnectAttempts?: number }
   * - SSE: { withCredentials?: boolean }
   */
  options?: Record<string, unknown>;
}

/**
 * Result of TransportRegistry.resolve().
 *
 * Packages the concrete adapter together with the resolved route
 * so that ApiClient can execute the request without knowing the protocol.
 */
export interface ResolvedTransport {
  /** Concrete adapter that will execute the request */
  adapter: TransportAdapter;

  /** Resolved route with baseUrl and options for the service */
  route: TransportRoute;
}
