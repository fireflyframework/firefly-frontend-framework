import { describe, expect, it } from 'vitest';

import { formatElapsed } from './format-elapsed';

const BASE = Date.parse('2026-05-30T12:00:00Z');

describe('formatElapsed', () => {
  it('returns "—" for missing input', () => {
    expect(formatElapsed(undefined)).toBe('—');
    expect(formatElapsed(null)).toBe('—');
    expect(formatElapsed('')).toBe('—');
  });

  it('returns "—" for unparseable input', () => {
    expect(formatElapsed('not-a-date')).toBe('—');
  });

  it('formats sub-minute durations in seconds', () => {
    expect(formatElapsed('2026-05-30T11:59:18Z', BASE)).toBe('42s');
  });

  it('formats sub-hour durations in whole minutes', () => {
    expect(formatElapsed('2026-05-30T11:45:00Z', BASE)).toBe('15m');
  });

  it('formats sub-day durations in hours, omitting the minute remainder when 0', () => {
    expect(formatElapsed('2026-05-30T09:00:00Z', BASE)).toBe('3h');
    expect(formatElapsed('2026-05-30T08:48:00Z', BASE)).toBe('3h 12m');
  });

  it('formats multi-day durations in days, omitting the hour remainder when 0', () => {
    expect(formatElapsed('2026-05-28T12:00:00Z', BASE)).toBe('2d');
    expect(formatElapsed('2026-05-28T07:00:00Z', BASE)).toBe('2d 5h');
  });

  it('clamps negative durations to 0s', () => {
    expect(formatElapsed('2026-05-30T12:05:00Z', BASE)).toBe('0s');
  });
});
