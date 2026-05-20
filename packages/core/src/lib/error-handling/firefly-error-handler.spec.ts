import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { FireflyErrorHandler } from './firefly-error-handler';
import { ErrorService } from './error.service';
import { provideErrorHandling } from './provide-error-handling';

describe('FireflyErrorHandler', () => {
  let handler: FireflyErrorHandler;
  let errorService: ErrorService;
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideErrorHandling(), FireflyErrorHandler],
    });

    handler = TestBed.inject(FireflyErrorHandler);
    errorService = TestBed.inject(ErrorService);
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { /* noop */ });
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should register native Error as UNKNOWN_ERROR in ErrorService', () => {
    const error = new TypeError('Cannot read property of undefined');

    handler.handleError(error);

    expect(errorService.lastError()).not.toBeNull();
    expect(errorService.lastError()!.code).toBe('UNKNOWN_ERROR');
    expect(errorService.lastError()!.message).toBe('Cannot read property of undefined');
    expect(errorService.lastError()!.details).toContain('TypeError');
  });

  it('should NOT register HttpErrorResponse in ErrorService (already handled by interceptor)', () => {
    const httpError = new HttpErrorResponse({ status: 500, statusText: 'Internal' });

    handler.handleError(httpError);

    expect(errorService.lastError()).toBeNull();
    expect(errorService.errorHistory()).toHaveLength(0);
  });

  it('should NOT register wrapped HttpErrorResponse in ErrorService', () => {
    const httpError = new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
    const wrapped = { rejection: httpError };

    handler.handleError(wrapped);

    expect(errorService.lastError()).toBeNull();
  });

  it('should unwrap { rejection } and register the inner error', () => {
    const innerError = new RangeError('Out of bounds');
    const wrapped = { rejection: innerError };

    handler.handleError(wrapped);

    expect(errorService.lastError()!.code).toBe('UNKNOWN_ERROR');
    expect(errorService.lastError()!.message).toBe('Out of bounds');
  });

  it('should handle non-Error values (string)', () => {
    handler.handleError('something went wrong');

    expect(errorService.lastError()!.code).toBe('UNKNOWN_ERROR');
    expect(errorService.lastError()!.message).toBe('something went wrong');
    expect(errorService.lastError()!.details).toBe('something went wrong');
  });

  it('should always log to console.error', () => {
    const error = new Error('test');

    handler.handleError(error);

    expect(consoleSpy).toHaveBeenCalledWith('[FireflyErrorHandler]', error);
  });

  it('should log HttpErrorResponse to console even though it skips ErrorService', () => {
    const httpError = new HttpErrorResponse({ status: 500, statusText: 'Internal' });

    handler.handleError(httpError);

    expect(consoleSpy).toHaveBeenCalledWith('[FireflyErrorHandler]', httpError);
    expect(errorService.lastError()).toBeNull();
  });
});
