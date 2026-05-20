import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { SecurityService, SECURITY_CONFIG } from './security.service';

describe('SecurityService', () => {
  function setup(config?: object, cookieStr = '') {
    TestBed.configureTestingModule({
      providers: [
        SecurityService,
        { provide: DOCUMENT, useValue: { cookie: cookieStr } },
        ...(config ? [{ provide: SECURITY_CONFIG, useValue: config }] : []),
      ],
    });
    return TestBed.inject(SecurityService);
  }

  // -----------------------------------------------------------------
  // Config resolution
  // -----------------------------------------------------------------
  it('should apply defaults when no config provided', () => {
    const svc = setup();
    expect(svc.config().csrf?.enabled).toBe(true);
    expect(svc.config().csrf?.cookieName).toBe('XSRF-TOKEN');
    expect(svc.config().csrf?.headerName).toBe('X-XSRF-TOKEN');
    expect(svc.config().piiMasking).toBe('manual');
  });

  it('should merge user config with defaults', () => {
    const svc = setup({ csrf: { cookieName: 'MY-TOKEN' }, piiMasking: 'auto' });
    expect(svc.config().csrf?.cookieName).toBe('MY-TOKEN');
    expect(svc.config().csrf?.headerName).toBe('X-XSRF-TOKEN'); // default preserved
    expect(svc.config().piiMasking).toBe('auto');
  });

  it('should allow disabling CSRF', () => {
    const svc = setup({ csrf: { enabled: false } });
    expect(svc.config().csrf?.enabled).toBe(false);
  });

  // -----------------------------------------------------------------
  // CSRF token — cookie
  // -----------------------------------------------------------------
  it('should read CSRF token from cookie', () => {
    const svc = setup(undefined, 'XSRF-TOKEN=abc123; other=xyz');
    expect(svc.getCsrfToken()).toBe('abc123');
  });

  it('should return null when cookie not present', () => {
    const svc = setup(undefined, 'other=xyz');
    expect(svc.getCsrfToken()).toBeNull();
  });

  it('should read from custom cookie name', () => {
    const svc = setup({ csrf: { cookieName: 'MY-CSRF' } }, 'MY-CSRF=custom123');
    expect(svc.getCsrfToken()).toBe('custom123');
  });

  // -----------------------------------------------------------------
  // CSRF token — manual override
  // -----------------------------------------------------------------
  it('should return manual token when set', () => {
    const svc = setup(undefined, 'XSRF-TOKEN=cookie-val');
    svc.setCsrfToken('manual-val');
    expect(svc.getCsrfToken()).toBe('manual-val');
  });

  it('should fall back to cookie after clearing manual token', () => {
    const svc = setup(undefined, 'XSRF-TOKEN=cookie-val');
    svc.setCsrfToken('manual-val');
    svc.clearCsrfToken();
    expect(svc.getCsrfToken()).toBe('cookie-val');
  });

  // -----------------------------------------------------------------
  // SSR safety
  // -----------------------------------------------------------------
  it('should return null when document has no cookie', () => {
    const svc = setup(undefined, '');
    expect(svc.getCsrfToken()).toBeNull();
  });
});
