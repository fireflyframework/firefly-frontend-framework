import { describe, it, expect } from 'vitest';
import { humanizeColumnName, humanizeLabel } from './humanize-label';

describe('humanizeLabel', () => {
  it('collapses separator runs and raises only the first letter', () => {
    expect(humanizeLabel('identity_card')).toBe('Identity card');
    expect(humanizeLabel('Invoice-2024')).toBe('Invoice 2024');
    expect(humanizeLabel('cap__table--vigente')).toBe('Cap table vigente');
  });

  it('passes an already-human string through with its first letter raised', () => {
    expect(humanizeLabel('identity card')).toBe('Identity card');
  });

  it('returns the fallback for missing or empty input', () => {
    expect(humanizeLabel(null)).toBe('');
    expect(humanizeLabel(undefined, '—')).toBe('—');
    expect(humanizeLabel('', '—')).toBe('—');
  });

  it('returns the raw string when cleaning collapses it to nothing', () => {
    expect(humanizeLabel('___')).toBe('___');
  });
});

describe('humanizeColumnName', () => {
  it('title-cases every word', () => {
    expect(humanizeColumnName('cap_table-vigente')).toBe('Cap Table Vigente');
    expect(humanizeColumnName('participaciones')).toBe('Participaciones');
  });

  it('collapses blank input to an empty string', () => {
    expect(humanizeColumnName('')).toBe('');
  });
});
