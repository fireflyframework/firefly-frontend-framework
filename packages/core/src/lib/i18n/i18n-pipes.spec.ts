import { TestBed } from '@angular/core/testing';
import {
  TranslocoTestingModule,
} from '@jsverse/transloco';

import { I18nService } from './i18n.service';
import { FfTranslatePipe } from './ff-translate.pipe';
import { FfCurrencyPipe } from './formatting/ff-currency.pipe';
import { FfDatePipe } from './formatting/ff-date.pipe';
import { FfPercentagePipe } from './formatting/ff-percentage.pipe';
import { FfIbanPipe } from './formatting/ff-iban.pipe';
import { FfNifPipe } from './formatting/ff-nif.pipe';

const EN_TRANSLATIONS = { 'hello': 'Hello', 'greeting': 'Hi {{ name }}' };
const ES_TRANSLATIONS = { 'hello': 'Hola', 'greeting': 'Hola {{ name }}' };

function setupTestBed(defaultLang = 'en'): void {
  TestBed.configureTestingModule({
    imports: [
      TranslocoTestingModule.forRoot({
        translocoConfig: {
          availableLangs: ['en', 'es'],
          defaultLang,
        },
        preloadLangs: true,
        langs: { en: EN_TRANSLATIONS, es: ES_TRANSLATIONS },
      }),
    ],
    providers: [I18nService],
  });
}

// ---------------------------------------------------------------
// FfTranslatePipe
// ---------------------------------------------------------------

describe('FfTranslatePipe', () => {
  let pipe: FfTranslatePipe;
  let service: I18nService;

  beforeEach(() => {
    localStorage.clear();
    setupTestBed();
    service = TestBed.inject(I18nService);
    service.configure({
      defaultLocale: 'en',
      availableLocales: ['en', 'es'],
    });
    pipe = TestBed.runInInjectionContext(() => new FfTranslatePipe());
  });

  it('should translate a key', () => {
    expect(pipe.transform('hello')).toBe('Hello');
  });

  it('should interpolate params', () => {
    expect(pipe.transform('greeting', { name: 'World' })).toBe('Hi World');
  });

  it('should return key for missing translation', () => {
    expect(pipe.transform('missing.key')).toBe('missing.key');
  });

  it('should reflect locale change', () => {
    service.switchLocale('es');
    expect(pipe.transform('hello')).toBe('Hola');
  });
});

// ---------------------------------------------------------------
// FfCurrencyPipe
// ---------------------------------------------------------------

describe('FfCurrencyPipe', () => {
  let pipe: FfCurrencyPipe;

  beforeEach(() => {
    localStorage.clear();
    setupTestBed('es');
    const service = TestBed.inject(I18nService);
    service.configure({
      defaultLocale: 'es',
      availableLocales: ['es', 'en'],
    });
    pipe = TestBed.runInInjectionContext(() => new FfCurrencyPipe());
  });

  it('should format currency with default EUR', () => {
    const result = pipe.transform(1234.5);
    // ICU formatting varies by runtime; check presence of number + currency
    expect(result).toContain('1234');
    expect(result).toContain('€');
  });

  it('should handle null', () => {
    expect(pipe.transform(null)).toBe('');
  });

  it('should handle undefined', () => {
    expect(pipe.transform(undefined)).toBe('');
  });

  it('should accept custom currency code', () => {
    const result = pipe.transform(100, 'USD');
    expect(result).toBeTruthy();
    expect(result).not.toBe('');
  });
});

// ---------------------------------------------------------------
// FfDatePipe
// ---------------------------------------------------------------

describe('FfDatePipe', () => {
  let pipe: FfDatePipe;

  beforeEach(() => {
    localStorage.clear();
    setupTestBed('es');
    const service = TestBed.inject(I18nService);
    service.configure({
      defaultLocale: 'es',
      availableLocales: ['es', 'en'],
    });
    pipe = TestBed.runInInjectionContext(() => new FfDatePipe());
  });

  it('should format a Date object', () => {
    const result = pipe.transform(new Date(2025, 11, 25));
    expect(result).toBeTruthy();
    expect(result).toContain('25');
  });

  it('should format an ISO string', () => {
    const result = pipe.transform('2025-12-25T00:00:00.000Z');
    expect(result).toBeTruthy();
  });

  it('should handle null', () => {
    expect(pipe.transform(null)).toBe('');
  });

  it('should handle undefined', () => {
    expect(pipe.transform(undefined)).toBe('');
  });

  it('should accept format parameter', () => {
    const short = pipe.transform(new Date(2025, 11, 25), 'short');
    const long = pipe.transform(new Date(2025, 11, 25), 'long');
    expect(short).toBeTruthy();
    expect(long).toBeTruthy();
    // Long format should be longer or equal to short
    expect(long.length).toBeGreaterThanOrEqual(short.length);
  });
});

// ---------------------------------------------------------------
// FfPercentagePipe
// ---------------------------------------------------------------

describe('FfPercentagePipe', () => {
  let pipe: FfPercentagePipe;

  beforeEach(() => {
    localStorage.clear();
    setupTestBed('es');
    const service = TestBed.inject(I18nService);
    service.configure({
      defaultLocale: 'es',
      availableLocales: ['es', 'en'],
    });
    pipe = TestBed.runInInjectionContext(() => new FfPercentagePipe());
  });

  it('should format a fraction as percentage', () => {
    const result = pipe.transform(0.1534);
    // Spanish format: 15,34 % or 15,34%
    expect(result).toContain('15');
    expect(result).toContain('34');
  });

  it('should respect decimal parameter', () => {
    const result = pipe.transform(0.1534, 1);
    expect(result).toContain('15');
    expect(result).toContain('3');
    // Should NOT contain 4th digit
    expect(result).not.toContain('34');
  });

  it('should handle null', () => {
    expect(pipe.transform(null)).toBe('');
  });

  it('should handle undefined', () => {
    expect(pipe.transform(undefined)).toBe('');
  });
});

// ---------------------------------------------------------------
// FfIbanPipe (locale-independent)
// ---------------------------------------------------------------

describe('FfIbanPipe', () => {
  let pipe: FfIbanPipe;

  beforeEach(() => {
    pipe = new FfIbanPipe();
  });

  it('should format a valid IBAN', () => {
    expect(pipe.transform('ES7921000813610123456789')).toBe(
      'ES79 2100 0813 6101 2345 6789',
    );
  });

  it('should handle null', () => {
    expect(pipe.transform(null)).toBe('');
  });

  it('should handle undefined', () => {
    expect(pipe.transform(undefined)).toBe('');
  });

  it('should handle empty string', () => {
    expect(pipe.transform('')).toBe('');
  });
});

// ---------------------------------------------------------------
// FfNifPipe (locale-independent)
// ---------------------------------------------------------------

describe('FfNifPipe', () => {
  let pipe: FfNifPipe;

  beforeEach(() => {
    pipe = new FfNifPipe();
  });

  it('should format a standard NIF', () => {
    expect(pipe.transform('12345678Z')).toBe('12.345.678-Z');
  });

  it('should format a NIE', () => {
    const result = pipe.transform('X1234567L');
    expect(result).toContain('X');
    expect(result).toContain('L');
  });

  it('should handle null', () => {
    expect(pipe.transform(null)).toBe('');
  });

  it('should handle undefined', () => {
    expect(pipe.transform(undefined)).toBe('');
  });

  it('should handle empty string', () => {
    expect(pipe.transform('')).toBe('');
  });
});
