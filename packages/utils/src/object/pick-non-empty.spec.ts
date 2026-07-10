import { describe, it, expect } from 'vitest';

import { pickNonEmpty } from './pick-non-empty';

describe('pickNonEmpty', () => {
  it('copies only the requested keys', () => {
    const result = pickNonEmpty({ a: 'x', b: 'y', c: 'z' }, ['a', 'c']);
    expect(result).toEqual({ a: 'x', c: 'z' });
  });

  it("skips '', null and undefined", () => {
    const result = pickNonEmpty(
      { a: 'x', b: '', c: null, d: undefined },
      ['a', 'b', 'c', 'd'],
    );
    expect(result).toEqual({ a: 'x' });
  });

  it('keeps 0 and false (not falsy-pruned)', () => {
    const result = pickNonEmpty({ count: 0, flag: false }, ['count', 'flag']);
    expect(result).toEqual({ count: 0, flag: false });
  });

  it('returns an empty object when every requested value is empty', () => {
    const result = pickNonEmpty({ a: '', b: null }, ['a', 'b']);
    expect(result).toEqual({});
  });

  it('does not mutate the source', () => {
    const raw = { a: 'x', b: '' };
    pickNonEmpty(raw, ['a', 'b']);
    expect(raw).toEqual({ a: 'x', b: '' });
  });
});
