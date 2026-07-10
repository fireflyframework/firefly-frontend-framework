import { describe, expect, it } from 'vitest';

import { FfHumanizeColumnPipe, FfHumanizeLabelPipe } from './ff-humanize.pipe';

describe('FfHumanizeLabelPipe', () => {
  const pipe = new FfHumanizeLabelPipe();

  it('sentence-cases a backend identifier', () => {
    expect(pipe.transform('identity_card')).toBe('Identity card');
    expect(pipe.transform('Invoice-2024')).toBe('Invoice 2024');
  });

  it('defaults to an empty fallback so a template can collapse the segment', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform('')).toBe('');
  });

  it('honours a custom fallback', () => {
    expect(pipe.transform(null, '—')).toBe('—');
  });
});

describe('FfHumanizeColumnPipe', () => {
  const pipe = new FfHumanizeColumnPipe();

  it('title-cases a backend column identifier', () => {
    expect(pipe.transform('cap_table-vigente')).toBe('Cap Table Vigente');
    expect(pipe.transform('participaciones')).toBe('Participaciones');
  });

  it('collapses missing input to an empty string', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });
});
