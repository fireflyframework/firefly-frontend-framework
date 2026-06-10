import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { I18nService } from '../i18n.service';
import { FfRelativeDayPipe } from './ff-relative-day.pipe';

const i18nStub = {
  translate: (key: string) =>
    key === 'common.relativeDate.today'
      ? 'Hoy'
      : key === 'common.relativeDate.yesterday'
        ? 'Ayer'
        : key,
  currentLocale: () => 'es',
};

function makePipe(): FfRelativeDayPipe {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [{ provide: I18nService, useValue: i18nStub }] });
  return TestBed.runInInjectionContext(() => new FfRelativeDayPipe());
}

const iso = (d: Date) => d.toISOString();

describe('FfRelativeDayPipe', () => {
  it('resolves today / yesterday through I18nService', () => {
    const pipe = makePipe();
    const now = new Date();
    const earlierToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 1, 0, 0);
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 12, 0, 0);
    expect(pipe.transform(iso(earlierToday))).toBe('Hoy');
    expect(pipe.transform(iso(yesterday))).toBe('Ayer');
  });

  it('formats older dates with the active locale (no hardcoded month names)', () => {
    const pipe = makePipe();
    const out = pipe.transform('2026-06-07T10:00:00.000Z');
    // Locale-formatted "D mmm" — not the today/yesterday labels, contains the day.
    expect(out).not.toBe('Hoy');
    expect(out).not.toBe('Ayer');
    expect(out).toMatch(/\d/);
    expect(out).toBe(new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' }).format(new Date('2026-06-07T10:00:00.000Z')));
  });

  it('returns em-dash for falsy / unparsable input', () => {
    const pipe = makePipe();
    expect(pipe.transform(undefined)).toBe('—');
    expect(pipe.transform(null)).toBe('—');
    expect(pipe.transform('')).toBe('—');
    expect(pipe.transform('not-a-date')).toBe('—');
  });
});
