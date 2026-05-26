import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { CookieConsentService } from './cookie-consent.service';
import { FfCookieConsentDirective } from './cookie-consent.directive';
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

// ---------------------------------------------------------------------------
// Test host components
// ---------------------------------------------------------------------------

@Component({
  standalone: true,
  imports: [FfCookieConsentDirective],
  template: `
    <div *ffCookieConsent="category()" data-testid="consent-content">
      Visible content
    </div>
  `,
})
class TestHostComponent {
  category = signal<string>('analytics');
}

@Component({
  standalone: true,
  imports: [FfCookieConsentDirective],
  template: `
    <p *ffCookieConsent="'essential'" data-testid="essential-content">
      Essential content
    </p>
  `,
})
class EssentialHostComponent {}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('FfCookieConsentDirective', () => {
  let cookieMock: ReturnType<typeof mockDocumentCookie>;

  beforeEach(() => {
    cookieMock = mockDocumentCookie();
  });

  afterEach(() => {
    cookieMock.restore();
  });

  function setup<T>(hostComponent: new (...args: unknown[]) => T) {
    TestBed.configureTestingModule({
      imports: [hostComponent],
      providers: [
        CookieConsentService,
        { provide: COOKIE_CONFIG, useValue: DEFAULT_CONFIG },
      ],
    });

    const fixture = TestBed.createComponent(hostComponent);
    const consent = TestBed.inject(CookieConsentService);
    fixture.detectChanges();
    return { fixture, consent };
  }

  // -----------------------------------------------------------------------
  // Initial rendering
  // -----------------------------------------------------------------------
  describe('initial rendering', () => {
    it('should NOT render when category is not consented', () => {
      const { fixture } = setup(TestHostComponent);

      const el = fixture.nativeElement.querySelector('[data-testid="consent-content"]');
      expect(el).toBeNull();
    });

    it('should render when category is essential (always allowed)', () => {
      const { fixture } = setup(EssentialHostComponent);

      const el = fixture.nativeElement.querySelector('[data-testid="essential-content"]');
      expect(el).not.toBeNull();
      expect(el.textContent).toContain('Essential content');
    });
  });

  // -----------------------------------------------------------------------
  // Reactive updates
  // -----------------------------------------------------------------------
  describe('reactive updates', () => {
    it('should render after consent is given', () => {
      const { fixture, consent } = setup(TestHostComponent);

      // Initially not rendered
      expect(fixture.nativeElement.querySelector('[data-testid="consent-content"]')).toBeNull();

      // Accept all
      consent.acceptAll();
      fixture.detectChanges();

      const el = fixture.nativeElement.querySelector('[data-testid="consent-content"]');
      expect(el).not.toBeNull();
      expect(el.textContent).toContain('Visible content');
    });

    it('should remove content when consent is revoked', () => {
      const { fixture, consent } = setup(TestHostComponent);

      // Accept, then reject
      consent.acceptAll();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[data-testid="consent-content"]')).not.toBeNull();

      consent.rejectAll();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[data-testid="consent-content"]')).toBeNull();
    });

    it('should react to partial consent updates', () => {
      const { fixture, consent } = setup(TestHostComponent);

      // Only consent to analytics
      consent.updatePreferences({ analytics: true });
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('[data-testid="consent-content"]')).not.toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // Category switching
  // -----------------------------------------------------------------------
  describe('category switching', () => {
    it('should react when input category changes', () => {
      const { fixture, consent } = setup(TestHostComponent);
      const host = fixture.componentInstance;

      // Consent to analytics but not preferences
      consent.updatePreferences({ analytics: true });
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[data-testid="consent-content"]')).not.toBeNull();

      // Switch to preferences category (not consented)
      host.category.set('preferences');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[data-testid="consent-content"]')).toBeNull();

      // Consent to preferences
      consent.updatePreferences({ preferences: true });
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[data-testid="consent-content"]')).not.toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // Essential category
  // -----------------------------------------------------------------------
  describe('essential category', () => {
    it('should always render for essential even after rejectAll', () => {
      const { fixture, consent } = setup(EssentialHostComponent);

      consent.rejectAll();
      fixture.detectChanges();

      const el = fixture.nativeElement.querySelector('[data-testid="essential-content"]');
      expect(el).not.toBeNull();
    });
  });
});
