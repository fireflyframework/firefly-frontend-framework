import { describe, it, expect } from 'vitest';
import { groupBy, uniqueBy, unique, chunk, flatten, sortBy, partition, keyBy } from './index';

interface User {
  id: number;
  name: string;
  role: string;
}

const users: User[] = [
  { id: 1, name: 'Alice', role: 'admin' },
  { id: 2, name: 'Bob', role: 'user' },
  { id: 3, name: 'Charlie', role: 'admin' },
  { id: 4, name: 'Diana', role: 'user' },
];

describe('groupBy', () => {
  it('groups items by key', () => {
    const result = groupBy(users, 'role');
    expect(result['admin']).toHaveLength(2);
    expect(result['user']).toHaveLength(2);
    expect(result['admin'][0].name).toBe('Alice');
  });

  it('returns empty object for empty array', () => {
    expect(groupBy([] as User[], 'role')).toEqual({});
  });
});

describe('uniqueBy', () => {
  it('removes duplicates by key function', () => {
    const result = uniqueBy(users, (u) => u.role);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Alice');
    expect(result[1].name).toBe('Bob');
  });

  it('returns empty array for empty input', () => {
    expect(uniqueBy([], (x) => x)).toEqual([]);
  });
});

describe('unique', () => {
  it('removes duplicate primitives', () => {
    expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
  });

  it('works with strings', () => {
    expect(unique(['a', 'b', 'a'])).toEqual(['a', 'b']);
  });

  it('returns empty array for empty input', () => {
    expect(unique([])).toEqual([]);
  });
});

describe('chunk', () => {
  it('splits array into chunks of given size', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('returns single chunk when size >= length', () => {
    expect(chunk([1, 2], 5)).toEqual([[1, 2]]);
  });

  it('returns empty array for empty input', () => {
    expect(chunk([], 3)).toEqual([]);
  });

  it('returns empty array for size <= 0', () => {
    expect(chunk([1, 2, 3], 0)).toEqual([]);
    expect(chunk([1, 2, 3], -1)).toEqual([]);
  });
});

describe('flatten', () => {
  it('flattens one level of nesting', () => {
    expect(flatten([[1, 2], [3], 4])).toEqual([1, 2, 3, 4]);
  });

  it('handles already flat arrays', () => {
    expect(flatten([1, 2, 3])).toEqual([1, 2, 3]);
  });

  it('returns empty array for empty input', () => {
    expect(flatten([])).toEqual([]);
  });
});

describe('sortBy', () => {
  it('sorts by numeric key', () => {
    const result = sortBy(users, (u) => u.id);
    expect(result[0].id).toBe(1);
    expect(result[3].id).toBe(4);
  });

  it('sorts by string key', () => {
    const result = sortBy(users, (u) => u.name);
    expect(result[0].name).toBe('Alice');
    expect(result[3].name).toBe('Diana');
  });

  it('does not mutate original array', () => {
    const original = [3, 1, 2];
    const sorted = sortBy(original, (x) => x);
    expect(sorted).toEqual([1, 2, 3]);
    expect(original).toEqual([3, 1, 2]);
  });

  it('returns empty array for empty input', () => {
    expect(sortBy([], (x) => x as number)).toEqual([]);
  });
});

describe('partition', () => {
  it('splits array by predicate', () => {
    const [admins, others] = partition(users, (u) => u.role === 'admin');
    expect(admins).toHaveLength(2);
    expect(others).toHaveLength(2);
    expect(admins[0].name).toBe('Alice');
  });

  it('all pass: second array is empty', () => {
    const [pass, fail] = partition([1, 2, 3], () => true);
    expect(pass).toEqual([1, 2, 3]);
    expect(fail).toEqual([]);
  });

  it('returns two empty arrays for empty input', () => {
    const [pass, fail] = partition([], () => true);
    expect(pass).toEqual([]);
    expect(fail).toEqual([]);
  });
});

describe('keyBy', () => {
  it('indexes items by key', () => {
    const result = keyBy(users, 'id');
    expect(result['1'].name).toBe('Alice');
    expect(result['4'].name).toBe('Diana');
  });

  it('last item wins on duplicate keys', () => {
    const result = keyBy(users, 'role');
    expect(result['admin'].name).toBe('Charlie');
    expect(result['user'].name).toBe('Diana');
  });

  it('returns empty object for empty array', () => {
    expect(keyBy([] as User[], 'id')).toEqual({});
  });
});
