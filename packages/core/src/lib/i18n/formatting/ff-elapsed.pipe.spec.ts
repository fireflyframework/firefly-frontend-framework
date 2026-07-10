import { describe, expect, it } from 'vitest';

import { FfElapsedPipe } from './ff-elapsed.pipe';

describe('FfElapsedPipe', () => {
  const pipe = new FfElapsedPipe();

  it('returns "—" for missing / empty input', () => {
    expect(pipe.transform(undefined)).toBe('—');
    expect(pipe.transform(null)).toBe('—');
    expect(pipe.transform('')).toBe('—');
  });

  it('returns "—" for unparseable input', () => {
    expect(pipe.transform('not-a-date')).toBe('—');
  });

  it('wraps formatElapsed (smoke check — full math in the utils spec)', () => {
    // Verify the pipe actually returns a non-empty string for a known input.
    const recent = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const out = pipe.transform(recent);
    expect(out).toMatch(/\d+m/);
  });
});
