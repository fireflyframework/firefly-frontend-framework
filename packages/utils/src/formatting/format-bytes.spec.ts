import { describe, it, expect } from 'vitest';
import { formatBytes } from './format-bytes';

describe('formatBytes', () => {
  it('renders whole bytes below 1 KB without a decimal', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(0)).toBe('0 B');
  });

  it('scales through the unit ladder with one decimal', () => {
    expect(formatBytes(1258291)).toBe('1.2 MB');
    expect(formatBytes(1572864)).toBe('1.5 MB');
  });

  it('trims a trailing .0', () => {
    expect(formatBytes(2097152)).toBe('2 MB');
    expect(formatBytes(1024)).toBe('1 KB');
  });

  it('caps at the largest known unit', () => {
    expect(formatBytes(1024 ** 5)).toBe('1024 TB');
  });

  it('returns an empty string for missing, negative or NaN input', () => {
    expect(formatBytes(null)).toBe('');
    expect(formatBytes(undefined)).toBe('');
    expect(formatBytes(-1)).toBe('');
    expect(formatBytes(Number.NaN)).toBe('');
  });
});
