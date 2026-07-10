import { describe, it, expect } from 'vitest';
import { stableStringify } from './stable-stringify';

describe('stableStringify', () => {
  it('serializes key-order-independent objects identically', () => {
    expect(stableStringify({ b: 1, a: 2 })).toBe(stableStringify({ a: 2, b: 1 }));
  });

  it('sorts nested keys too', () => {
    expect(stableStringify({ outer: { z: 1, a: 2 } })).toBe('{"outer":{"a":2,"z":1}}');
  });

  it('preserves array element order', () => {
    expect(stableStringify([3, 1, 2])).toBe('[3,1,2]');
  });

  it('sorts the keys of objects inside arrays', () => {
    expect(stableStringify([{ b: 1, a: 2 }])).toBe('[{"a":2,"b":1}]');
  });

  it('leaves primitives and null alone', () => {
    expect(stableStringify(42)).toBe('42');
    expect(stableStringify('x')).toBe('"x"');
    expect(stableStringify(null)).toBe('null');
  });

  it('returns undefined for values JSON.stringify cannot serialize', () => {
    expect(stableStringify(undefined)).toBeUndefined();
    expect(stableStringify(() => 0)).toBeUndefined();
  });
});
