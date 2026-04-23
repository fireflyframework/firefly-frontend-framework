import { describe, it, expect } from 'vitest';
import { deepMerge, pick, omit, deepClone, diff, isEmpty } from './index';

describe('deepMerge', () => {
  it('merges flat objects', () => {
    const result = deepMerge({ a: 1, b: 2 }, { b: 3 });
    expect(result).toEqual({ a: 1, b: 3 });
  });

  it('merges nested objects recursively', () => {
    const target = { a: { x: 1, y: 2 }, b: 3 };
    const source = { a: { y: 10, z: 20 } };
    const result = deepMerge(target, source);
    expect(result).toEqual({ a: { x: 1, y: 10, z: 20 }, b: 3 });
  });

  it('overwrites arrays instead of merging them', () => {
    const result = deepMerge({ a: [1, 2] }, { a: [3] });
    expect(result).toEqual({ a: [3] });
  });

  it('does not mutate target', () => {
    const target = { a: { x: 1 } };
    deepMerge(target, { a: { y: 2 } });
    expect(target).toEqual({ a: { x: 1 } });
  });
});

describe('pick', () => {
  it('picks specified keys', () => {
    const result = pick({ a: 1, b: 2, c: 3 }, ['a', 'c']);
    expect(result).toEqual({ a: 1, c: 3 });
  });

  it('ignores keys not present in the object', () => {
    const obj = { a: 1 } as Record<string, number>;
    const result = pick(obj, ['a', 'z'] as (keyof typeof obj)[]);
    expect(result).toEqual({ a: 1 });
  });

  it('returns empty object when keys array is empty', () => {
    expect(pick({ a: 1, b: 2 }, [])).toEqual({});
  });
});

describe('omit', () => {
  it('omits specified keys', () => {
    const result = omit({ a: 1, b: 2, c: 3 }, ['b']);
    expect(result).toEqual({ a: 1, c: 3 });
  });

  it('returns full copy when keys array is empty', () => {
    const obj = { a: 1, b: 2 };
    const result = omit(obj, []);
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it('does not mutate original object', () => {
    const obj = { a: 1, b: 2 };
    omit(obj, ['a']);
    expect(obj).toEqual({ a: 1, b: 2 });
  });
});

describe('deepClone', () => {
  it('creates a deep copy of an object', () => {
    const original = { a: { b: { c: 1 } } };
    const cloned = deepClone(original);
    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
    expect(cloned.a).not.toBe(original.a);
  });

  it('clones arrays within objects', () => {
    const original = { items: [1, 2, 3] };
    const cloned = deepClone(original);
    cloned.items.push(4);
    expect(original.items).toEqual([1, 2, 3]);
  });

  it('handles primitive values', () => {
    expect(deepClone(42)).toBe(42);
    expect(deepClone('hello')).toBe('hello');
  });
});

describe('diff', () => {
  it('returns keys with different values', () => {
    const a = { x: 1, y: 2, z: 3 };
    const b = { x: 1, y: 5, z: 3 };
    expect(diff(a, b)).toEqual({ y: 5 });
  });

  it('returns empty object when objects are equal', () => {
    const a = { x: 1, y: 2 };
    const b = { x: 1, y: 2 };
    expect(diff(a, b)).toEqual({});
  });

  it('detects added keys in b', () => {
    const a = { x: 1 } as Record<string, number>;
    const b = { x: 1, y: 2 };
    expect(diff(a, b)).toEqual({ y: 2 });
  });
});

describe('isEmpty', () => {
  it('returns true for null and undefined', () => {
    expect(isEmpty(null)).toBe(true);
    expect(isEmpty(undefined)).toBe(true);
  });

  it('returns true for empty string', () => {
    expect(isEmpty('')).toBe(true);
  });

  it('returns false for non-empty string', () => {
    expect(isEmpty('hello')).toBe(false);
  });

  it('returns true for empty array', () => {
    expect(isEmpty([])).toBe(true);
  });

  it('returns false for non-empty array', () => {
    expect(isEmpty([1])).toBe(false);
  });

  it('returns true for empty object', () => {
    expect(isEmpty({})).toBe(true);
  });

  it('returns false for non-empty object', () => {
    expect(isEmpty({ a: 1 })).toBe(false);
  });

  it('returns false for numbers', () => {
    expect(isEmpty(0)).toBe(false);
    expect(isEmpty(42)).toBe(false);
  });
});
