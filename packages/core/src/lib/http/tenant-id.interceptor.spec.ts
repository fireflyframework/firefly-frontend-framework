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

import { tenantIdInterceptor } from './tenant-id.interceptor';
import { HttpHeadersConfig, HTTP_HEADERS_CONFIG } from './http-headers.config';

describe('tenantIdInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  function setup(config?: HttpHeadersConfig): void {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        ...(config ? [{ provide: HTTP_HEADERS_CONFIG, useValue: config }] : []),
        provideHttpClient(withInterceptors([tenantIdInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  }

  afterEach(() => httpMock.verify());

  it('adds the X-Tenant-Id header when a tenantId is configured', () => {
    setup({ tenantId: 'acme' });
    http.get('/api/data').subscribe();

    const req = httpMock.expectOne('/api/data');
    expect(req.request.headers.get('X-Tenant-Id')).toBe('acme');
    req.flush({});
  });

  it('uses a custom header name when configured', () => {
    setup({ tenantId: 'acme', tenantHeaderName: 'X-Org' });
    http.get('/api/data').subscribe();

    const req = httpMock.expectOne('/api/data');
    expect(req.request.headers.get('X-Org')).toBe('acme');
    expect(req.request.headers.has('X-Tenant-Id')).toBe(false);
    req.flush({});
  });

  it('is a no-op when no tenantId is configured', () => {
    setup();
    http.get('/api/data').subscribe();

    const req = httpMock.expectOne('/api/data');
    expect(req.request.headers.has('X-Tenant-Id')).toBe(false);
    req.flush({});
  });
});
