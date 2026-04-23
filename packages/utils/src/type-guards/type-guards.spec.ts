import { describe, it, expect } from 'vitest';
import { isNullOrUndefined, isString, isNumber, isObject, isNonEmpty, isDefined, isHttpError } from './index';

describe('isNullOrUndefined', () => {
  it('returns true for null', () => {
    expect(isNullOrUndefined(null)).toBe(true);
  });

  it('returns true for undefined', () => {
    expect(isNullOrUndefined(undefined)).toBe(true);
  });

  it('returns false for zero', () => {
    expect(isNullOrUndefined(0)).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isNullOrUndefined('')).toBe(false);
  });

  it('returns false for false', () => {
    expect(isNullOrUndefined(false)).toBe(false);
  });
});

describe('isString', () => {
  it('returns true for string literals', () => {
    expect(isString('hello')).toBe(true);
  });

  it('returns true for empty string', () => {
    expect(isString('')).toBe(true);
  });

  it('returns false for number', () => {
    expect(isString(42)).toBe(false);
  });

  it('returns false for null', () => {
    expect(isString(null)).toBe(false);
  });
});

describe('isNumber', () => {
  it('returns true for integers', () => {
    expect(isNumber(42)).toBe(true);
  });

  it('returns true for floats', () => {
    expect(isNumber(3.14)).toBe(true);
  });

  it('returns true for zero', () => {
    expect(isNumber(0)).toBe(true);
  });

  it('returns false for NaN', () => {
    expect(isNumber(NaN)).toBe(false);
  });

  it('returns false for string', () => {
    expect(isNumber('42')).toBe(false);
  });
});

describe('isObject', () => {
  it('returns true for plain objects', () => {
    expect(isObject({ a: 1 })).toBe(true);
  });

  it('returns true for empty objects', () => {
    expect(isObject({})).toBe(true);
  });

  it('returns false for null', () => {
    expect(isObject(null)).toBe(false);
  });

  it('returns false for arrays', () => {
    expect(isObject([1, 2])).toBe(false);
  });

  it('returns false for primitives', () => {
    expect(isObject('hello')).toBe(false);
  });
});

describe('isNonEmpty', () => {
  it('returns true for non-empty string', () => {
    expect(isNonEmpty('hello')).toBe(true);
  });

  it('returns true for number', () => {
    expect(isNonEmpty(42)).toBe(true);
  });

  it('returns false for null', () => {
    expect(isNonEmpty(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isNonEmpty(undefined)).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isNonEmpty('')).toBe(false);
  });
});

describe('isDefined', () => {
  it('returns true for values', () => {
    expect(isDefined(0)).toBe(true);
    expect(isDefined('')).toBe(true);
    expect(isDefined(false)).toBe(true);
  });

  it('returns false for null', () => {
    expect(isDefined(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isDefined(undefined)).toBe(false);
  });
});

describe('isHttpError', () => {
  it('returns true for valid HTTP error shape', () => {
    expect(isHttpError({ status: 404, message: 'Not Found' })).toBe(true);
  });

  it('returns true for error with extra properties', () => {
    expect(isHttpError({ status: 500, message: 'Server Error', code: 'ERR' })).toBe(true);
  });

  it('returns false when status is missing', () => {
    expect(isHttpError({ message: 'error' })).toBe(false);
  });

  it('returns false when message is missing', () => {
    expect(isHttpError({ status: 400 })).toBe(false);
  });

  it('returns false when status is not a number', () => {
    expect(isHttpError({ status: '404', message: 'Not Found' })).toBe(false);
  });

  it('returns false for null', () => {
    expect(isHttpError(null)).toBe(false);
  });

  it('returns false for primitives', () => {
    expect(isHttpError('error')).toBe(false);
  });
});
