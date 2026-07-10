import { describe, it, expect } from 'vitest';
import { initialsFrom } from './initials-from';

describe('initialsFrom', () => {
  it('takes one letter from each of firstName and lastName', () => {
    expect(initialsFrom({ firstName: 'María', lastName: 'García' })).toBe('MG');
  });

  it('takes the first two letters of a lone first or last name', () => {
    expect(initialsFrom({ firstName: 'María' })).toBe('MA');
    expect(initialsFrom({ lastName: 'García' })).toBe('GA');
  });

  it('takes the first letter of up to two words of a display name', () => {
    expect(initialsFrom({ name: 'María García' })).toBe('MG');
    expect(initialsFrom({ name: 'Luis' })).toBe('L');
    expect(initialsFrom({ name: 'Ana de la Torre' })).toBe('AD');
  });

  it('falls back to the email local-part', () => {
    expect(initialsFrom({ email: 'ana@example.io' })).toBe('AN');
  });

  it('prefers the richest source available', () => {
    expect(
      initialsFrom({ firstName: 'María', lastName: 'García', name: 'x y', email: 'z@w.io' }),
    ).toBe('MG');
    expect(initialsFrom({ name: 'María García', email: 'z@w.io' })).toBe('MG');
  });

  it('ignores blank fragments', () => {
    expect(initialsFrom({ firstName: '  ', name: 'Luis Pérez' })).toBe('LP');
  });

  it('returns the fallback when nothing is usable', () => {
    expect(initialsFrom({})).toBe('??');
    expect(initialsFrom({ name: null, email: undefined })).toBe('??');
    expect(initialsFrom({}, '·')).toBe('·');
  });
});
