import { describe, expect, it } from 'vitest';

import { sortByPriorityDesc } from './sort-by-priority';

describe('sortByPriorityDesc', () => {
  it('sorts by priority descending', () => {
    const items = [{ id: 'a', priority: 1 }, { id: 'b', priority: 5 }, { id: 'c', priority: 3 }];
    expect(sortByPriorityDesc(items).map((i) => i.id)).toEqual(['b', 'c', 'a']);
  });

  it('places items missing priority at the tail and keeps their relative order', () => {
    const items = [
      { id: 'a' },
      { id: 'b', priority: 5 },
      { id: 'c' },
      { id: 'd', priority: 1 },
    ];
    expect(sortByPriorityDesc(items).map((i) => i.id)).toEqual(['b', 'd', 'a', 'c']);
  });

  it('returns a new array (pure)', () => {
    const items = [{ id: 'a', priority: 1 }];
    const out = sortByPriorityDesc(items);
    expect(out).not.toBe(items);
  });

  it('returns an empty array for an empty input', () => {
    expect(sortByPriorityDesc([])).toEqual([]);
  });
});
