import { describe, expect, it } from 'vitest';

import { FfShortIdPipe } from './ff-short-id.pipe';

describe('FfShortIdPipe', () => {
  const pipe = new FfShortIdPipe();

  it('returns the last 8 chars by default', () => {
    expect(pipe.transform('abcdef0123456789')).toBe('23456789');
  });

  it('respects a custom length', () => {
    expect(pipe.transform('abcdef0123456789', 4)).toBe('6789');
    expect(pipe.transform('abcdef0123456789', 12)).toBe('ef0123456789');
  });

  it('returns the id verbatim when shorter than the length', () => {
    expect(pipe.transform('short')).toBe('short');
    expect(pipe.transform('abc', 8)).toBe('abc');
  });

  it('returns "—" for falsy input', () => {
    expect(pipe.transform(undefined)).toBe('—');
    expect(pipe.transform(null)).toBe('—');
    expect(pipe.transform('')).toBe('—');
  });
});
