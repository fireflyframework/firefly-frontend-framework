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

import { idempotencyKeyInterceptor } from './idempotency-key.interceptor';
import { HttpHeadersConfig, HTTP_HEADERS_CONFIG } from './http-headers.config';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('idempotencyKeyInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  function setup(config?: HttpHeadersConfig): void {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        ...(config ? [{ provide: HTTP_HEADERS_CONFIG, useValue: config }] : []),
        provideHttpClient(withInterceptors([idempotencyKeyInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  }

  afterEach(() => httpMock.verify());

  it('stamps a UUID idempotency key on POST', () => {
    setup();
    http.post('/api/data', {}).subscribe();

    const req = httpMock.expectOne('/api/data');
    expect(req.request.headers.get('X-Idempotency-Key')).toMatch(UUID_RE);
    req.flush({});
  });

  it('does not stamp read-only requests (GET)', () => {
    setup();
    http.get('/api/data').subscribe();

    const req = httpMock.expectOne('/api/data');
    expect(req.request.headers.has('X-Idempotency-Key')).toBe(false);
    req.flush({});
  });

  it('preserves a caller-set key', () => {
    setup();
    http
      .post('/api/data', {}, { headers: { 'X-Idempotency-Key': 'fixed-key' } })
      .subscribe();

    const req = httpMock.expectOne('/api/data');
    expect(req.request.headers.get('X-Idempotency-Key')).toBe('fixed-key');
    req.flush({});
  });

  it('honours a custom header name', () => {
    setup({ idempotency: { headerName: 'X-Request-Id' } });
    http.put('/api/data', {}).subscribe();

    const req = httpMock.expectOne('/api/data');
    expect(req.request.headers.get('X-Request-Id')).toMatch(UUID_RE);
    req.flush({});
  });

  it('is a no-op when disabled', () => {
    setup({ idempotency: { enabled: false } });
    http.post('/api/data', {}).subscribe();

    const req = httpMock.expectOne('/api/data');
    expect(req.request.headers.has('X-Idempotency-Key')).toBe(false);
    req.flush({});
  });
});
