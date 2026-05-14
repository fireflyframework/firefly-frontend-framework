import { TestBed } from '@angular/core/testing';
import {
  TranslocoTestingModule,
  TranslocoService,
} from '@jsverse/transloco';

import { I18nService } from './i18n.service';
import { I18nConfig } from './i18n.types';

const flush = () => new Promise(r => setTimeout(r));

const EN_TRANSLATIONS = {
  'common.greeting': 'Hello',
  'common.farewell': 'Goodbye',
  'common.hello': 'Hello {{ name }}',
};

const ES_TRANSLATIONS = {
  'common.greeting': 'Hola',
  'common.farewell': 'Adiós',
  'common.hello': 'Hola {{ name }}',
};

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

const DEFAULT_CONFIG: I18nConfig = {
  defaultLocale: 'en',
  availableLocales: [
    { code: 'en', displayName: 'English' },
    { code: 'es', displayName: 'Español' },
  ],
};

describe('I18nService', () => {
  let service: I18nService;

  beforeEach(() => {
    localStorage.clear();
    setupTestBed();
    service = TestBed.inject(I18nService);
  });

  // ---------------------------------------------------------------
  // Initial state
  // ---------------------------------------------------------------

  describe('initial state', () => {
    it('should have currentLocale from transloco default', () => {
      expect(service.currentLocale()).toBe('en');
    });

    it('should have empty availableLocales before configure()', () => {
      expect(service.availableLocales()).toEqual([]);
    });

    it('should not be loading', () => {
      expect(service.isLoading()).toBe(false);
    });

    it('should have no error', () => {
      expect(service.error()).toBeNull();
    });

    it('should expose locale$ observable', () => {
      expect(service.locale$).toBeDefined();
      expect(typeof service.locale$.subscribe).toBe('function');
    });
  });

  // ---------------------------------------------------------------
  // configure()
  // ---------------------------------------------------------------

  describe('configure()', () => {
    it('should populate availableLocales from string array', () => {
      service.configure({
        defaultLocale: 'en',
        availableLocales: ['en', 'es'],
      });
      expect(service.availableLocales()).toEqual([
        { code: 'en', displayName: 'en' },
        { code: 'es', displayName: 'es' },
      ]);
    });

    it('should populate availableLocales from LocaleDefinition array', () => {
      service.configure(DEFAULT_CONFIG);
      expect(service.availableLocales()).toEqual([
        { code: 'en', displayName: 'English' },
        { code: 'es', displayName: 'Español' },
      ]);
    });

    it('should restore persisted locale if valid', () => {
      localStorage.setItem('ff-locale', 'es');
      service.configure(DEFAULT_CONFIG);
      expect(service.currentLocale()).toBe('es');
    });

    it('should ignore persisted locale if not in available list', () => {
      localStorage.setItem('ff-locale', 'fr');
      service.configure(DEFAULT_CONFIG);
      expect(service.currentLocale()).toBe('en');
    });

    it('should use custom storageKey', () => {
      localStorage.setItem('my-app-lang', 'es');
      service.configure({ ...DEFAULT_CONFIG, storageKey: 'my-app-lang' });
      expect(service.currentLocale()).toBe('es');
    });

    it('should disable persistence when storageKey is false', () => {
      localStorage.setItem('ff-locale', 'es');
      service.configure({ ...DEFAULT_CONFIG, storageKey: false });
      // Should NOT restore because persistence is disabled
      expect(service.currentLocale()).toBe('en');
    });
  });

  // ---------------------------------------------------------------
  // switchLocale()
  // ---------------------------------------------------------------

  describe('switchLocale()', () => {
    beforeEach(() => {
      service.configure(DEFAULT_CONFIG);
    });

    it('should switch to a valid locale', async () => {
      service.switchLocale('es');
      await flush();
      expect(service.currentLocale()).toBe('es');
    });

    it('should no-op for invalid locale', () => {
      service.switchLocale('fr');
      expect(service.currentLocale()).toBe('en');
    });

    it('should persist locale to localStorage', async () => {
      service.switchLocale('es');
      await flush();
      expect(localStorage.getItem('ff-locale')).toBe('es');
    });

    it('should clear previous error on switch', () => {
      service.setError('Previous error');
      service.switchLocale('es');
      expect(service.error()).toBeNull();
    });

    it('should not persist when storageKey is false', async () => {
      service.configure({ ...DEFAULT_CONFIG, storageKey: false });
      service.switchLocale('es');
      await flush();
      expect(localStorage.getItem('ff-locale')).toBeNull();
    });
  });

  // ---------------------------------------------------------------
  // translate()
  // ---------------------------------------------------------------

  describe('translate()', () => {
    it('should resolve a key synchronously', () => {
      expect(service.translate('common.greeting')).toBe('Hello');
    });

    it('should interpolate params', () => {
      expect(service.translate('common.hello', { name: 'World' })).toBe(
        'Hello World',
      );
    });

    it('should return key for missing translation', () => {
      expect(service.translate('missing.key')).toBe('missing.key');
    });

    it('should translate in active locale after switch', async () => {
      service.configure(DEFAULT_CONFIG);
      service.switchLocale('es');
      await flush();
      expect(service.translate('common.greeting')).toBe('Hola');
    });
  });

  // ---------------------------------------------------------------
  // selectTranslate()
  // ---------------------------------------------------------------

  describe('selectTranslate()', () => {
    it('should emit translated value', async () => {
      const value = await new Promise<string>((resolve) => {
        service.selectTranslate('common.greeting').subscribe((v) => resolve(v));
      });
      expect(value).toBe('Hello');
    });
  });

  // ---------------------------------------------------------------
  // Loading / Error helpers
  // ---------------------------------------------------------------

  describe('setLoading() / setError()', () => {
    it('should set loading state', () => {
      service.setLoading(true);
      expect(service.isLoading()).toBe(true);
      service.setLoading(false);
      expect(service.isLoading()).toBe(false);
    });

    it('should set error and clear loading', () => {
      service.setLoading(true);
      service.setError('Load failed');
      expect(service.error()).toBe('Load failed');
      expect(service.isLoading()).toBe(false);
    });
  });
});
