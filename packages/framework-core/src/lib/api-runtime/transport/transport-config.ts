import { TransportProtocol } from './transport-request';
import { TransportRoute } from './transport-route';

/**
 * Transport Layer configuration parsed from firefly.config.yaml.
 *
 * The developer agent (scaffold) generates this configuration in app.config.ts.
 * provideFireflyTransport() consumes it to initialize the TransportRegistry.
 */
export interface TransportConfig {
  /** Default protocol — generates the wildcard '*' route */
  defaultProtocol: TransportProtocol;

  /** Explicit routes per service (override of default) */
  routes: TransportRoute[];

  /** Global timeout and retry options (overridable per route or per request) */
  options?: TransportGlobalOptions;
}

/**
 * Global options for the Transport Layer.
 * Applied to all requests unless explicitly overridden.
 */
export interface TransportGlobalOptions {
  /** Timeout in ms for request-response operations. Default: 30000 */
  timeoutMs?: number;

  /** Default retry configuration */
  retry?: {
    /** Maximum number of retries. Default: 3 */
    maxRetries?: number;
    /** Initial backoff in ms (doubles on each retry). Default: 1000 */
    backoffMs?: number;
    /** Cap of exponential backoff in ms. Default: 30000 */
    maxBackoffMs?: number;
    /** Status codes that allow retry. Default: [408, 429, 500, 502, 503, 504] */
    retryableStatuses?: number[];
    /** If true, only retry idempotent methods (GET, PUT, DELETE, HEAD, OPTIONS). Default: true */
    idempotentOnly?: boolean;
  };

  /** Circuit-breaker configuration. If omitted, not activated (F5+) */
  circuitBreaker?: {
    /** Failures within windowMs to open the circuit. Default: 5 */
    failureThreshold?: number;
    /** Time in Open before transitioning to Half-Open. Default: 30000ms */
    resetTimeoutMs?: number;
    /** Simultaneous probe requests in Half-Open. Default: 1 */
    halfOpenMaxRequests?: number;
    /** Time window for counting failures. Default: 60000ms */
    windowMs?: number;
  };
}
