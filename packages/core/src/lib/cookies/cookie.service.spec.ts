import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { CookieConsentService } from './cookie-consent.service';
import { CookieService } from './cookie.service';
import type { CookieConfig } from './cookie.types';
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
 * Returns a `cookies` map, a `written` array (raw strings) and a `restore` function.
 */
function mockDocumentCookie() {
  const cookies = new Map<string, string>();
  const written: string[] = [];

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
      written.push(value);
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
    written,
    restore() {
      if (originalDescriptor) {
        Object.defineProperty(document, 'cookie', originalDescriptor);
      }
    },
  };
}

/** Setup TestBed with CookieService and optionally CookieConsentService. */
function setup(options?: {
  configOverrides?: Partial<CookieConfig>;
  withConsent?: boolean;
}) {
  const config = { ...DEFAULT_CONFIG, ...options?.configOverrides };
  const providers: unknown[] = [
    CookieService,
    { provide: COOKIE_CONFIG, useValue: config },
  ];

  if (options?.withConsent !== false) {
    providers.push(CookieConsentService);
  }

  TestBed.configureTestingModule({ providers });

  const service = TestBed.inject(CookieService);
  const consent =
    options?.withConsent !== false
      ? TestBed.inject(CookieConsentService)
      : null;

  return { service, consent, config };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CookieService', () => {
  let cookieMock: ReturnType<typeof mockDocumentCookie>;

  beforeEach(() => {
    cookieMock = mockDocumentCookie();
  });

  afterEach(() => {
    cookieMock.restore();
  });

  // -----------------------------------------------------------------------
  // get()
  // -----------------------------------------------------------------------
  describe('get', () => {
    it('should return null when cookie does not exist', () => {
      const { service } = setup();
      expect(service.get('nonexistent')).toBeNull();
    });

    it('should return the cookie value when it exists', () => {
      cookieMock.cookies.set('theme', 'dark');
      const { service } = setup();
      expect(service.get('theme')).toBe('dark');
    });

    it('should decode URI-encoded values', () => {
      cookieMock.cookies.set('data', encodeURIComponent('hello world'));
      const { service } = setup();
      expect(service.get('data')).toBe('hello world');
    });

    it('should handle cookies with = in the value', () => {
      cookieMock.cookies.set('token', 'abc=def=ghi');
      const { service } = setup();
      expect(service.get('token')).toBe('abc=def=ghi');
    });

    it('should not match partial cookie names', () => {
      cookieMock.cookies.set('theme_v2', 'blue');
      const { service } = setup();
      expect(service.get('theme')).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // set() — basic writing
  // -----------------------------------------------------------------------
  describe('set (basic)', () => {
    it('should write a cookie with default path and SameSite', () => {
      const { service } = setup();
      service.set('theme', 'dark');

      expect(cookieMock.cookies.has('theme')).toBe(true);
      const raw = cookieMock.written[cookieMock.written.length - 1];
      expect(raw).toContain('path=/');
      expect(raw).toContain('SameSite=Lax');
    });

    it('should URI-encode the value', () => {
      const { service } = setup();
      service.set('msg', 'hello world');

      const raw = cookieMock.written[cookieMock.written.length - 1];
      expect(raw).toContain('msg=hello%20world');
    });

    it('should set custom path', () => {
      const { service } = setup();
      service.set('x', '1', { path: '/app' });

      const raw = cookieMock.written[cookieMock.written.length - 1];
      expect(raw).toContain('path=/app');
    });

    it('should set domain from options', () => {
      const { service } = setup();
      service.set('x', '1', { domain: '.example.com' });

      const raw = cookieMock.written[cookieMock.written.length - 1];
      expect(raw).toContain('domain=.example.com');
    });

    it('should use config domain when no option domain is provided', () => {
      const { service } = setup({
        configOverrides: { domain: '.mysite.com' },
      });
      service.set('x', '1');

      const raw = cookieMock.written[cookieMock.written.length - 1];
      expect(raw).toContain('domain=.mysite.com');
    });

    it('should set max-age from maxAgeDays', () => {
      const { service } = setup();
      service.set('x', '1', { maxAgeDays: 7 });

      const raw = cookieMock.written[cookieMock.written.length - 1];
      const expectedSeconds = 7 * 24 * 60 * 60;
      expect(raw).toContain(`max-age=${expectedSeconds}`);
    });

    it('should set Secure when forceSecure is true in config', () => {
      const { service } = setup({ configOverrides: { forceSecure: true } });
      service.set('x', '1');

      const raw = cookieMock.written[cookieMock.written.length - 1];
      expect(raw).toContain('Secure');
    });

    it('should not set Secure when forceSecure is false and no option', () => {
      const { service } = setup({ configOverrides: { forceSecure: false } });
      service.set('x', '1');

      const raw = cookieMock.written[cookieMock.written.length - 1];
      expect(raw).not.toContain('Secure');
    });

    it('should override config forceSecure with option secure=false', () => {
      const { service } = setup({ configOverrides: { forceSecure: true } });
      service.set('x', '1', { secure: false });

      const raw = cookieMock.written[cookieMock.written.length - 1];
      expect(raw).not.toContain('Secure');
    });

    it('should set SameSite=Strict when specified', () => {
      const { service } = setup();
      service.set('x', '1', { sameSite: 'Strict' });

      const raw = cookieMock.written[cookieMock.written.length - 1];
      expect(raw).toContain('SameSite=Strict');
    });

    it('should set SameSite=None when specified', () => {
      const { service } = setup();
      service.set('x', '1', { sameSite: 'None' });

      const raw = cookieMock.written[cookieMock.written.length - 1];
      expect(raw).toContain('SameSite=None');
    });
  });

  // -----------------------------------------------------------------------
  // set() — consent enforcement
  // -----------------------------------------------------------------------
  describe('set (consent enforcement)', () => {
    it('should allow writing cookies with no category', () => {
      const { service } = setup();
      service.set('generic', 'value');

      expect(cookieMock.cookies.has('generic')).toBe(true);
    });

    it('should allow writing essential cookies', () => {
      const { service } = setup();
      service.set('session', 'abc', { category: 'essential' });

      expect(cookieMock.cookies.has('session')).toBe(true);
    });

    it('should block non-essential cookies when consent not given', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation();
      const { service } = setup();

      service.set('tracker', 'xyz', { category: 'analytics' });

      expect(cookieMock.cookies.has('tracker')).toBe(false);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Blocked'),
      );
      warnSpy.mockRestore();
    });

    it('should allow non-essential cookies after consent is given', () => {
      const { service, consent } = setup();
      consent!.acceptAll();

      service.set('tracker', 'xyz', { category: 'analytics' });

      expect(cookieMock.cookies.has('tracker')).toBe(true);
    });

    it('should block specific category when only others are consented', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation();
      const { service, consent } = setup();
      consent!.updatePreferences({ analytics: true });

      service.set('pref_cookie', 'val', { category: 'preferences' });

      expect(cookieMock.cookies.has('pref_cookie')).toBe(false);
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('should allow specific category after it is consented', () => {
      const { service, consent } = setup();
      consent!.updatePreferences({ preferences: true });

      service.set('pref_cookie', 'val', { category: 'preferences' });

      expect(cookieMock.cookies.has('pref_cookie')).toBe(true);
    });

    it('should include category name in warning message', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation();
      const { service } = setup();

      service.set('x', '1', { category: 'analytics' });

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('analytics'),
      );
      warnSpy.mockRestore();
    });
  });

  // -----------------------------------------------------------------------
  // set() — no consent service (consent disabled)
  // -----------------------------------------------------------------------
  describe('set (consent disabled)', () => {
    it('should allow all cookies when CookieConsentService is not registered', () => {
      const { service } = setup({ withConsent: false });

      service.set('tracker', 'xyz', { category: 'analytics' });

      expect(cookieMock.cookies.has('tracker')).toBe(true);
    });

    it('should not emit warnings when consent service is absent', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation();
      const { service } = setup({ withConsent: false });

      service.set('tracker', 'xyz', { category: 'analytics' });

      expect(warnSpy).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });

  // -----------------------------------------------------------------------
  // delete()
  // -----------------------------------------------------------------------
  describe('delete', () => {
    it('should remove a cookie by setting max-age=0', () => {
      cookieMock.cookies.set('theme', 'dark');
      const { service } = setup();

      service.delete('theme');

      expect(cookieMock.cookies.has('theme')).toBe(false);
    });

    it('should include default path in delete', () => {
      cookieMock.cookies.set('x', '1');
      const { service } = setup();

      service.delete('x');

      const raw = cookieMock.written[cookieMock.written.length - 1];
      expect(raw).toContain('path=/');
      expect(raw).toContain('max-age=0');
    });

    it('should use custom path when provided', () => {
      cookieMock.cookies.set('x', '1');
      const { service } = setup();

      service.delete('x', { path: '/admin' });

      const raw = cookieMock.written[cookieMock.written.length - 1];
      expect(raw).toContain('path=/admin');
    });

    it('should include domain when provided', () => {
      cookieMock.cookies.set('x', '1');
      const { service } = setup();

      service.delete('x', { domain: '.example.com' });

      const raw = cookieMock.written[cookieMock.written.length - 1];
      expect(raw).toContain('domain=.example.com');
    });

    it('should use config domain when no option domain is provided', () => {
      cookieMock.cookies.set('x', '1');
      const { service } = setup({
        configOverrides: { domain: '.mysite.com' },
      });

      service.delete('x');

      const raw = cookieMock.written[cookieMock.written.length - 1];
      expect(raw).toContain('domain=.mysite.com');
    });
  });

  // -----------------------------------------------------------------------
  // getAll()
  // -----------------------------------------------------------------------
  describe('getAll', () => {
    it('should return empty object when no cookies exist', () => {
      const { service } = setup();
      expect(service.getAll()).toEqual({});
    });

    it('should return all cookies as key-value pairs', () => {
      cookieMock.cookies.set('a', '1');
      cookieMock.cookies.set('b', '2');
      const { service } = setup();

      const all = service.getAll();
      expect(all).toEqual({ a: '1', b: '2' });
    });

    it('should decode URI-encoded values', () => {
      cookieMock.cookies.set('msg', encodeURIComponent('hello world'));
      const { service } = setup();

      const all = service.getAll();
      expect(all['msg']).toBe('hello world');
    });

    it('should handle cookies with = in the value', () => {
      cookieMock.cookies.set('token', 'abc=def');
      const { service } = setup();

      const all = service.getAll();
      expect(all['token']).toBe('abc=def');
    });
  });
});
