import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
  withNoXsrfProtection,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { DOCUMENT } from '@angular/common';
import { csrfInterceptor } from './csrf.interceptor';
import { SecurityService, SECURITY_CONFIG } from '../security.service';

describe('csrfInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let security: SecurityService;

  function setup(config?: object, cookieStr = '') {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        SecurityService,
        { provide: DOCUMENT, useValue: { cookie: cookieStr } },
        ...(config ? [{ provide: SECURITY_CONFIG, useValue: config }] : []),
        provideHttpClient(
          withInterceptors([csrfInterceptor]),
          withNoXsrfProtection(),
        ),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    security = TestBed.inject(SecurityService);
  }

  afterEach(() => {
    httpMock.verify();
  });

  // -----------------------------------------------------------------
  // Adds header on mutations
  // -----------------------------------------------------------------
  it('should add CSRF header on POST', () => {
    setup(undefined, 'XSRF-TOKEN=tok123');
    http.post('/api/data', {}).subscribe();

    const req = httpMock.expectOne('/api/data');
    expect(req.request.headers.get('X-XSRF-TOKEN')).toBe('tok123');
    req.flush({});
  });

  it('should add CSRF header on PUT', () => {
    setup(undefined, 'XSRF-TOKEN=tok123');
    http.put('/api/data', {}).subscribe();

    const req = httpMock.expectOne('/api/data');
    expect(req.request.headers.get('X-XSRF-TOKEN')).toBe('tok123');
    req.flush({});
  });

  it('should add CSRF header on PATCH', () => {
    setup(undefined, 'XSRF-TOKEN=tok123');
    http.patch('/api/data', {}).subscribe();

    const req = httpMock.expectOne('/api/data');
    expect(req.request.headers.get('X-XSRF-TOKEN')).toBe('tok123');
    req.flush({});
  });

  it('should add CSRF header on DELETE', () => {
    setup(undefined, 'XSRF-TOKEN=tok123');
    http.delete('/api/data').subscribe();

    const req = httpMock.expectOne('/api/data');
    expect(req.request.headers.get('X-XSRF-TOKEN')).toBe('tok123');
    req.flush({});
  });

  // -----------------------------------------------------------------
  // Skips GET
  // -----------------------------------------------------------------
  it('should NOT add header on GET', () => {
    setup(undefined, 'XSRF-TOKEN=tok123');
    http.get('/api/data').subscribe();

    const req = httpMock.expectOne('/api/data');
    expect(req.request.headers.has('X-XSRF-TOKEN')).toBe(false);
    req.flush({});
  });

  // -----------------------------------------------------------------
  // Pass-through when disabled
  // -----------------------------------------------------------------
  it('should pass-through when CSRF is disabled', () => {
    setup({ csrf: { enabled: false } }, 'XSRF-TOKEN=tok123');
    http.post('/api/data', {}).subscribe();

    const req = httpMock.expectOne('/api/data');
    expect(req.request.headers.has('X-XSRF-TOKEN')).toBe(false);
    req.flush({});
  });

  // -----------------------------------------------------------------
  // Pass-through when no token
  // -----------------------------------------------------------------
  it('should pass-through when no token available', () => {
    setup(undefined, '');
    http.post('/api/data', {}).subscribe();

    const req = httpMock.expectOne('/api/data');
    expect(req.request.headers.has('X-XSRF-TOKEN')).toBe(false);
    req.flush({});
  });

  // -----------------------------------------------------------------
  // Custom header name
  // -----------------------------------------------------------------
  it('should use custom header name from config', () => {
    setup({ csrf: { headerName: 'X-MY-CSRF' } }, 'XSRF-TOKEN=tok123');
    http.post('/api/data', {}).subscribe();

    const req = httpMock.expectOne('/api/data');
    expect(req.request.headers.get('X-MY-CSRF')).toBe('tok123');
    req.flush({});
  });

  // -----------------------------------------------------------------
  // Manual token
  // -----------------------------------------------------------------
  it('should use manually set token over cookie', () => {
    setup(undefined, 'XSRF-TOKEN=cookie-tok');
    security.setCsrfToken('manual-tok');
    http.post('/api/data', {}).subscribe();

    const req = httpMock.expectOne('/api/data');
    expect(req.request.headers.get('X-XSRF-TOKEN')).toBe('manual-tok');
    req.flush({});
  });
});
