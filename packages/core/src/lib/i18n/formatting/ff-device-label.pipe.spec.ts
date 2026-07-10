import { describe, expect, it } from 'vitest';

import { FfDeviceLabelPipe } from './ff-device-label.pipe';

describe('FfDeviceLabelPipe', () => {
  const pipe = new FfDeviceLabelPipe();

  it('joins browser and OS with a middle dot', () => {
    const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/122 Safari/537.36';
    expect(pipe.transform(ua)).toBe('Chrome · macOS');
  });

  it('reads a mobile Safari string', () => {
    const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Version/17.0 Safari/604.1';
    expect(pipe.transform(ua)).toBe('Safari · iOS');
  });

  it('degrades to Unknown on both halves', () => {
    expect(pipe.transform(null)).toBe('Unknown · Unknown');
    expect(pipe.transform(undefined)).toBe('Unknown · Unknown');
    expect(pipe.transform('some-crawler/1.0')).toBe('Unknown · Unknown');
  });
});
