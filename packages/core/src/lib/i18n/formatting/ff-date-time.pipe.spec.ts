import { TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';

import { I18nService } from '../i18n.service';
import { FfDateTimePipe } from './ff-date-time.pipe';

describe('FfDateTimePipe', () => {
  let pipe: FfDateTimePipe;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [
        TranslocoTestingModule.forRoot({
          translocoConfig: { availableLangs: ['en'], defaultLang: 'en' },
          preloadLangs: true,
          langs: { en: {} },
        }),
      ],
      providers: [I18nService],
    });
    TestBed.inject(I18nService).configure({ defaultLocale: 'en', availableLocales: ['en'] });
    pipe = TestBed.runInInjectionContext(() => new FfDateTimePipe());
  });

  // The time half renders in the runner's timezone on purpose (it is what the
  // user sees), so the assertion matches the shape, not a fixed hour.
  it('renders a short date-time joined by a middle dot', () => {
    expect(pipe.transform('2026-05-27T14:32:00Z')).toMatch(/^May \d{1,2}, 2026 · \d{2}:\d{2}$/);
  });

  it('renders the hour in 24h form', () => {
    expect(pipe.transform('2026-05-27T20:05:00Z')).not.toMatch(/AM|PM/i);
  });

  it('renders an em-dash for missing or unparsable input', () => {
    expect(pipe.transform(null)).toBe('—');
    expect(pipe.transform(undefined)).toBe('—');
    expect(pipe.transform('not-a-date')).toBe('—');
  });
});
