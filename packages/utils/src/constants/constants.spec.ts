import { describe, expect, it } from 'vitest';

import { TIME_RANGE_OFFSETS_MS, TIME_RANGE_OPTIONS } from './index';

describe('TIME_RANGE_OPTIONS', () => {
  it('orders chips from tightest window to all history', () => {
    expect(TIME_RANGE_OPTIONS.map((o) => o.value)).toEqual([
      'LAST_24H',
      'LAST_7D',
      'LAST_30D',
      'ALL',
    ]);
  });

  it('labels are short and lowercase except ALL', () => {
    expect(TIME_RANGE_OPTIONS.map((o) => o.label)).toEqual(['24h', '7d', '30d', 'All']);
  });
});

describe('TIME_RANGE_OFFSETS_MS', () => {
  it('maps every non-ALL range to its window in milliseconds', () => {
    expect(TIME_RANGE_OFFSETS_MS.LAST_24H).toBe(24 * 60 * 60 * 1000);
    expect(TIME_RANGE_OFFSETS_MS.LAST_7D).toBe(7 * 24 * 60 * 60 * 1000);
    expect(TIME_RANGE_OFFSETS_MS.LAST_30D).toBe(30 * 24 * 60 * 60 * 1000);
  });

  it('has no entry for ALL on purpose — callers treat it as "no filter"', () => {
    expect('ALL' in TIME_RANGE_OFFSETS_MS).toBe(false);
  });
});
