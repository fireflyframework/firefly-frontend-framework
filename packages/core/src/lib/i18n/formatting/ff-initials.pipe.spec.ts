import { describe, expect, it } from 'vitest';

import { FfInitialsPipe } from './ff-initials.pipe';

describe('FfInitialsPipe', () => {
  const pipe = new FfInitialsPipe();

  it('takes the first letter of up to two words', () => {
    expect(pipe.transform('María García')).toBe('MG');
    expect(pipe.transform('Ada Lovelace Byron')).toBe('AL');
  });

  it('returns a single uppercase initial for one word', () => {
    expect(pipe.transform('Luis')).toBe('L');
  });

  it('collapses extra whitespace', () => {
    expect(pipe.transform('  john   doe  ')).toBe('JD');
  });

  it('returns the default fallback for empty/nullish input', () => {
    expect(pipe.transform('')).toBe('??');
    expect(pipe.transform(null)).toBe('??');
    expect(pipe.transform(undefined)).toBe('??');
    expect(pipe.transform('   ')).toBe('??');
  });

  it('honours a custom fallback', () => {
    expect(pipe.transform(null, '·')).toBe('·');
  });

  it('also accepts the richer identity shape', () => {
    expect(pipe.transform({ firstName: 'María', lastName: 'García' })).toBe('MG');
    expect(pipe.transform({ firstName: 'María' })).toBe('MA');
    expect(pipe.transform({ name: 'Luis' })).toBe('L');
    expect(pipe.transform({ email: 'ana@example.io' })).toBe('AN');
  });

  it('returns the fallback when no identity fragment is usable', () => {
    expect(pipe.transform({})).toBe('??');
    expect(pipe.transform({ name: null }, '·')).toBe('·');
  });
});
