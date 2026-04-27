import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTransportAdapter } from './http.adapter';
import { TransportError } from '../../transport/transport-error';
import { TransportRequest } from '../../transport/transport-request';

describe('HttpTransportAdapter', () => {
  let adapter: HttpTransportAdapter;
  let httpTesting: HttpTestingController;

  const baseReq: TransportRequest & { baseUrl: string } = {
    service: 'lending-engine',
    operation: 'getLoan',
    baseUrl: 'https://api.example.com',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        HttpTransportAdapter,
      ],
    });

    adapter = TestBed.inject(HttpTransportAdapter);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should have protocol "http" and correct name', () => {
    expect(adapter.protocol).toBe('http');
    expect(adapter.name).toBe('HttpTransportAdapter');
  });

  describe('request<T> — GET', () => {
    it('should perform a basic GET request and return TransportResponse', async () => {
      const promise = adapter.request<{ id: number }>({ ...baseReq });

      const req = httpTesting.expectOne('https://api.example.com/');
      expect(req.request.method).toBe('GET');
      req.flush({ id: 42 });

      const result = await promise;
      expect(result.data).toEqual({ id: 42 });
      expect(result.status).toBe(200);
      expect(result.durationMs).toBeGreaterThanOrEqual(0);
      expect(result.headers).toBeDefined();
    });

    it('should default method to GET when not specified', async () => {
      const promise = adapter.request({ ...baseReq });

      const req = httpTesting.expectOne('https://api.example.com/');
      expect(req.request.method).toBe('GET');
      req.flush(null);

      await promise;
    });
  });

  describe('request<T> — POST/PUT/DELETE', () => {
    it('should perform POST request with body', async () => {
      const promise = adapter.request({
        ...baseReq,
        method: 'POST',
        path: '/loans',
        body: { amount: 1000 },
      });

      const req = httpTesting.expectOne('https://api.example.com/loans');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ amount: 1000 });
      req.flush({ id: 1 }, { status: 201, statusText: 'Created' });

      const result = await promise;
      expect(result.status).toBe(201);
    });

    it('should perform PUT request', async () => {
      const promise = adapter.request({
        ...baseReq,
        method: 'PUT',
        path: '/loans/1',
        body: { amount: 2000 },
      });

      const req = httpTesting.expectOne('https://api.example.com/loans/1');
      expect(req.request.method).toBe('PUT');
      req.flush(null);

      await promise;
    });

    it('should perform DELETE request', async () => {
      const promise = adapter.request({
        ...baseReq,
        method: 'DELETE',
        path: '/loans/1',
      });

      const req = httpTesting.expectOne('https://api.example.com/loans/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null, { status: 204, statusText: 'No Content' });

      const result = await promise;
      expect(result.status).toBe(204);
    });
  });

  describe('URL building', () => {
    it('should build URL from baseUrl + path', async () => {
      const promise = adapter.request({ ...baseReq, path: '/loans/123' });

      httpTesting.expectOne('https://api.example.com/loans/123').flush(null);

      await promise;
    });

    it('should build URL with query params', async () => {
      const promise = adapter.request({
        ...baseReq,
        path: '/loans',
        params: { status: 'active', page: '1' },
      });

      const req = httpTesting.expectOne(
        (r) => r.urlWithParams.includes('status=active') && r.urlWithParams.includes('page=1'),
      );
      req.flush([]);

      await promise;
    });

    it('should strip trailing slash from baseUrl', async () => {
      const promise = adapter.request({
        ...baseReq,
        baseUrl: 'https://api.example.com/',
        path: '/loans',
      });

      httpTesting.expectOne('https://api.example.com/loans').flush(null);

      await promise;
    });
  });

  describe('headers and metadata', () => {
    it('should merge headers and metadata into request headers', async () => {
      const promise = adapter.request({
        ...baseReq,
        headers: { 'X-Custom': 'value' },
        metadata: { 'X-Trace-Id': 'abc123' },
      });

      const req = httpTesting.expectOne('https://api.example.com/');
      expect(req.request.headers.get('X-Custom')).toBe('value');
      expect(req.request.headers.get('X-Trace-Id')).toBe('abc123');
      req.flush(null);

      await promise;
    });
  });

  describe('error handling', () => {
    it('should throw TransportError with status code on HttpErrorResponse', async () => {
      const promise = adapter.request({ ...baseReq, path: '/fail' });

      httpTesting
        .expectOne('https://api.example.com/fail')
        .flush('Not Found', { status: 404, statusText: 'Not Found' });

      await expect(promise).rejects.toThrow(TransportError);

      try {
        await promise;
      } catch (error) {
        const te = error as TransportError;
        expect(te.statusCode).toBe(404);
        expect(te.protocol).toBe('http');
        expect(te.adapterName).toBe('HttpTransportAdapter');
        expect(te.service).toBe('lending-engine');
        expect(te.operation).toBe('getLoan');
        expect(te.originalError).toBeDefined();
      }
    });

    it('should throw TransportError without status code on network error', async () => {
      const promise = adapter.request({ ...baseReq, path: '/network-fail' });

      httpTesting
        .expectOne('https://api.example.com/network-fail')
        .error(new ProgressEvent('error'));

      await expect(promise).rejects.toThrow(TransportError);

      try {
        await promise;
      } catch (error) {
        const te = error as TransportError;
        expect(te.protocol).toBe('http');
        expect(te.adapterName).toBe('HttpTransportAdapter');
      }
    });
  });

  describe('stream()', () => {
    it('should throw error because HTTP does not support streaming', () => {
      expect(() => adapter.stream(baseReq)).toThrow(/does not support streaming/);
    });
  });

  describe('response structure', () => {
    it('should return response headers as Record<string, string>', async () => {
      const promise = adapter.request({ ...baseReq });

      httpTesting.expectOne('https://api.example.com/').flush({ ok: true });

      const result = await promise;
      expect(typeof result.headers).toBe('object');
      expect(result.headers).not.toBeNull();
    });

    it('should measure durationMs >= 0', async () => {
      const promise = adapter.request({ ...baseReq });

      httpTesting.expectOne('https://api.example.com/').flush({ data: 1 });

      const result = await promise;
      expect(typeof result.durationMs).toBe('number');
      expect(result.durationMs).toBeGreaterThanOrEqual(0);
    });
  });
});
