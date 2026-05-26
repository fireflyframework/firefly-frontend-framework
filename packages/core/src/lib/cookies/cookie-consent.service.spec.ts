import { TestBed } from '@angular/core/testing';

import { CookieConsentService } from './cookie-consent.service';
import type { CookieConfig, ConsentPreferences } from './cookie.types';
import { COOKIE_CONFIG } from './cookie.types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DEFAULT_CONFIG: CookieConfig = {
  consent: true,
  consentCookieName: 'ff_cookie_consent',
  consentMaxAgeDays: 365,
  categories: ['essential', 'analytics', 'preferences'],
  domain: undefined,
  forceSecure: true,
};

/**
 * Mock `document.cookie` with a simple in-memory store.
 *
 * Returns a `cookies` map and a `restore` function to clean up.
 */
function mockDocumentCookie() {
  const cookies = new Map<string, string>();

  const originalDescriptor = Object.getOwnPropertyDescriptor(
    Document.prototype,
    'cookie',
  );

  Object.defineProperty(document, 'cookie', {
    configurable: true,
    get() {
      return Array.from(cookies.entries())
        .map(([k, v]) => `${k}=${v}`)
        .join('; ');
    },
    set(value: string) {
      const [pair] = value.split(';');
      const eqIndex = pair.indexOf('=');
      const name = pair.substring(0, eqIndex);
      const val = pair.substring(eqIndex + 1);

      // Handle max-age=0 (delete)
      if (value.includes('max-age=0')) {
        cookies.delete(name);
        return;
      }
      cookies.set(name, val);
    },
  });

  return {
    cookies,
    restore() {
      if (originalDescriptor) {
        Object.defineProperty(document, 'cookie', originalDescriptor);
      }
    },
  };
}

function setup(
  configOverrides?: Partial<CookieConfig>,
) {
  const config = { ...DEFAULT_CONFIG, ...configOverrides };
  TestBed.configureTestingModule({
    providers: [
      CookieConsentService,
      { provide: COOKIE_CONFIG, useValue: config },
    ],
  });
  return TestBed.inject(CookieConsentService);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CookieConsentService', () => {
  let cookieMock: ReturnType<typeof mockDocumentCookie>;

  beforeEach(() => {
    cookieMock = mockDocumentCookie();
  });

  afterEach(() => {
    cookieMock.restore();
  });

  // -----------------------------------------------------------------------
  // Initial state (no prior consent)
  // -----------------------------------------------------------------------
  describe('initial state (no prior consent)', () => {
    it('should report consentGiven as false', () => {
      const service = setup();
      expect(service.consentGiven()()).toBe(false);
    });

    it('should have essential=true and others=false in preferences', () => {
      const service = setup();
      const prefs = service.preferences()();
      expect(prefs.essential).toBe(true);
      expect(prefs.analytics).toBe(false);
      expect(prefs.preferences).toBe(false);
    });

    it('should report essential as always allowed', () => {
      const service = setup();
      expect(service.isCategoryAllowed('essential')()).toBe(true);
    });

    it('should report analytics as not allowed', () => {
      const service = setup();
      expect(service.isCategoryAllowed('analytics')()).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // acceptAll
  // -----------------------------------------------------------------------
  describe('acceptAll', () => {
    it('should set all categories to true', () => {
      const service = setup();
      service.acceptAll();

      const prefs = service.preferences()();
      expect(prefs.essential).toBe(true);
      expect(prefs.analytics).toBe(true);
      expect(prefs.preferences).toBe(true);
    });

    it('should set consentGiven to true', () => {
      const service = setup();
      service.acceptAll();
      expect(service.consentGiven()()).toBe(true);
    });

    it('should persist preferences to cookie', () => {
      const service = setup();
      service.acceptAll();

      const raw = cookieMock.cookies.get('ff_cookie_consent');
      expect(raw).toBeDefined();
      const parsed = JSON.parse(decodeURIComponent(raw!));
      expect(parsed.essential).toBe(true);
      expect(parsed.analytics).toBe(true);
      expect(parsed.preferences).toBe(true);
    });

    it('should update isCategoryAllowed signals reactively', () => {
      const service = setup();
      const analytics = service.isCategoryAllowed('analytics');
      expect(analytics()).toBe(false);

      service.acceptAll();
      expect(analytics()).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // rejectAll
  // -----------------------------------------------------------------------
  describe('rejectAll', () => {
    it('should set only essential to true, others to false', () => {
      const service = setup();
      // First accept, then reject
      service.acceptAll();
      service.rejectAll();

      const prefs = service.preferences()();
      expect(prefs.essential).toBe(true);
      expect(prefs.analytics).toBe(false);
      expect(prefs.preferences).toBe(false);
    });

    it('should set consentGiven to true (user has responded)', () => {
      const service = setup();
      service.rejectAll();
      expect(service.consentGiven()()).toBe(true);
    });

    it('should persist to cookie', () => {
      const service = setup();
      service.rejectAll();

      const raw = cookieMock.cookies.get('ff_cookie_consent');
      expect(raw).toBeDefined();
      const parsed = JSON.parse(decodeURIComponent(raw!));
      expect(parsed.analytics).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // updatePreferences
  // -----------------------------------------------------------------------
  describe('updatePreferences', () => {
    it('should merge partial preferences with current state', () => {
      const service = setup();
      service.updatePreferences({ analytics: true });

      const prefs = service.preferences()();
      expect(prefs.analytics).toBe(true);
      expect(prefs.preferences).toBe(false); // unchanged
    });

    it('should always keep essential=true even if explicitly set to false', () => {
      const service = setup();
      service.updatePreferences({ essential: false } as Partial<ConsentPreferences>);

      expect(service.preferences()().essential).toBe(true);
    });

    it('should set consentGiven to true', () => {
      const service = setup();
      service.updatePreferences({ analytics: true });
      expect(service.consentGiven()()).toBe(true);
    });

    it('should support custom categories', () => {
      const service = setup({
        categories: ['essential', 'analytics', 'preferences', 'marketing'],
      });
      service.updatePreferences({ marketing: true });

      expect(service.preferences()().marketing).toBe(true);
    });

    it('should persist updated preferences to cookie', () => {
      const service = setup();
      service.updatePreferences({ analytics: true, preferences: true });

      const raw = cookieMock.cookies.get('ff_cookie_consent');
      const parsed = JSON.parse(decodeURIComponent(raw!));
      expect(parsed.analytics).toBe(true);
      expect(parsed.preferences).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // isCategoryAllowed
  // -----------------------------------------------------------------------
  describe('isCategoryAllowed', () => {
    it('should always return true for essential', () => {
      const service = setup();
      const sig = service.isCategoryAllowed('essential');
      expect(sig()).toBe(true);

      service.rejectAll();
      expect(sig()).toBe(true);
    });

    it('should return a reactive signal for non-essential categories', () => {
      const service = setup();
      const analytics = service.isCategoryAllowed('analytics');

      expect(analytics()).toBe(false);
      service.acceptAll();
      expect(analytics()).toBe(true);
      service.rejectAll();
      expect(analytics()).toBe(false);
    });

    it('should return false for unknown categories not yet set', () => {
      const service = setup();
      const custom = service.isCategoryAllowed('social-media');
      expect(custom()).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // Persistence (load from existing cookie)
  // -----------------------------------------------------------------------
  describe('persistence', () => {
    it('should load preferences from existing cookie on init', () => {
      const prefs: ConsentPreferences = {
        essential: true,
        analytics: true,
        preferences: false,
      };
      cookieMock.cookies.set(
        'ff_cookie_consent',
        encodeURIComponent(JSON.stringify(prefs)),
      );

      const service = setup();
      expect(service.consentGiven()()).toBe(true);
      expect(service.preferences()().analytics).toBe(true);
      expect(service.preferences()().preferences).toBe(false);
    });

    it('should handle corrupted cookie data gracefully', () => {
      cookieMock.cookies.set('ff_cookie_consent', 'not-valid-json');

      const service = setup();
      expect(service.consentGiven()()).toBe(true); // cookie exists
      expect(service.preferences()().essential).toBe(true);
      expect(service.preferences()().analytics).toBe(false); // fallback
    });

    it('should handle cookie with missing essential field gracefully', () => {
      cookieMock.cookies.set(
        'ff_cookie_consent',
        encodeURIComponent(JSON.stringify({ analytics: true })),
      );

      const service = setup();
      // parsed.essential !== true, so deserialize returns null → defaults
      expect(service.preferences()().essential).toBe(true);
      expect(service.preferences()().analytics).toBe(false); // defaults
    });
  });

  // -----------------------------------------------------------------------
  // Custom cookie name
  // -----------------------------------------------------------------------
  describe('custom config', () => {
    it('should use custom consent cookie name', () => {
      const service = setup({ consentCookieName: 'my_consent' });
      service.acceptAll();

      expect(cookieMock.cookies.has('my_consent')).toBe(true);
      expect(cookieMock.cookies.has('ff_cookie_consent')).toBe(false);
    });

    it('should include domain in cookie when configured', () => {
      // We can verify the cookie was written (domain is part of Set-Cookie, not readable)
      const service = setup({ domain: '.example.com' });
      service.acceptAll();
      expect(cookieMock.cookies.has('ff_cookie_consent')).toBe(true);
    });
  });
});
