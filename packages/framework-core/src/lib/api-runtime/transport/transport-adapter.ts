import { Observable } from 'rxjs';
import { TransportProtocol, TransportRequest, TransportResponse } from './transport-request';

/**
 * Abstract base class that defines the contract for a transport adapter.
 *
 * Each protocol (HTTP, gRPC, WebSocket, SSE) implements this class.
 * The TransportRegistry resolves which adapter to use based on YAML configuration.
 *
 * Contract:
 * - `request<T>()` is REQUIRED — every adapter must support request-response.
 * - `stream<T>()` is OPTIONAL — only adapters with native streaming implement it.
 *   The default throws an error so the developer knows this adapter doesn't support streaming.
 * - `destroy()` is OPTIONAL — for cleanup of persistent connections (WS, gRPC channel).
 *
 * Tree-shaking: each adapter lives in its own file + provider function.
 * If a product doesn't import provideGrpcTransport(), GrpcTransportAdapter won't be in the bundle.
 */
export abstract class TransportAdapter {
  /** Protocol identifier implemented by this adapter */
  abstract readonly protocol: TransportProtocol;

  /** Descriptive adapter name (for logs and debug) */
  abstract readonly name: string;

  /**
   * Execute a request-response operation.
   *
   * @param req - Protocol-agnostic request. The adapter extracts the fields it needs.
   * @returns Promise with the normalized response
   * @throws TransportError if the request fails (timeout, network, protocol error)
   */
  abstract request<T>(req: TransportRequest): Promise<TransportResponse<T>>;

  /**
   * Open a data stream.
   *
   * Only adapters with native streaming (WebSocket, SSE, gRPC server-streaming)
   * implement this method. Others throw an error.
   *
   * @param req - Protocol-agnostic request
   * @returns Observable that emits stream messages
   * @throws Error if the adapter does not support streaming
   */
  stream<T>(req: TransportRequest): Observable<T> {
    throw new Error(
      `TransportAdapter [${this.name}] (protocol: ${this.protocol}) does not support streaming. ` +
        `Use an adapter that supports stream() (ws, sse, grpc) or use request() instead.`,
    );
  }

  /**
   * Clean up adapter resources (persistent connections, channels, etc.).
   *
   * Called automatically by provideFireflyTransport() on injector teardown.
   * Only needed for stateful adapters (WebSocket connections, gRPC channels).
   * HTTP adapter doesn't need cleanup — each request is independent.
   */
  destroy(): void {
    // Default no-op — stateful adapters (WS, gRPC) override this
  }
}
