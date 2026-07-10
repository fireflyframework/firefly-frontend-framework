import { describe, expect, it } from 'vitest';

import { applyTransformation, readPath } from './field-transformations';

describe('readPath', () => {
  it('returns the leaf value for a simple path', () => {
    expect(readPath({ a: 1 }, 'a')).toBe(1);
  });

  it('walks nested objects with dot notation', () => {
    expect(readPath({ a: { b: { c: 42 } } }, 'a.b.c')).toBe(42);
  });

  it('returns undefined when any segment is missing', () => {
    expect(readPath({ a: { b: 1 } }, 'a.b.c')).toBeUndefined();
    expect(readPath({}, 'a.b')).toBeUndefined();
  });

  it('returns the root object when the path is empty', () => {
    const root = { a: 1 };
    expect(readPath(root, '')).toBe(root);
  });

  it('does not throw for primitive intermediates', () => {
    expect(readPath({ a: 1 }, 'a.b.c')).toBeUndefined();
  });
});

describe('applyTransformation', () => {
  it('passes through null and undefined unchanged', () => {
    expect(applyTransformation(null, 'UPPERCASE')).toBeNull();
    expect(applyTransformation(undefined, 'TRIM')).toBeUndefined();
  });

  it('uppercases string values', () => {
    expect(applyTransformation('Acme', 'UPPERCASE')).toBe('ACME');
  });

  it('lowercases string values', () => {
    expect(applyTransformation('ACME', 'LOWERCASE')).toBe('acme');
  });

  it('trims string values', () => {
    expect(applyTransformation('  x  ', 'TRIM')).toBe('x');
  });

  it('formats an ISO date as YYYY-MM-DD', () => {
    expect(applyTransformation('2026-05-31T12:00:00Z', 'DATE_FORMAT')).toBe('2026-05-31');
  });

  it('passes invalid date strings through unchanged', () => {
    expect(applyTransformation('not-a-date', 'DATE_FORMAT')).toBe('not-a-date');
  });

  it('does not coerce non-string inputs to string-only transformations', () => {
    expect(applyTransformation(42, 'UPPERCASE')).toBe(42);
    expect(applyTransformation(true, 'TRIM')).toBe(true);
  });

  it('returns the input unchanged for NONE', () => {
    expect(applyTransformation('x', 'NONE')).toBe('x');
  });
});
