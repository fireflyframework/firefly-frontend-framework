/** HTTP methods — only relevant for HttpTransportAdapter */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

/** Protocols supported by the Transport Layer */
export type TransportProtocol = 'http' | 'grpc' | 'ws' | 'sse';

/**
 * Protocol-agnostic request.
 *
 * Common fields (service, operation, body, params, headers) are used by all adapters.
 * Protocol-specific fields (method, path) are ignored by adapters that don't need them
 * (e.g. gRPC ignores method and path, uses operation as the RPC name).
 *
 * @typeParam T - Type of the request body (default: unknown)
 */
export interface TransportRequest<T = unknown> {
  /** Target microservice name — resolved by TransportRegistry */
  service: string;

  /** Semantic operation name — mapped from feature.schema.yaml operationId */
  operation: string;

  /** HTTP method — only used by HttpTransportAdapter. Ignored by gRPC/WS/SSE */
  method?: HttpMethod;

  /** Path relative to baseUrl — only used by HttpTransportAdapter. Ignored by gRPC/WS/SSE */
  path?: string;

  /** Request body — serialized by the adapter (JSON for HTTP, Protobuf for gRPC) */
  body?: T;

  /** Query params (HTTP) or generic request parameters */
  params?: Record<string, string>;

  /** HTTP headers or generic metadata propagated by the adapter to the corresponding protocol */
  headers?: Record<string, string>;

  /**
   * Additional protocol metadata — gRPC metadata, WebSocket sub-protocol, etc.
   * Separated from headers to avoid collision with standard HTTP headers.
   */
  metadata?: Record<string, string>;

  /** Per-request timeout in ms (overrides global default) */
  timeoutMs?: number;

  /** Per-request retry options (overrides global default) */
  retry?: {
    maxRetries?: number;
    backoffMs?: number;
    retryableStatuses?: number[];
  };

  /** Force retry on non-idempotent methods (POST, PATCH). Default: false */
  forceRetry?: boolean;

  /** AbortSignal for cancellation. Injected by TimeoutInterceptor, not by feature code */
  signal?: AbortSignal;
}

/**
 * Normalized response independent of the protocol.
 *
 * All adapters normalize their response to this format.
 * - HTTP: status is the HTTP status code, headers are the response headers.
 * - gRPC: status is the gRPC status code mapped to HTTP equivalent, headers are trailing metadata.
 * - WebSocket/SSE: status is always 200 (connection already established), data is the message.
 *
 * @typeParam T - Type of the deserialized data
 */
export interface TransportResponse<T> {
  /** Deserialized response body */
  data: T;

  /** Normalized status code (HTTP status or equivalent) */
  status: number;

  /** Response headers/metadata */
  headers: Record<string, string>;

  /** Response time in ms (measured by the adapter) */
  durationMs: number;
}

/**
 * Protocol-agnostic transfer progress (bytes). The HTTP adapter derives it
 * from Angular's upload/download progress events; other protocols may report
 * it differently or not at all. `total` is `null` when the length is unknown.
 */
export interface TransportProgress {
  /** Bytes transferred so far. */
  loaded: number;
  /** Total bytes, or `null` when the server didn't advertise a length. */
  total: number | null;
}

/**
 * Event emitted by `ApiClient.requestWithProgress` / `TransportAdapter.requestWithProgress`:
 * zero or more interim `progress` events while the payload transfers, then a
 * single terminal `response` event carrying the deserialized data.
 *
 * Intentionally protocol-neutral — it never exposes Angular's `HttpEvent`, so
 * the "feature code never touches HttpClient" rule holds for uploads too.
 *
 * @typeParam T - Type of the deserialized response data
 */
export type TransportProgressEvent<T> =
  | { type: 'progress'; progress: TransportProgress }
  | { type: 'response'; response: TransportResponse<T> };
