import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, formatPercentage, formatIBAN, formatNIF } from './index';

// ---------------------------------------------------------------------------
// formatCurrency
// ---------------------------------------------------------------------------

describe('formatCurrency', () => {
  it('formats with ES locale', () => {
    const result = formatCurrency(1234.5, 'EUR', 'es');
    // Intl may omit grouping separator for 4-digit numbers in some environments
    expect(result).toMatch(/1\.?234,50/);
    expect(result).toContain('€');
  });

  it('formats with EN locale', () => {
    const result = formatCurrency(1234.5, 'EUR', 'en');
    expect(result).toContain('€');
    expect(result).toContain('1,234.50');
  });

  it('formats USD', () => {
    const result = formatCurrency(99.99, 'USD', 'en');
    expect(result).toContain('$');
    expect(result).toContain('99.99');
  });

  it('returns empty string for null', () => {
    expect(formatCurrency(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(formatCurrency(undefined)).toBe('');
  });

  it('returns empty string for NaN', () => {
    expect(formatCurrency(NaN)).toBe('');
  });

  it('handles zero', () => {
    const result = formatCurrency(0, 'EUR', 'es');
    expect(result).toContain('0');
    expect(result).toContain('€');
  });

  it('handles negative values', () => {
    const result = formatCurrency(-42.5, 'EUR', 'en');
    expect(result).toContain('42.50');
  });
});

// ---------------------------------------------------------------------------
// formatDate
// ---------------------------------------------------------------------------

describe('formatDate', () => {
  const christmas = new Date(2025, 11, 25);

  it('formats short ES', () => {
    expect(formatDate(christmas, 'short', 'es')).toBe('25/12/2025');
  });

  it('formats short EN', () => {
    expect(formatDate(christmas, 'short', 'en')).toBe('12/25/2025');
  });

  it('formats medium ES', () => {
    const result = formatDate(christmas, 'medium', 'es');
    expect(result).toContain('25');
    expect(result).toContain('2025');
  });

  it('formats long ES', () => {
    const result = formatDate(christmas, 'long', 'es');
    expect(result.toLowerCase()).toContain('diciembre');
  });

  it('accepts ISO string input', () => {
    expect(formatDate('2025-12-25T00:00:00', 'short', 'es')).toBe('25/12/2025');
  });

  it('returns empty string for null', () => {
    expect(formatDate(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(formatDate(undefined)).toBe('');
  });

  it('returns empty string for invalid date string', () => {
    expect(formatDate('not-a-date')).toBe('');
  });
});

// ---------------------------------------------------------------------------
// formatPercentage
// ---------------------------------------------------------------------------

describe('formatPercentage', () => {
  it('formats with ES locale', () => {
    const result = formatPercentage(0.1534, 'es', 2);
    // Intl may use non-breaking space, normalize
    const normalized = result.replace(/\s/g, ' ');
    expect(normalized).toContain('15,34');
    expect(normalized).toContain('%');
  });

  it('formats with EN locale', () => {
    const result = formatPercentage(0.1534, 'en', 1);
    expect(result).toContain('15.3');
    expect(result).toContain('%');
  });

  it('handles 0', () => {
    const result = formatPercentage(0, 'es', 0);
    expect(result).toContain('0');
    expect(result).toContain('%');
  });

  it('returns empty string for null', () => {
    expect(formatPercentage(null)).toBe('');
  });

  it('returns empty string for NaN', () => {
    expect(formatPercentage(NaN)).toBe('');
  });
});

// ---------------------------------------------------------------------------
// formatIBAN
// ---------------------------------------------------------------------------

describe('formatIBAN', () => {
  it('formats standard Spanish IBAN', () => {
    expect(formatIBAN('ES7921000813610123456789')).toBe('ES79 2100 0813 6101 2345 6789');
  });

  it('formats already-spaced IBAN', () => {
    expect(formatIBAN('ES79 2100 0813')).toBe('ES79 2100 0813');
  });

  it('strips dashes before formatting', () => {
    expect(formatIBAN('ES79-2100-0813')).toBe('ES79 2100 0813');
  });

  it('handles short input', () => {
    expect(formatIBAN('ES79')).toBe('ES79');
  });

  it('returns empty string for null', () => {
    expect(formatIBAN(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(formatIBAN(undefined)).toBe('');
  });

  it('returns empty string for empty string', () => {
    expect(formatIBAN('')).toBe('');
  });
});

// ---------------------------------------------------------------------------
// formatNIF
// ---------------------------------------------------------------------------

describe('formatNIF', () => {
  it('formats standard NIF', () => {
    expect(formatNIF('12345678Z')).toBe('12.345.678-Z');
  });

  it('formats NIF with existing separators', () => {
    expect(formatNIF('12.345.678-Z')).toBe('12.345.678-Z');
  });

  it('formats lowercase NIF', () => {
    expect(formatNIF('12345678z')).toBe('12.345.678-Z');
  });

  it('formats NIE starting with X', () => {
    expect(formatNIF('X1234567L')).toBe('X-1.234.567-L');
  });

  it('formats NIE starting with Y', () => {
    expect(formatNIF('Y1234567L')).toBe('Y-1.234.567-L');
  });

  it('returns unformatted for invalid pattern', () => {
    expect(formatNIF('ABC')).toBe('ABC');
  });

  it('returns empty string for null', () => {
    expect(formatNIF(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(formatNIF(undefined)).toBe('');
  });

  it('returns empty string for empty string', () => {
    expect(formatNIF('')).toBe('');
  });
});
