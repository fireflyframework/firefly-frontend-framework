import { TestBed } from '@angular/core/testing';
import { TenantThemeService } from './tenant-theme.service';
import { BrandingConfig } from './tenant-theme.types';

const mockBranding: BrandingConfig = {
  id: 'brand-1',
  name: 'Test Brand',
  type: 'light',
  isDefault: true,
  logoUrl: 'https://example.com/logo.png',
  faviconUrl: 'https://example.com/favicon.ico',
  fontFamily: 'Inter',
  tokens: {
    '--ff-color-primary-600': '#ff0000',
    '--ff-color-secondary-600': '#00ff00',
  },
  darkTokens: {
    '--ff-color-primary-600': '#cc0000',
    '--ff-bg-primary': '#1a1a1a',
  },
};

const mockBrandingMinimal: BrandingConfig = {
  id: 'brand-2',
  name: 'Minimal',
  type: 'light',
  isDefault: false,
  tokens: { '--ff-color-primary-600': '#0000ff' },
};

describe('TenantThemeService', () => {
  let service: TenantThemeService;
  let root: HTMLElement;

  beforeEach(() => {
    // Clear DOM state
    root = document.documentElement;
    root.removeAttribute('data-theme');
    root.style.cssText = '';
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [TenantThemeService],
    });
    service = TestBed.inject(TenantThemeService);
  });

  // ---------------------------------------------------------------
  // Initial state
  // ---------------------------------------------------------------

  describe('initial state', () => {
    it('should have null currentTheme', () => {
      expect(service.currentTheme()).toBeNull();
    });

    it('should not be in dark mode by default', () => {
      expect(service.isDarkMode()).toBe(false);
    });

    it('should have null tenantLogo', () => {
      expect(service.tenantLogo()).toBeNull();
    });

    it('should not be loading', () => {
      expect(service.isLoading()).toBe(false);
    });

    it('should have no error', () => {
      expect(service.error()).toBeNull();
    });

    it('should default to system color mode', () => {
      expect(service.colorMode()).toBe('system');
    });
  });

  // ---------------------------------------------------------------
  // configure()
  // ---------------------------------------------------------------

  describe('configure()', () => {
    it('should set default color mode', () => {
      service.configure('ff-test-mode', 'dark');
      expect(service.colorMode()).toBe('dark');
    });

    it('should respect persisted mode over default', () => {
      localStorage.setItem('ff-test-mode', 'light');
      service.configure('ff-test-mode', 'dark');
      expect(service.colorMode()).toBe('light');
    });

    it('should apply dark data-theme attribute when configured dark', () => {
      service.configure('ff-test-mode', 'dark');
      expect(root.getAttribute('data-theme')).toBe('dark');
    });

    it('should not set data-theme for light mode', () => {
      service.configure('ff-test-mode', 'light');
      expect(root.getAttribute('data-theme')).toBeNull();
    });
  });

  // ---------------------------------------------------------------
  // loadBranding()
  // ---------------------------------------------------------------

  describe('loadBranding()', () => {
    it('should set currentTheme signal', () => {
      service.loadBranding(mockBranding);
      expect(service.currentTheme()).toBe(mockBranding);
    });

    it('should set tenantLogo from config', () => {
      service.loadBranding(mockBranding);
      expect(service.tenantLogo()).toBe('https://example.com/logo.png');
    });

    it('should clear previous error', () => {
      service.setError('Previous error');
      service.loadBranding(mockBranding);
      expect(service.error()).toBeNull();
    });

    it('should apply CSS tokens to root', () => {
      service.loadBranding(mockBranding);
      expect(root.style.getPropertyValue('--ff-color-primary-600')).toBe('#ff0000');
      expect(root.style.getPropertyValue('--ff-color-secondary-600')).toBe('#00ff00');
    });

    it('should update favicon', () => {
      const link = document.createElement('link');
      link.rel = 'icon';
      link.href = 'old-favicon.ico';
      document.head.appendChild(link);

      service.loadBranding(mockBranding);

      const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      expect(favicon?.href).toContain('favicon.ico');

      document.head.removeChild(link);
    });

    it('should set font-family custom property', () => {
      service.loadBranding(mockBranding);
      expect(root.style.getPropertyValue('--ff-font-family')).toBe('Inter');
    });

    it('should handle branding without optional fields', () => {
      service.loadBranding(mockBrandingMinimal);
      expect(service.tenantLogo()).toBeNull();
      expect(root.style.getPropertyValue('--ff-color-primary-600')).toBe('#0000ff');
    });
  });

  // ---------------------------------------------------------------
  // applyTheme()
  // ---------------------------------------------------------------

  describe('applyTheme()', () => {
    it('should apply light tokens by default', () => {
      service.applyTheme(mockBranding);
      expect(root.style.getPropertyValue('--ff-color-primary-600')).toBe('#ff0000');
      expect(root.style.getPropertyValue('--ff-color-secondary-600')).toBe('#00ff00');
    });

    it('should apply dark tokens when in dark mode', () => {
      service.setColorMode('dark');
      service.applyTheme(mockBranding);
      // Dark overrides base
      expect(root.style.getPropertyValue('--ff-color-primary-600')).toBe('#cc0000');
      // Dark-only token
      expect(root.style.getPropertyValue('--ff-bg-primary')).toBe('#1a1a1a');
      // Base token not overridden in dark
      expect(root.style.getPropertyValue('--ff-color-secondary-600')).toBe('#00ff00');
    });

    it('should clear previously applied tokens before applying new ones', () => {
      service.applyTheme(mockBranding);
      expect(root.style.getPropertyValue('--ff-color-secondary-600')).toBe('#00ff00');

      service.applyTheme(mockBrandingMinimal);
      // Old token should be removed
      expect(root.style.getPropertyValue('--ff-color-secondary-600')).toBe('');
      // New token applied
      expect(root.style.getPropertyValue('--ff-color-primary-600')).toBe('#0000ff');
    });
  });

  // ---------------------------------------------------------------
  // setColorMode() & toggleDarkMode()
  // ---------------------------------------------------------------

  describe('setColorMode()', () => {
    it('should update colorMode signal', () => {
      service.setColorMode('dark');
      expect(service.colorMode()).toBe('dark');
    });

    it('should persist to localStorage', () => {
      service.configure('ff-test-key', 'light');
      service.setColorMode('dark');
      expect(localStorage.getItem('ff-test-key')).toBe('dark');
    });

    it('should set data-theme=dark on <html>', () => {
      service.setColorMode('dark');
      expect(root.getAttribute('data-theme')).toBe('dark');
    });

    it('should remove data-theme when switching to light', () => {
      service.setColorMode('dark');
      service.setColorMode('light');
      expect(root.getAttribute('data-theme')).toBeNull();
    });

    it('should re-apply theme tokens when changing mode', () => {
      service.loadBranding(mockBranding);
      expect(root.style.getPropertyValue('--ff-color-primary-600')).toBe('#ff0000');

      service.setColorMode('dark');
      expect(root.style.getPropertyValue('--ff-color-primary-600')).toBe('#cc0000');
    });
  });

  describe('toggleDarkMode()', () => {
    it('should toggle from light to dark', () => {
      service.setColorMode('light');
      service.toggleDarkMode();
      expect(service.isDarkMode()).toBe(true);
    });

    it('should toggle from dark to light', () => {
      service.setColorMode('dark');
      service.toggleDarkMode();
      expect(service.isDarkMode()).toBe(false);
    });
  });

  // ---------------------------------------------------------------
  // resetTheme()
  // ---------------------------------------------------------------

  describe('resetTheme()', () => {
    it('should remove all applied CSS tokens', () => {
      service.loadBranding(mockBranding);
      service.resetTheme();
      expect(root.style.getPropertyValue('--ff-color-primary-600')).toBe('');
      expect(root.style.getPropertyValue('--ff-color-secondary-600')).toBe('');
    });

    it('should remove data-theme attribute', () => {
      service.setColorMode('dark');
      service.resetTheme();
      expect(root.getAttribute('data-theme')).toBeNull();
    });

    it('should remove font-family property', () => {
      service.loadBranding(mockBranding);
      service.resetTheme();
      expect(root.style.getPropertyValue('--ff-font-family')).toBe('');
    });

    it('should reset currentTheme to null', () => {
      service.loadBranding(mockBranding);
      service.resetTheme();
      expect(service.currentTheme()).toBeNull();
    });

    it('should reset colorMode to system', () => {
      service.setColorMode('dark');
      service.resetTheme();
      expect(service.colorMode()).toBe('system');
    });

    it('should clear error', () => {
      service.setError('Some error');
      service.resetTheme();
      expect(service.error()).toBeNull();
    });
  });

  // ---------------------------------------------------------------
  // Loading state helpers
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
      service.setError('Network failure');
      expect(service.error()).toBe('Network failure');
      expect(service.isLoading()).toBe(false);
    });
  });

  // ---------------------------------------------------------------
  // isDarkMode computed
  // ---------------------------------------------------------------

  describe('isDarkMode()', () => {
    it('should be false when light mode', () => {
      service.setColorMode('light');
      expect(service.isDarkMode()).toBe(false);
    });

    it('should be true when dark mode', () => {
      service.setColorMode('dark');
      expect(service.isDarkMode()).toBe(true);
    });
  });
});
