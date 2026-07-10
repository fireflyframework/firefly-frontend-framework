import { describe, it, expect } from 'vitest';
import { formatDateTime } from './format-date-time';

describe('formatDateTime', () => {
  // The time half is rendered in the runner's timezone on purpose (it is what
  // the operator sees), so assertions match the shape, not a fixed hour.
  it('joins a short date and a 24h time with a middle dot', () => {
    expect(formatDateTime('2026-05-27T14:32:00Z', 'en-GB')).toMatch(
      /^\d{1,2} May 2026 · \d{2}:\d{2}$/,
    );
  });

  it('strips the abbreviated-month dot some locales emit', () => {
    const formatted = formatDateTime('2026-05-27T14:32:00Z', 'es-ES');
    expect(formatted).not.toContain('.');
    expect(formatted).toMatch(/·/);
  });

  it('renders the hour in 24h form, never with an AM/PM suffix', () => {
    const formatted = formatDateTime('2026-05-27T20:05:00Z', 'en-US');
    expect(formatted).not.toMatch(/AM|PM/i);
  });

  it('returns null for missing input', () => {
    expect(formatDateTime(null, 'es')).toBeNull();
    expect(formatDateTime(undefined, 'es')).toBeNull();
    expect(formatDateTime('', 'es')).toBeNull();
  });

  it('returns null for an unparsable timestamp', () => {
    expect(formatDateTime('not-a-date', 'es')).toBeNull();
  });
});
