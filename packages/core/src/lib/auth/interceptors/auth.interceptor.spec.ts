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
import { authInterceptor } from './auth.interceptor';
import { provideAuth } from '../provide-auth';
import { provideSession } from '../../session/provide-session';
import { provideUserContext } from '../../user-context/provide-user-context';

/** Flush Promise microtask queue so async interceptor logic completes. */
const flushMicrotasks = () => new Promise((r) => setTimeout(r, 0));

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideAuth(),
        provideSession(),
        provideUserContext(),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should add Bearer token when access token exists', () => {
    localStorage.setItem('ff_access_token', 'my-token');

    http.get('/api/data').subscribe();

    const req = httpMock.expectOne('/api/data');
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-token');
    req.flush({});
  });

  it('should not add token when no access token exists', () => {
    http.get('/api/data').subscribe();

    const req = httpMock.expectOne('/api/data');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('should skip token injection for /auth/login', () => {
    localStorage.setItem('ff_access_token', 'my-token');

    http.post('/api/v1/experience/security/auth/login', {}).subscribe();

    const req = httpMock.expectOne('/api/v1/experience/security/auth/login');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('should skip token injection for /auth/refresh', () => {
    localStorage.setItem('ff_access_token', 'my-token');

    http.post('/api/v1/experience/security/auth/refresh', {}).subscribe();

    const req = httpMock.expectOne(
      '/api/v1/experience/security/auth/refresh',
    );
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('should retry with new token after 401 and successful refresh', async () => {
    localStorage.setItem('ff_access_token', 'old-token');
    localStorage.setItem('ff_refresh_token', 'refresh-tok');

    let responseData: unknown;
    http.get('/api/data').subscribe((data) => (responseData = data));

    // First request gets 401
    const firstReq = httpMock.expectOne('/api/data');
    expect(firstReq.request.headers.get('Authorization')).toBe(
      'Bearer old-token',
    );
    firstReq.flush('Unauthorized', {
      status: 401,
      statusText: 'Unauthorized',
    });

    // Interceptor triggers refresh (request appears synchronously)
    const refreshReq = httpMock.expectOne(
      '/api/v1/experience/security/auth/refresh',
    );
    refreshReq.flush({
      accessToken: 'new-token',
      refreshToken: 'new-refresh',
      expiresIn: 3600,
      tokenType: 'Bearer',
    });

    // Wait for Promise microtask (from() wraps a Promise)
    await flushMicrotasks();

    // Retry with new token
    const retryReq = httpMock.expectOne('/api/data');
    expect(retryReq.request.headers.get('Authorization')).toBe(
      'Bearer new-token',
    );
    retryReq.flush({ result: 'ok' });

    expect(responseData).toEqual({ result: 'ok' });
  });

  it('should propagate 401 when refresh fails', async () => {
    localStorage.setItem('ff_access_token', 'old-token');
    localStorage.setItem('ff_refresh_token', 'refresh-tok');

    let errorStatus: number | undefined;
    http.get('/api/data').subscribe({
      error: (err) => (errorStatus = err.status),
    });

    // First request gets 401
    const firstReq = httpMock.expectOne('/api/data');
    firstReq.flush('Unauthorized', {
      status: 401,
      statusText: 'Unauthorized',
    });

    // Refresh also fails
    const refreshReq = httpMock.expectOne(
      '/api/v1/experience/security/auth/refresh',
    );
    refreshReq.flush('fail', { status: 401, statusText: 'Unauthorized' });

    await flushMicrotasks();

    expect(errorStatus).toBe(401);
  });

  it('should propagate non-401 errors without attempting refresh', () => {
    localStorage.setItem('ff_access_token', 'my-token');

    let errorStatus: number | undefined;
    http.get('/api/data').subscribe({
      error: (err) => (errorStatus = err.status),
    });

    const req = httpMock.expectOne('/api/data');
    req.flush('Server Error', {
      status: 500,
      statusText: 'Internal Server Error',
    });

    httpMock.expectNone('/api/v1/experience/security/auth/refresh');
    expect(errorStatus).toBe(500);
  });
});
