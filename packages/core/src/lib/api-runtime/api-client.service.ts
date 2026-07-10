import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { TransportRegistry } from './transport/transport-registry';
import { TransportProgressEvent, TransportRequest } from './transport/transport-request';
import { TransportError } from './transport/transport-error';

/**
 * Protocol-agnostic facade for backend communication.
 *
 * FUNDAMENTAL RULE: feature code NEVER imports HttpClient, grpc-web,
 * WebSocket or EventSource directly. Always use ApiClient.
 *
 * ApiClient does not know about protocols — it delegates to TransportRegistry
 * to resolve the correct adapter based on the product's YAML configuration.
 *
 * Responsibilities:
 * 1. Resolve adapter via TransportRegistry
 * 2. Execute request/stream via the resolved adapter
 * 3. Propagate errors as TransportError
 *
 * What it does NOT do:
 * - Transform data (that's the feature service's job)
 * - Cache (that's TanStack Query via injectQuery)
 * - Retry (that's RetryInterceptor cross-protocol, G14)
 * - Handle auth headers (that's SecurityInterceptor)
 */
@Injectable()
export class ApiClient {
  private readonly registry = inject(TransportRegistry);

  // TODO(PASO-2.2): inject LoggerService — add request/response logging with timing
  // TODO(PASO-2.2): inject CorrelationIdService — add X-Correlation-ID header propagation

  /**
   * Execute a protocol-agnostic request-response operation.
   *
   * @typeParam T - Type of the expected response data
   * @param req - Request with service, operation, and optional data
   * @returns Promise with the deserialized data (just T, no TransportResponse wrapper)
   * @throws TransportError if resolution, request, or timeout fails
   */
  async request<T>(req: TransportRequest): Promise<T> {
    const { adapter, route } = this.registry.resolve(req.service);

    // TODO(PASO-2.2): enrich headers with X-Correlation-ID from CorrelationIdService
    // TODO(PASO-2.2): logger.debug('transport.request.start', { service, operation, protocol })

    const response = await adapter.request<T>({
      ...req,
      baseUrl: route.baseUrl,
    } as TransportRequest & { baseUrl: string });

    // TODO(PASO-2.2): logger.debug('transport.request.end', { service, operation, status, durationMs })

    return response.data;
  }

  /**
   * Open a protocol-agnostic data stream.
   *
   * @typeParam T - Type of each message emitted by the stream
   * @param req - Request with service and operation
   * @returns Observable that emits stream messages
   * @throws TransportError if the adapter doesn't support streaming or connection fails
   */
  stream<T>(req: TransportRequest): Observable<T> {
    const { adapter, route } = this.registry.resolve(req.service);

    // TODO(PASO-2.2): enrich headers with X-Correlation-ID from CorrelationIdService
    // TODO(PASO-2.2): logger.debug('transport.stream.start', { service, operation, protocol })

    return adapter.stream<T>({
      ...req,
      baseUrl: route.baseUrl,
    } as TransportRequest & { baseUrl: string }).pipe(
      catchError((error) => {
        // TODO(PASO-2.2): logger.error('transport.stream.error', { service, operation, error })
        return throwError(() => error);
      }),
    );
  }

  /**
   * Execute a request-response operation while reporting transfer progress —
   * for uploads/downloads that drive a progress bar.
   *
   * Emits protocol-neutral {@link TransportProgressEvent}s (interim `progress`
   * with bytes loaded/total, then a terminal `response`). The underlying
   * `HttpClient` stays hidden in the adapter, so feature code keeps the
   * "never import HttpClient" rule even for uploads.
   *
   * @typeParam T - Type of the expected response data
   * @param req - Request with service, operation, and optional body
   * @returns Observable of progress + response events
   * @throws TransportError if the resolved adapter can't report progress
   */
  requestWithProgress<T>(req: TransportRequest): Observable<TransportProgressEvent<T>> {
    const { adapter, route } = this.registry.resolve(req.service);

    return adapter
      .requestWithProgress<T>({
        ...req,
        baseUrl: route.baseUrl,
      } as TransportRequest & { baseUrl: string })
      .pipe(catchError((error) => throwError(() => error)));
  }
}
