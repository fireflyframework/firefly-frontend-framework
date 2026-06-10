import { describe, expect, it } from 'vitest';

import { groupAndCount } from './group-and-count';

describe('groupAndCount', () => {
  it('buckets items by the canonical key and counts cardinalities', () => {
    const out = groupAndCount(
      [
        { name: 'a' },
        { name: 'a' },
        { name: 'b' },
      ],
      (i) => i.name,
    );
    expect(out).toEqual([
      { key: 'a', label: 'a', count: 2 },
      { key: 'b', label: 'b', count: 1 },
    ]);
  });

  it('sorts by count descending by default', () => {
    const out = groupAndCount(['x', 'y', 'x', 'x', 'y'] as string[], (s) => s);
    expect(out.map((b) => b.key)).toEqual(['x', 'y']);
  });

  it('supports ascending sort', () => {
    const out = groupAndCount(['x', 'y', 'x'] as string[], (s) => s, { sort: 'asc' });
    expect(out.map((b) => b.key)).toEqual(['y', 'x']);
  });

  it('preserves insertion order with sort=none', () => {
    const out = groupAndCount(['b', 'a', 'b'] as string[], (s) => s, { sort: 'none' });
    expect(out.map((b) => b.key)).toEqual(['b', 'a']);
  });

  it('drops null and undefined keys silently', () => {
    const out = groupAndCount(
      [{ k: 'a' }, { k: null }, { k: undefined }, { k: 'a' }] as { k: string | null | undefined }[],
      (i) => i.k as string | null,
    );
    expect(out).toEqual([{ key: 'a', label: 'a', count: 2 }]);
  });

  it('uses the custom labelFn to produce display labels', () => {
    const out = groupAndCount(
      [{ id: 'u1' }, { id: 'u1' }, { id: 'u2' }],
      (i) => i.id,
      { labelFn: (k) => k.toUpperCase() },
    );
    expect(out[0]).toEqual({ key: 'u1', label: 'U1', count: 2 });
  });

  it('returns an empty array when the input is empty', () => {
    expect(groupAndCount([] as string[], (s) => s)).toEqual([]);
  });
});
