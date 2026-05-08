import { ApplicationInitStatus } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TenantThemeService } from './tenant-theme.service';
import {
  provideTenantTheming,
  TENANT_THEMING_CONFIG,
} from './provide-tenant-theming';
import { BrandingConfig, TenantThemingConfig } from './tenant-theme.types';

const mockBranding: BrandingConfig = {
  id: 'brand-1',
  name: 'Test Brand',
  type: 'light',
  isDefault: true,
  logoUrl: 'https://example.com/logo.png',
  tokens: { '--ff-color-primary-600': '#ff0000' },
};

function createConfig(
  overrides?: Partial<TenantThemingConfig>,
): TenantThemingConfig {
  return {
    loader: () => Promise.resolve(mockBranding),
    ...overrides,
  };
}

/** Wait for all APP_INITIALIZERs to complete. */
async function waitForInitializers(): Promise<void> {
  await TestBed.inject(ApplicationInitStatus).donePromise;
}

describe('provideTenantTheming()', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.cssText = '';
    localStorage.clear();
  });

  it('should return valid EnvironmentProviders', () => {
    expect(() => {
      TestBed.configureTestingModule({
        providers: [provideTenantTheming(createConfig())],
      });
    }).not.toThrow();
  });

  it('should register TENANT_THEMING_CONFIG', () => {
    const config = createConfig();
    TestBed.configureTestingModule({
      providers: [provideTenantTheming(config)],
    });

    const injected = TestBed.inject(TENANT_THEMING_CONFIG);
    expect(injected).toBe(config);
  });

  it('should make TenantThemeService injectable', () => {
    TestBed.configureTestingModule({
      providers: [provideTenantTheming(createConfig())],
    });

    const service = TestBed.inject(TenantThemeService);
    expect(service).toBeInstanceOf(TenantThemeService);
  });

  it('should load branding via loader at bootstrap', async () => {
    TestBed.configureTestingModule({
      providers: [provideTenantTheming(createConfig())],
    });

    await waitForInitializers();

    const service = TestBed.inject(TenantThemeService);
    expect(service.currentTheme()).toEqual(mockBranding);
  });

  it('should apply CSS tokens from loaded branding', async () => {
    TestBed.configureTestingModule({
      providers: [provideTenantTheming(createConfig())],
    });

    await waitForInitializers();

    const root = document.documentElement;
    expect(root.style.getPropertyValue('--ff-color-primary-600')).toBe(
      '#ff0000',
    );
  });

  it('should use defaultColorMode from config', () => {
    TestBed.configureTestingModule({
      providers: [
        provideTenantTheming(createConfig({ defaultColorMode: 'dark' })),
      ],
    });

    const service = TestBed.inject(TenantThemeService);
    expect(service.colorMode()).toBe('dark');
  });

  it('should default to system color mode when not specified', () => {
    TestBed.configureTestingModule({
      providers: [provideTenantTheming(createConfig())],
    });

    const service = TestBed.inject(TenantThemeService);
    expect(service.colorMode()).toBe('system');
  });

  it('should use custom storageKey for persistence', () => {
    TestBed.configureTestingModule({
      providers: [
        provideTenantTheming(
          createConfig({ storageKey: 'my-app-theme' }),
        ),
      ],
    });

    const service = TestBed.inject(TenantThemeService);
    service.setColorMode('dark');
    expect(localStorage.getItem('my-app-theme')).toBe('dark');
  });

  it('should handle loader failure gracefully', async () => {
    const failingConfig = createConfig({
      loader: () => Promise.reject(new Error('Network error')),
    });

    TestBed.configureTestingModule({
      providers: [provideTenantTheming(failingConfig)],
    });

    await waitForInitializers();

    const service = TestBed.inject(TenantThemeService);
    expect(service.currentTheme()).toBeNull();
    expect(service.error()).toBe('Network error');
    expect(service.isLoading()).toBe(false);
  });

  it('should handle non-Error throw gracefully', async () => {
    const failingConfig = createConfig({
      loader: () => Promise.reject('string error'),
    });

    TestBed.configureTestingModule({
      providers: [provideTenantTheming(failingConfig)],
    });

    await waitForInitializers();

    const service = TestBed.inject(TenantThemeService);
    expect(service.error()).toBe('Failed to load branding');
  });

  it('should set isLoading to false after successful load', async () => {
    TestBed.configureTestingModule({
      providers: [provideTenantTheming(createConfig())],
    });

    await waitForInitializers();

    const service = TestBed.inject(TenantThemeService);
    expect(service.isLoading()).toBe(false);
  });
});
