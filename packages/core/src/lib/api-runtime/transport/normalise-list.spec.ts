import { normaliseList } from './normalise-list';

describe('normaliseList', () => {
  it('passes a flat array through untouched', () => {
    const rows = [{ id: 1 }, { id: 2 }];
    expect(normaliseList(rows)).toBe(rows);
  });

  it('unwraps the { items } envelope', () => {
    expect(normaliseList({ items: [{ id: 1 }] })).toEqual([{ id: 1 }]);
  });

  it('collapses a missing items key to an empty array', () => {
    expect(normaliseList<{ id: number }>({})).toEqual([]);
  });

  it('preserves an empty array in either shape', () => {
    expect(normaliseList([])).toEqual([]);
    expect(normaliseList({ items: [] })).toEqual([]);
  });
});
