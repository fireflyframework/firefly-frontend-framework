import { HttpErrorResponse } from '@angular/common/http';

import { TransportError } from './transport-error';
import { backendErrorMatches, resolveBackendErrorMessage } from './resolve-backend-error-message';

const FALLBACK = 'ERRORS.GENERIC';
const CODE_KEYS = { UNIQUE_CONSTRAINT_VIOLATION: 'ERRORS.UNIQUE_CONSTRAINT' };

/** An `HttpErrorResponse` with the given body and status. */
const httpError = (error: unknown, status = 400, statusText = 'Bad Request') =>
  new HttpErrorResponse({ error, status, statusText });

/** The same response, wrapped the way the transport layer delivers it. */
const wrapped = (response: HttpErrorResponse) =>
  new TransportError('Request failed', 'http', 'HttpAdapter', 'svc', 'op', response.status, response);

describe('resolveBackendErrorMessage', () => {
  it('prefers a known root-cause code over everything else', () => {
    const err = httpError({ detail: 'Invalid request: {"code":"UNIQUE_CONSTRAINT_VIOLATION"}' });
    expect(resolveBackendErrorMessage(err, FALLBACK, CODE_KEYS)).toBe('ERRORS.UNIQUE_CONSTRAINT');
  });

  it('finds the code through a TransportError wrapper', () => {
    const err = wrapped(httpError({ detail: 'x UNIQUE_CONSTRAINT_VIOLATION y' }));
    expect(resolveBackendErrorMessage(err, FALLBACK, CODE_KEYS)).toBe('ERRORS.UNIQUE_CONSTRAINT');
  });

  it('surfaces a human detail verbatim', () => {
    const err = httpError({ detail: 'That email is already taken' });
    expect(resolveBackendErrorMessage(err, FALLBACK)).toBe('That email is already taken');
  });

  it('reads message and error as detail aliases', () => {
    expect(resolveBackendErrorMessage(httpError({ message: 'Boom' }), FALLBACK)).toBe('Boom');
    expect(resolveBackendErrorMessage(httpError({ error: 'Boom' }), FALLBACK)).toBe('Boom');
  });

  it('accepts a plain-string body when it reads as a sentence', () => {
    expect(resolveBackendErrorMessage(httpError('Server is down'), FALLBACK)).toBe('Server is down');
  });

  it('never surfaces a serialized envelope', () => {
    expect(resolveBackendErrorMessage(httpError({ detail: '{"type":"x"}' }), FALLBACK)).toBe(FALLBACK);
    expect(resolveBackendErrorMessage(httpError({ detail: 'Invalid request: {…}' }), FALLBACK)).toBe(
      FALLBACK,
    );
    expect(resolveBackendErrorMessage(httpError({ detail: 'x'.repeat(201) }), FALLBACK)).toBe(
      FALLBACK,
    );
  });

  it('falls back rather than showing a status line for a non-human body', () => {
    expect(resolveBackendErrorMessage(httpError({ code: 'X_UNKNOWN' }), FALLBACK)).toBe(FALLBACK);
  });

  it('shows the status line only when the body is empty', () => {
    expect(resolveBackendErrorMessage(httpError(null, 412, 'Precondition Failed'), FALLBACK)).toBe(
      '412 Precondition Failed',
    );
    expect(resolveBackendErrorMessage(httpError('  ', 412, 'Precondition Failed'), FALLBACK)).toBe(
      '412 Precondition Failed',
    );
  });

  it('uses the message of a plain thrown Error', () => {
    expect(resolveBackendErrorMessage(new Error('Offline'), FALLBACK)).toBe('Offline');
  });

  it('never uses a TransportError own message as user copy', () => {
    const err = new TransportError('Request failed', 'http', 'HttpAdapter', 'svc', 'op');
    expect(resolveBackendErrorMessage(err, FALLBACK)).toBe(FALLBACK);
  });

  it('falls back for an unrecognised value', () => {
    expect(resolveBackendErrorMessage('nope', FALLBACK)).toBe(FALLBACK);
    expect(resolveBackendErrorMessage(undefined, FALLBACK)).toBe(FALLBACK);
  });

  it('ignores codes when no contract is supplied', () => {
    const err = httpError({ detail: 'Invalid request: {"code":"UNIQUE_CONSTRAINT_VIOLATION"}' });
    expect(resolveBackendErrorMessage(err, FALLBACK)).toBe(FALLBACK);
  });
});

describe('backendErrorMatches', () => {
  it('probes the serialized body case-insensitively', () => {
    const err = httpError({ detail: 'UNIQUE_CONSTRAINT_VIOLATION on users.email' });
    expect(backendErrorMatches(err, 'users.email')).toBe(true);
    expect(backendErrorMatches(err, 'USERS.EMAIL')).toBe(true);
    expect(backendErrorMatches(err, 'users.phone')).toBe(false);
  });

  it('probes through a TransportError wrapper and its message', () => {
    const err = wrapped(httpError({ detail: 'duplicate key' }));
    expect(backendErrorMatches(err, 'duplicate key')).toBe(true);
    expect(backendErrorMatches(err, 'request failed')).toBe(true);
  });

  it('is true when any needle matches, false with none', () => {
    const err = new Error('quota exceeded');
    expect(backendErrorMatches(err, 'nope', 'quota')).toBe(true);
    expect(backendErrorMatches(err)).toBe(false);
    expect(backendErrorMatches(null, 'quota')).toBe(false);
  });
});
