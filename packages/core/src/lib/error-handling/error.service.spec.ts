import { TestBed } from '@angular/core/testing';
import { ErrorService, ERROR_HANDLING_CONFIG } from './error.service';
import { createAppError } from './app-error';
import type { AppError } from './app-error';
import { provideErrorHandling } from './provide-error-handling';

describe('ErrorService', () => {
  let service: ErrorService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideErrorHandling()] });
    service = TestBed.inject(ErrorService);
  });

  it('should start with lastError as null', () => {
    expect(service.lastError()).toBeNull();
  });

  it('should start with empty errorHistory', () => {
    expect(service.errorHistory()).toEqual([]);
  });

  it('should set lastError on handleError', () => {
    const error = createAppError('NOT_FOUND', 'Not found', { status: 404 });
    service.handleError(error);
    expect(service.lastError()).toBe(error);
  });

  it('should append to errorHistory on handleError', () => {
    const err1 = createAppError('NOT_FOUND', 'Not found');
    const err2 = createAppError('SERVER_ERROR', 'Server error');
    service.handleError(err1);
    service.handleError(err2);

    expect(service.errorHistory()).toHaveLength(2);
    expect(service.errorHistory()[0]).toBe(err1);
    expect(service.errorHistory()[1]).toBe(err2);
  });

  it('should update lastError to the most recent error', () => {
    const err1 = createAppError('NOT_FOUND', 'First');
    const err2 = createAppError('FORBIDDEN', 'Second');
    service.handleError(err1);
    service.handleError(err2);

    expect(service.lastError()).toBe(err2);
  });

  it('should reset lastError on clearError', () => {
    service.handleError(createAppError('SERVER_ERROR', 'Boom'));
    service.clearError();
    expect(service.lastError()).toBeNull();
  });

  it('should NOT clear history when clearError is called', () => {
    service.handleError(createAppError('SERVER_ERROR', 'Boom'));
    service.clearError();
    expect(service.errorHistory()).toHaveLength(1);
  });

  it('should empty history on clearHistory', () => {
    service.handleError(createAppError('NOT_FOUND', 'A'));
    service.handleError(createAppError('FORBIDDEN', 'B'));
    service.clearHistory();
    expect(service.errorHistory()).toEqual([]);
  });

  it('should NOT clear lastError when clearHistory is called', () => {
    const error = createAppError('SERVER_ERROR', 'Kept');
    service.handleError(error);
    service.clearHistory();
    expect(service.lastError()).toBe(error);
  });

  it('should trim history to default max (50)', () => {
    for (let i = 0; i < 55; i++) {
      service.handleError(createAppError('UNKNOWN_ERROR', `Error ${i}`));
    }

    expect(service.errorHistory()).toHaveLength(50);
    expect(service.errorHistory()[0].message).toBe('Error 5');
    expect(service.errorHistory()[49].message).toBe('Error 54');
  });
});

describe('AppError origin field', () => {
  it('should default origin to programmatic', () => {
    const error = createAppError('NOT_FOUND', 'Not found');
    expect(error.origin).toBe('programmatic');
  });

  it('should set origin to global when specified', () => {
    const error = createAppError('UNKNOWN_ERROR', 'Uncaught', { origin: 'global' });
    expect(error.origin).toBe('global');
  });

  it('should set origin to http when specified', () => {
    const error = createAppError('SERVER_ERROR', 'Internal', { status: 500, origin: 'http' });
    expect(error.origin).toBe('http');
    expect(error.status).toBe(500);
  });
});

describe('ErrorService with custom config', () => {
  let service: ErrorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideErrorHandling({ maxHistorySize: 3 }),
      ],
    });
    service = TestBed.inject(ErrorService);
  });

  it('should respect custom maxHistorySize', () => {
    service.handleError(createAppError('NOT_FOUND', 'A'));
    service.handleError(createAppError('FORBIDDEN', 'B'));
    service.handleError(createAppError('SERVER_ERROR', 'C'));
    service.handleError(createAppError('NETWORK_ERROR', 'D'));

    expect(service.errorHistory()).toHaveLength(3);
    expect(service.errorHistory()[0].message).toBe('B');
    expect(service.errorHistory()[2].message).toBe('D');
  });
});
