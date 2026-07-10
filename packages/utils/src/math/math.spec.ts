import { describe, it, expect } from 'vitest';

import { clampPercent, ratioToPercent } from './index';

describe('clampPercent', () => {
  it('clamps values above 100', () => {
    expect(clampPercent(142)).toBe(100);
    expect(clampPercent(101)).toBe(100);
  });

  it('clamps values below 0', () => {
    expect(clampPercent(-3)).toBe(0);
    expect(clampPercent(-0.4)).toBe(0);
  });

  it('rounds to the nearest integer', () => {
    expect(clampPercent(42.6)).toBe(43);
    expect(clampPercent(42.4)).toBe(42);
  });

  it('passes through in-range integers', () => {
    expect(clampPercent(0)).toBe(0);
    expect(clampPercent(50)).toBe(50);
    expect(clampPercent(100)).toBe(100);
  });
});

describe('ratioToPercent', () => {
  it('scales a 0..1 ratio to 0..100', () => {
    expect(ratioToPercent(0.42)).toBe(42);
    expect(ratioToPercent(0)).toBe(0);
    expect(ratioToPercent(1)).toBe(100);
  });

  it('clamps ratios above 1', () => {
    expect(ratioToPercent(1.3)).toBe(100);
  });

  it('clamps negative ratios', () => {
    expect(ratioToPercent(-0.5)).toBe(0);
  });
});
