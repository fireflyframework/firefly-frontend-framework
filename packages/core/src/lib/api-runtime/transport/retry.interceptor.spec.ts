import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { retryInterceptor, TRANSPORT_OPTIONS } from './retry.interceptor';
import type { TransportGlobalOptions } from './transport-config';

function setup(options?: TransportGlobalOptions) {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(withInterceptors([retryInterceptor])),
      provideHttpClientTesting(),
      ...(options ? [{ provide: TRANSPORT_OPTIONS, useValue: options }] : []),
    ],
  });

  return {
    http: TestBed.inject(HttpClient),
    httpMock: TestBed.inject(HttpTestingController),
  };
}

describe('retryInterceptor', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should pass through when no retry config is provided', () => {
    const { http, httpMock } = setup();

    http.get('/api/data').subscribe();
    httpMock.expectOne('/api/data').flush({ ok: true });

    httpMock.verify();
  });

  it('should pass through successful responses', () => {
    const { http, httpMock } = setup({ retry: { maxRetries: 2, backoffMs: 100 } });

    http.get('/api/data').subscribe();
    httpMock.expectOne('/api/data').flush({ ok: true });

    httpMock.verify();
  });

  it('should retry on 503 and succeed on retry', () => {
    vi.useFakeTimers();
    const { http, httpMock } = setup({ retry: { maxRetries: 2, backoffMs: 100 } });
    let result: unknown;

    http.get('/api/data').subscribe((r) => (result = r));

    httpMock.expectOne('/api/data').flush('Unavailable', { status: 503, statusText: 'Service Unavailable' });
    vi.advanceTimersByTime(100); // backoff: 100ms * 2^0

    httpMock.expectOne('/api/data').flush({ recovered: true });
    expect(result).toEqual({ recovered: true });
    httpMock.verify();
  });

  it('should exhaust retries and fail', () => {
    vi.useFakeTimers();
    const { http, httpMock } = setup({ retry: { maxRetries: 2, backoffMs: 100 } });
    let errorStatus: number | undefined;

    http.get('/api/data').subscribe({ error: (e) => (errorStatus = e.status) });

    // Attempt 1
    httpMock.expectOne('/api/data').flush('Error', { status: 500, statusText: 'ISE' });
    vi.advanceTimersByTime(100); // backoff 100ms

    // Retry 1
    httpMock.expectOne('/api/data').flush('Error', { status: 500, statusText: 'ISE' });
    vi.advanceTimersByTime(200); // backoff 200ms (exponential)

    // Retry 2 — exhausted
    httpMock.expectOne('/api/data').flush('Error', { status: 500, statusText: 'ISE' });

    expect(errorStatus).toBe(500);
    httpMock.verify();
  });

  it('should retry on network error (status 0)', () => {
    vi.useFakeTimers();
    const { http, httpMock } = setup({ retry: { maxRetries: 1, backoffMs: 50, retryableStatuses: [0] } });
    let result: unknown;

    http.get('/api/data').subscribe((r) => (result = r));

    httpMock.expectOne('/api/data').error(new ProgressEvent('error'));
    vi.advanceTimersByTime(50);

    httpMock.expectOne('/api/data').flush({ ok: true });
    expect(result).toEqual({ ok: true });
    httpMock.verify();
  });

  it('should retry on 408 timeout', () => {
    vi.useFakeTimers();
    const { http, httpMock } = setup({ retry: { maxRetries: 1, backoffMs: 50 } });
    let result: unknown;

    http.get('/api/data').subscribe((r) => (result = r));

    httpMock.expectOne('/api/data').flush('Timeout', { status: 408, statusText: 'Timeout' });
    vi.advanceTimersByTime(50);

    httpMock.expectOne('/api/data').flush({ ok: true });
    expect(result).toEqual({ ok: true });
    httpMock.verify();
  });

  it('should retry on 429 Too Many Requests', () => {
    vi.useFakeTimers();
    const { http, httpMock } = setup({ retry: { maxRetries: 1, backoffMs: 50 } });
    let result: unknown;

    http.get('/api/data').subscribe((r) => (result = r));

    httpMock.expectOne('/api/data').flush('Rate limit', { status: 429, statusText: 'Too Many' });
    vi.advanceTimersByTime(50);

    httpMock.expectOne('/api/data').flush({ ok: true });
    expect(result).toEqual({ ok: true });
    httpMock.verify();
  });

  it('should NOT retry on 400 (not retryable)', () => {
    const { http, httpMock } = setup({ retry: { maxRetries: 2, backoffMs: 100 } });
    let errorStatus: number | undefined;

    http.get('/api/data').subscribe({ error: (e) => (errorStatus = e.status) });

    httpMock.expectOne('/api/data').flush('Bad', { status: 400, statusText: 'Bad Request' });
    expect(errorStatus).toBe(400);
    httpMock.verify();
  });

  it('should NOT retry on 401 (auth handled separately)', () => {
    const { http, httpMock } = setup({ retry: { maxRetries: 2, backoffMs: 100 } });
    let errorStatus: number | undefined;

    http.get('/api/data').subscribe({ error: (e) => (errorStatus = e.status) });

    httpMock.expectOne('/api/data').flush('Unauth', { status: 401, statusText: 'Unauthorized' });
    expect(errorStatus).toBe(401);
    httpMock.verify();
  });

  it('should NOT retry on 404 (not retryable)', () => {
    const { http, httpMock } = setup({ retry: { maxRetries: 2, backoffMs: 100 } });
    let errorStatus: number | undefined;

    http.get('/api/data').subscribe({ error: (e) => (errorStatus = e.status) });

    httpMock.expectOne('/api/data').flush('Not Found', { status: 404, statusText: 'Not Found' });
    expect(errorStatus).toBe(404);
    httpMock.verify();
  });

  it('should NOT retry POST when idempotentOnly is true (default)', () => {
    const { http, httpMock } = setup({ retry: { maxRetries: 2, backoffMs: 100 } });
    let errorStatus: number | undefined;

    http.post('/api/data', {}).subscribe({ error: (e) => (errorStatus = e.status) });

    httpMock.expectOne('/api/data').flush('Error', { status: 503, statusText: 'Unavailable' });
    expect(errorStatus).toBe(503);
    httpMock.verify();
  });

  it('should retry POST when idempotentOnly is false', () => {
    vi.useFakeTimers();
    const { http, httpMock } = setup({
      retry: { maxRetries: 1, backoffMs: 50, idempotentOnly: false },
    });
    let result: unknown;

    http.post('/api/data', {}).subscribe((r) => (result = r));

    httpMock.expectOne('/api/data').flush('Error', { status: 503, statusText: 'Unavailable' });
    vi.advanceTimersByTime(50);

    httpMock.expectOne('/api/data').flush({ ok: true });
    expect(result).toEqual({ ok: true });
    httpMock.verify();
  });

  it('should cap backoff at maxBackoffMs', () => {
    vi.useFakeTimers();
    const { http, httpMock } = setup({
      retry: { maxRetries: 3, backoffMs: 1000, maxBackoffMs: 2000 },
    });
    let result: unknown;

    http.get('/api/data').subscribe((r) => (result = r));

    // Attempt 1 fails
    httpMock.expectOne('/api/data').flush('Error', { status: 500, statusText: 'ISE' });
    // Backoff: min(1000 * 2^0, 2000) = 1000
    vi.advanceTimersByTime(1000);

    // Retry 1 fails
    httpMock.expectOne('/api/data').flush('Error', { status: 500, statusText: 'ISE' });
    // Backoff: min(1000 * 2^1, 2000) = 2000
    vi.advanceTimersByTime(2000);

    // Retry 2 fails
    httpMock.expectOne('/api/data').flush('Error', { status: 500, statusText: 'ISE' });
    // Backoff: min(1000 * 2^2, 2000) = 2000 (capped)
    vi.advanceTimersByTime(2000);

    // Retry 3 succeeds
    httpMock.expectOne('/api/data').flush({ ok: true });
    expect(result).toEqual({ ok: true });
    httpMock.verify();
  });

  it('should respect custom retryableStatuses', () => {
    vi.useFakeTimers();
    const { http, httpMock } = setup({
      retry: { maxRetries: 1, backoffMs: 50, retryableStatuses: [418] },
    });
    let result: unknown;

    http.get('/api/data').subscribe((r) => (result = r));

    httpMock.expectOne('/api/data').flush('Teapot', { status: 418, statusText: "I'm a teapot" });
    vi.advanceTimersByTime(50);

    httpMock.expectOne('/api/data').flush({ ok: true });
    expect(result).toEqual({ ok: true });
    httpMock.verify();
  });
});
