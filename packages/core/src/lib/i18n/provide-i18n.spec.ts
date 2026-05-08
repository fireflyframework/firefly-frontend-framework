import { ApplicationInitStatus } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { I18nService } from './i18n.service';
import { provideI18n, I18N_CONFIG } from './provide-i18n';
import { I18nConfig } from './i18n.types';

const TEST_CONFIG: I18nConfig = {
  defaultLocale: 'es',
  availableLocales: [
    { code: 'es', displayName: 'Español' },
    { code: 'en', displayName: 'English' },
  ],
  translationsPath: 'assets/i18n',
};

const ES_TRANSLATIONS = { greeting: 'Hola' };

describe('provideI18n()', () => {
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  function setup(config: I18nConfig = TEST_CONFIG): I18nService {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideI18n(config),
      ],
    });
    httpTesting = TestBed.inject(HttpTestingController);
    return TestBed.inject(I18nService);
  }

  async function flushAndInit(
    path = 'assets/i18n/es.json',
    translations: Record<string, unknown> = ES_TRANSLATIONS,
  ): Promise<void> {
    const initPromise = TestBed.inject(ApplicationInitStatus).donePromise;
    httpTesting.expectOne(path).flush(translations);
    await initPromise;
  }

  it('should return valid EnvironmentProviders', async () => {
    setup();
    await flushAndInit();
  });

  it('should register I18N_CONFIG token', async () => {
    setup();
    const injected = TestBed.inject(I18N_CONFIG);
    expect(injected).toBe(TEST_CONFIG);
    await flushAndInit();
  });

  it('should make I18nService injectable', async () => {
    const service = setup();
    expect(service).toBeInstanceOf(I18nService);
    await flushAndInit();
  });

  it('should load default locale translations at bootstrap', async () => {
    const service = setup();
    const initPromise = TestBed.inject(ApplicationInitStatus).donePromise;

    const req = httpTesting.expectOne('assets/i18n/es.json');
    expect(req.request.method).toBe('GET');
    req.flush(ES_TRANSLATIONS);

    await initPromise;
    expect(service.isLoading()).toBe(false);
    expect(service.error()).toBeNull();
  });

  it('should configure I18nService with availableLocales', async () => {
    const service = setup();
    await flushAndInit();

    expect(service.availableLocales()).toEqual([
      { code: 'es', displayName: 'Español' },
      { code: 'en', displayName: 'English' },
    ]);
  });

  it('should translate keys after bootstrap', async () => {
    const service = setup();
    await flushAndInit();
    expect(service.translate('greeting')).toBe('Hola');
  });

  it('should use custom translationsPath', async () => {
    setup({ ...TEST_CONFIG, translationsPath: 'i18n/custom' });
    await flushAndInit('i18n/custom/es.json');
  });

  it('should restore persisted locale on bootstrap', async () => {
    localStorage.setItem('ff-locale', 'en');
    const service = setup();

    const initPromise = TestBed.inject(ApplicationInitStatus).donePromise;
    httpTesting.expectOne('assets/i18n/en.json').flush({ greeting: 'Hello' });
    await initPromise;

    expect(service.currentLocale()).toBe('en');
  });
});
