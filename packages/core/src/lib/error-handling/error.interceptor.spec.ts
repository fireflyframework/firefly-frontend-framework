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
import { errorInterceptor } from './error.interceptor';
import { ErrorService } from './error.service';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let errorService: ErrorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    errorService = TestBed.inject(ErrorService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should pass through successful responses without recording errors', () => {
    http.get('/api/data').subscribe();

    const req = httpMock.expectOne('/api/data');
    req.flush({ ok: true });

    expect(errorService.lastError()).toBeNull();
  });

  it('should map 400 to VALIDATION_ERROR', () => {
    http.get('/api/data').subscribe({ error: () => { /* noop */ } });

    const req = httpMock.expectOne('/api/data');
    req.flush({ field: 'name' }, { status: 400, statusText: 'Bad Request' });

    expect(errorService.lastError()).not.toBeNull();
    expect(errorService.lastError()!.code).toBe('VALIDATION_ERROR');
    expect(errorService.lastError()!.status).toBe(400);
    expect(errorService.lastError()!.details).toEqual({ field: 'name' });
  });

  it('should NOT map 401 — skip to let authInterceptor handle it', () => {
    http.get('/api/data').subscribe({ error: () => { /* noop */ } });

    const req = httpMock.expectOne('/api/data');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(errorService.lastError()).toBeNull();
    expect(errorService.errorHistory()).toHaveLength(0);
  });

  it('should map 403 to FORBIDDEN', () => {
    http.get('/api/data').subscribe({ error: () => { /* noop */ } });

    const req = httpMock.expectOne('/api/data');
    req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });

    expect(errorService.lastError()!.code).toBe('FORBIDDEN');
    expect(errorService.lastError()!.status).toBe(403);
  });

  it('should map 404 to NOT_FOUND', () => {
    http.get('/api/data').subscribe({ error: () => { /* noop */ } });

    const req = httpMock.expectOne('/api/data');
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });

    expect(errorService.lastError()!.code).toBe('NOT_FOUND');
    expect(errorService.lastError()!.status).toBe(404);
  });

  it('should map 408 to TIMEOUT_ERROR', () => {
    http.get('/api/data').subscribe({ error: () => { /* noop */ } });

    const req = httpMock.expectOne('/api/data');
    req.flush('Timeout', { status: 408, statusText: 'Request Timeout' });

    expect(errorService.lastError()!.code).toBe('TIMEOUT_ERROR');
    expect(errorService.lastError()!.status).toBe(408);
  });

  it('should map 0 to NETWORK_ERROR', () => {
    http.get('/api/data').subscribe({ error: () => { /* noop */ } });

    const req = httpMock.expectOne('/api/data');
    req.error(new ProgressEvent('error'));

    expect(errorService.lastError()!.code).toBe('NETWORK_ERROR');
    expect(errorService.lastError()!.status).toBe(0);
  });

  it('should map 500 to SERVER_ERROR', () => {
    http.get('/api/data').subscribe({ error: () => { /* noop */ } });

    const req = httpMock.expectOne('/api/data');
    req.flush('Internal', { status: 500, statusText: 'Internal Server Error' });

    expect(errorService.lastError()!.code).toBe('SERVER_ERROR');
    expect(errorService.lastError()!.status).toBe(500);
  });

  it('should map 503 to SERVER_ERROR', () => {
    http.get('/api/data').subscribe({ error: () => { /* noop */ } });

    const req = httpMock.expectOne('/api/data');
    req.flush('Unavailable', { status: 503, statusText: 'Service Unavailable' });

    expect(errorService.lastError()!.code).toBe('SERVER_ERROR');
    expect(errorService.lastError()!.status).toBe(503);
  });

  it('should map 422 to UNKNOWN_ERROR (other 4xx)', () => {
    http.get('/api/data').subscribe({ error: () => { /* noop */ } });

    const req = httpMock.expectOne('/api/data');
    req.flush('Unprocessable', { status: 422, statusText: 'Unprocessable Entity' });

    expect(errorService.lastError()!.code).toBe('UNKNOWN_ERROR');
    expect(errorService.lastError()!.status).toBe(422);
  });

  it('should re-throw the original HttpErrorResponse', () => {
    let caughtStatus: number | undefined;
    http.get('/api/data').subscribe({
      error: (err) => (caughtStatus = err.status),
    });

    const req = httpMock.expectOne('/api/data');
    req.flush('Error', { status: 500, statusText: 'Internal Server Error' });

    expect(caughtStatus).toBe(500);
  });
});
