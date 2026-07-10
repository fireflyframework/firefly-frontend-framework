import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError as rxThrowError } from 'rxjs';
import { ApiClient } from './api-client.service';
import { TransportRegistry } from './transport/transport-registry';
import { TransportAdapter } from './transport/transport-adapter';
import { TransportError } from './transport/transport-error';
import {
  TransportProgressEvent,
  TransportProtocol,
  TransportRequest,
  TransportResponse,
} from './transport/transport-request';
import { provideApiClient } from './provide-api-client';
import { provideFireflyTransport } from './provide-firefly-transport';

/** Minimal mock adapter for testing */
class MockTransportAdapter extends TransportAdapter {
  readonly protocol: TransportProtocol = 'http';
  readonly name = 'MockAdapter';

  requestSpy = vi.fn<[TransportRequest & { baseUrl: string }], Promise<TransportResponse<unknown>>>();
  streamSpy = vi.fn<[TransportRequest & { baseUrl: string }], Observable<unknown>>();
  progressSpy = vi.fn<[TransportRequest & { baseUrl: string }], Observable<TransportProgressEvent<unknown>>>();

  override request<T>(req: TransportRequest): Promise<TransportResponse<T>> {
    return this.requestSpy(req as TransportRequest & { baseUrl: string }) as Promise<TransportResponse<T>>;
  }

  override stream<T>(req: TransportRequest): Observable<T> {
    return this.streamSpy(req as TransportRequest & { baseUrl: string }) as Observable<T>;
  }

  override requestWithProgress<T>(req: TransportRequest): Observable<TransportProgressEvent<T>> {
    return this.progressSpy(
      req as TransportRequest & { baseUrl: string },
    ) as Observable<TransportProgressEvent<T>>;
  }
}

describe('ApiClient', () => {
  let apiClient: ApiClient;
  let registry: TransportRegistry;
  let mockAdapter: MockTransportAdapter;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideApiClient(), provideFireflyTransport({ defaultProtocol: 'http', routes: [] })] });
    apiClient = TestBed.inject(ApiClient);
    registry = TestBed.inject(TransportRegistry);

    mockAdapter = new MockTransportAdapter();
    registry.registerAdapter(mockAdapter);
    registry.setRoutes([
      { service: 'lending-engine', protocol: 'http', baseUrl: 'https://lending.api.com' },
      { service: '*', protocol: 'http', baseUrl: 'https://default.api.com' },
    ]);
  });

  describe('request<T>', () => {
    it('should resolve adapter and return response data', async () => {
      mockAdapter.requestSpy.mockResolvedValue({
        data: { id: 1, name: 'Loan' },
        status: 200,
        headers: {},
        durationMs: 50,
      });

      const result = await apiClient.request<{ id: number; name: string }>({
        service: 'lending-engine',
        operation: 'getLoan',
      });

      expect(result).toEqual({ id: 1, name: 'Loan' });
    });

    it('should pass baseUrl from resolved route to adapter', async () => {
      mockAdapter.requestSpy.mockResolvedValue({
        data: null,
        status: 200,
        headers: {},
        durationMs: 10,
      });

      await apiClient.request({ service: 'lending-engine', operation: 'list' });

      expect(mockAdapter.requestSpy).toHaveBeenCalledWith(
        expect.objectContaining({ baseUrl: 'https://lending.api.com' }),
      );
    });

    it('should propagate TransportError from adapter', async () => {
      const transportError = new TransportError(
        'Request failed',
        'http',
        'MockAdapter',
        'lending-engine',
        'getLoan',
        500,
      );
      mockAdapter.requestSpy.mockRejectedValue(transportError);

      await expect(
        apiClient.request({ service: 'lending-engine', operation: 'getLoan' }),
      ).rejects.toThrow(TransportError);
    });

    it('should use wildcard route for unknown services', async () => {
      mockAdapter.requestSpy.mockResolvedValue({
        data: 'ok',
        status: 200,
        headers: {},
        durationMs: 5,
      });

      await apiClient.request({ service: 'unknown-service', operation: 'ping' });

      expect(mockAdapter.requestSpy).toHaveBeenCalledWith(
        expect.objectContaining({ baseUrl: 'https://default.api.com' }),
      );
    });

    it('should forward request fields to adapter', async () => {
      mockAdapter.requestSpy.mockResolvedValue({
        data: null,
        status: 201,
        headers: {},
        durationMs: 10,
      });

      await apiClient.request({
        service: 'lending-engine',
        operation: 'createLoan',
        method: 'POST',
        path: '/loans',
        body: { amount: 1000 },
        headers: { 'X-Custom': 'value' },
      });

      expect(mockAdapter.requestSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/loans',
          body: { amount: 1000 },
          headers: { 'X-Custom': 'value' },
        }),
      );
    });
  });

  describe('stream<T>', () => {
    it('should resolve adapter and return Observable', () => {
      mockAdapter.streamSpy.mockReturnValue(of({ event: 'update', data: 42 }));

      const result: unknown[] = [];
      apiClient.stream<{ event: string; data: number }>({
        service: 'lending-engine',
        operation: 'loanEvents',
      }).subscribe(msg => result.push(msg));

      expect(result).toEqual([{ event: 'update', data: 42 }]);
    });

    it('should pass baseUrl from resolved route to adapter', () => {
      mockAdapter.streamSpy.mockReturnValue(of('msg'));

      apiClient.stream({ service: 'lending-engine', operation: 'events' }).subscribe();

      expect(mockAdapter.streamSpy).toHaveBeenCalledWith(
        expect.objectContaining({ baseUrl: 'https://lending.api.com' }),
      );
    });

    it('should propagate errors via catchError', () => {
      const streamError = new TransportError(
        'Stream failed',
        'http',
        'MockAdapter',
        'lending-engine',
        'events',
      );
      mockAdapter.streamSpy.mockReturnValue(rxThrowError(() => streamError));

      let caughtError: unknown;
      apiClient.stream({ service: 'lending-engine', operation: 'events' }).subscribe({
        error: (err) => { caughtError = err; },
      });

      expect(caughtError).toBeInstanceOf(TransportError);
      expect((caughtError as TransportError).message).toBe('Stream failed');
    });

    it('should throw if adapter does not support streaming', () => {
      // Default MockTransportAdapter has streamSpy, but let's use a plain adapter
      // that inherits the default stream() which throws
      class NoStreamAdapter extends TransportAdapter {
        readonly protocol: TransportProtocol = 'http';
        readonly name = 'NoStreamAdapter';
        override request<T>(): Promise<TransportResponse<T>> {
          return Promise.resolve({ data: {} as T, status: 200, headers: {}, durationMs: 0 });
        }
        // stream() inherits default → throws Error
      }

      const noStreamAdapter = new NoStreamAdapter();
      registry.registerAdapter(noStreamAdapter);

      expect(() =>
        apiClient.stream({ service: 'lending-engine', operation: 'events' }),
      ).toThrow(/does not support streaming/);
    });
  });

  describe('registry errors', () => {
    it('should throw TransportError when no route found', async () => {
      registry.setRoutes([]); // Clear all routes including wildcard

      await expect(
        apiClient.request({ service: 'unknown', operation: 'op' }),
      ).rejects.toThrow(TransportError);
    });

    it('should throw TransportError when no adapter for protocol', () => {
      registry.setRoutes([
        { service: 'grpc-service', protocol: 'grpc', baseUrl: 'https://grpc.com' },
      ]);

      expect(() =>
        apiClient.stream({ service: 'grpc-service', operation: 'events' }),
      ).toThrow(TransportError);
    });
  });

  describe('requestWithProgress<T> (FW-017)', () => {
    it('delegates to the resolved adapter and forwards baseUrl', () => {
      mockAdapter.progressSpy.mockReturnValue(
        of<TransportProgressEvent<unknown>>({
          type: 'response',
          response: { data: { ok: true }, status: 200, headers: {}, durationMs: 1 },
        }),
      );

      const events: TransportProgressEvent<unknown>[] = [];
      apiClient
        .requestWithProgress({ service: 'lending-engine', operation: 'upload' })
        .subscribe((e) => events.push(e));

      expect(mockAdapter.progressSpy).toHaveBeenCalledTimes(1);
      expect(mockAdapter.progressSpy.mock.calls[0][0].baseUrl).toBe(
        'https://lending.api.com',
      );
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('response');
    });
  });
});
