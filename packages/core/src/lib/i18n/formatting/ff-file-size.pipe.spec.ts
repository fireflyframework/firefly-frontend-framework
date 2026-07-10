import { describe, expect, it } from 'vitest';

import { FfFileSizePipe } from './ff-file-size.pipe';

describe('FfFileSizePipe', () => {
  const pipe = new FfFileSizePipe();

  it('renders bytes below 1 KB without a decimal', () => {
    expect(pipe.transform(512)).toBe('512 B');
    expect(pipe.transform(0)).toBe('0 B');
  });

  it('renders larger units with one decimal', () => {
    expect(pipe.transform(1258291)).toBe('1.2 MB');
    expect(pipe.transform(1572864)).toBe('1.5 MB');
  });

  it('trims a trailing .0', () => {
    expect(pipe.transform(2097152)).toBe('2 MB');
    expect(pipe.transform(1024)).toBe('1 KB');
  });

  it('walks up to the largest unit', () => {
    expect(pipe.transform(1024 ** 4)).toBe('1 TB');
  });

  it('returns "" for nullish, negative or NaN input', () => {
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(-1)).toBe('');
    expect(pipe.transform(Number.NaN)).toBe('');
  });
});
