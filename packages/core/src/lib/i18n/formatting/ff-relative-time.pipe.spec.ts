import { TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';

import { I18nService } from '../i18n.service';
import { FfRelativeTimePipe } from './ff-relative-time.pipe';

const EN_TRANSLATIONS = { 'common.relativeDate.justNow': 'just now' };

describe('FfRelativeTimePipe', () => {
  let pipe: FfRelativeTimePipe;
  const now = new Date('2026-05-27T12:00:00Z');
  const ago = (ms: number) => new Date(now.getTime() - ms).toISOString();

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [
        TranslocoTestingModule.forRoot({
          translocoConfig: { availableLangs: ['en'], defaultLang: 'en' },
          preloadLangs: true,
          langs: { en: EN_TRANSLATIONS },
        }),
      ],
      providers: [I18nService],
    });
    TestBed.inject(I18nService).configure({ defaultLocale: 'en', availableLocales: ['en'] });
    pipe = TestBed.runInInjectionContext(() => new FfRelativeTimePipe());
  });

  it('translates the sub-minute bucket', () => {
    expect(pipe.transform(ago(30_000), now)).toBe('just now');
  });

  it('counts minutes below an hour', () => {
    expect(pipe.transform(ago(12 * 60_000), now)).toMatch(/12/);
  });

  it('counts hours below a day', () => {
    expect(pipe.transform(ago(5 * 3_600_000), now)).toMatch(/5/);
  });

  it('counts days below a month', () => {
    expect(pipe.transform(ago(3 * 86_400_000), now)).toMatch(/3/);
  });

  it('falls back to an absolute date beyond 30 days', () => {
    expect(pipe.transform(ago(60 * 86_400_000), now)).toMatch(/2026/);
  });

  it('renders an em-dash for missing or unparsable input', () => {
    expect(pipe.transform(null, now)).toBe('—');
    expect(pipe.transform(undefined, now)).toBe('—');
    expect(pipe.transform('not-a-date', now)).toBe('—');
  });
});
