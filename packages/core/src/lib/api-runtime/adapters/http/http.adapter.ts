import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
  HttpEvent,
  HttpEventType,
  HttpResponse,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, filter, firstValueFrom, map, throwError } from 'rxjs';
import { TransportAdapter } from '../../transport/transport-adapter';
import { TransportError } from '../../transport/transport-error';
import {
  TransportProgressEvent,
  TransportProtocol,
  TransportRequest,
  TransportResponse,
} from '../../transport/transport-request';

/**
 * HTTP adapter that wraps Angular HttpClient.
 *
 * Translates TransportRequest to HttpClient.request() and normalizes
 * HttpResponse/HttpErrorResponse to TransportResponse/TransportError.
 *
 * This adapter does NOT handle:
 * - Auth headers -> SecurityInterceptor (security module)
 * - CSRF -> CsrfInterceptor (security module)
 * - Retry -> RetryInterceptor cross-protocol (G14)
 * - Correlation ID -> ApiClient injects it before reaching here
 *
 * Angular HTTP interceptors (authInterceptor from PASO 1.9) are applied
 * automatically because HttpClient executes them in its pipeline.
 *
 * Registered via provideHttpTransport() — not providedIn: 'root'
 * to enable tree-shaking when not used.
 */
@Injectable()
export class HttpTransportAdapter extends TransportAdapter {
  readonly protocol: TransportProtocol = 'http';
  readonly name = 'HttpTransportAdapter';

  private readonly http = inject(HttpClient);

  async request<T>(req: TransportRequest & { baseUrl: string }): Promise<TransportResponse<T>> {
    const url = this.buildUrl(req.baseUrl, req.path, req.params);
    const method = req.method ?? 'GET';
    const headers = this.buildHeaders(req.headers, req.metadata);
    const startTime = performance.now();

    try {
      const httpResponse = await firstValueFrom(
        this.http.request<T>(method, url, {
          body: req.body,
          headers,
          observe: 'response',
        }),
      );

      const durationMs = Math.round(performance.now() - startTime);

      return {
        data: httpResponse.body as T,
        status: httpResponse.status,
        headers: this.headersToRecord(httpResponse.headers),
        durationMs,
      };
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        throw new TransportError(
          `HTTP ${error.status} ${error.statusText} — ${method} ${url}`,
          this.protocol,
          this.name,
          req.service,
          req.operation,
          error.status,
          error,
        );
      }

      throw new TransportError(
        `HTTP request failed — ${method} ${url}: ${String(error)}`,
        this.protocol,
        this.name,
        req.service,
        req.operation,
        undefined,
        error,
      );
    }
  }

  /**
   * Request-response with transfer progress, using HttpClient's
   * `reportProgress` + `observe: 'events'` internally and translating each
   * `HttpEvent` into a protocol-neutral {@link TransportProgressEvent}. The
   * raw `HttpEvent` never leaves this adapter, so callers stay HttpClient-free.
   */
  requestWithProgress<T>(
    req: TransportRequest & { baseUrl: string },
  ): Observable<TransportProgressEvent<T>> {
    const url = this.buildUrl(req.baseUrl, req.path, req.params);
    const method = req.method ?? 'POST';
    const headers = this.buildHeaders(req.headers, req.metadata);
    const startTime = performance.now();

    return this.http
      .request<T>(method, url, {
        body: req.body,
        headers,
        reportProgress: true,
        observe: 'events',
      })
      .pipe(
        filter(
          (event) =>
            event.type === HttpEventType.UploadProgress ||
            event.type === HttpEventType.DownloadProgress ||
            event.type === HttpEventType.Response,
        ),
        map((event) => this.toProgressEvent<T>(event, startTime)),
        catchError((error) =>
          throwError(() => this.toTransportError(error, method, url, req)),
        ),
      );
  }

  /** Map an upload/download/response `HttpEvent` to a neutral progress event. */
  private toProgressEvent<T>(
    event: HttpEvent<T>,
    startTime: number,
  ): TransportProgressEvent<T> {
    if (
      event.type === HttpEventType.UploadProgress ||
      event.type === HttpEventType.DownloadProgress
    ) {
      return {
        type: 'progress',
        progress: { loaded: event.loaded, total: event.total ?? null },
      };
    }

    const response = event as HttpResponse<T>;
    return {
      type: 'response',
      response: {
        data: response.body as T,
        status: response.status,
        headers: this.headersToRecord(response.headers),
        durationMs: Math.round(performance.now() - startTime),
      },
    };
  }

  /** Normalize an HttpClient error to a {@link TransportError}. */
  private toTransportError(
    error: unknown,
    method: string,
    url: string,
    req: TransportRequest,
  ): TransportError {
    if (error instanceof HttpErrorResponse) {
      return new TransportError(
        `HTTP ${error.status} ${error.statusText} — ${method} ${url}`,
        this.protocol,
        this.name,
        req.service,
        req.operation,
        error.status,
        error,
      );
    }
    return new TransportError(
      `HTTP request failed — ${method} ${url}: ${String(error)}`,
      this.protocol,
      this.name,
      req.service,
      req.operation,
      undefined,
      error,
    );
  }

  // stream<T>() inherits default from TransportAdapter (throws error).
  // For streaming, use SseTransportAdapter or WsTransportAdapter.

  // destroy() inherits default (no-op). HTTP requests are stateless.

  /** Build final URL: baseUrl + path + query params */
  private buildUrl(baseUrl: string, path?: string, params?: Record<string, string>): string {
    const normalizedPath = path?.startsWith('/') ? path : `/${path ?? ''}`;
    const url = `${baseUrl.replace(/\/$/, '')}${normalizedPath}`;

    if (!params || Object.keys(params).length === 0) {
      return url;
    }

    const searchParams = new URLSearchParams(params);
    return `${url}?${searchParams.toString()}`;
  }

  /** Merge request headers + metadata into HttpHeaders */
  private buildHeaders(
    headers?: Record<string, string>,
    metadata?: Record<string, string>,
  ): HttpHeaders {
    return new HttpHeaders({ ...headers, ...metadata });
  }

  /** Convert Angular HttpHeaders to Record<string, string> */
  private headersToRecord(headers: HttpHeaders): Record<string, string> {
    const record: Record<string, string> = {};
    for (const key of headers.keys()) {
      record[key] = headers.get(key) ?? '';
    }
    return record;
  }
}
