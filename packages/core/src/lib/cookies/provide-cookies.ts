import type { Provider } from '@angular/core';
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import { CookieConsentService } from './cookie-consent.service';
import { CookieService } from './cookie.service';
import type { CookieConfig, CookieModuleOptions } from './cookie.types';
import { COOKIE_CONFIG } from './cookie.types';

/** Default configuration values. */
const DEFAULTS: CookieConfig = {
  consent: true,
  consentCookieName: 'ff_cookie_consent',
  consentMaxAgeDays: 365,
  categories: ['essential', 'analytics', 'preferences'],
  domain: undefined,
  forceSecure: true,
};

/**
 * Configure the Cookies module.
 *
 * Registers `CookieService` and, when consent is enabled (default),
 * also `CookieConsentService` for GDPR consent management.
 *
 * This is an **EXTENDED** module — call `provideCookies()` in your
 * `appConfig` providers to enable typed cookie management with
 * optional GDPR consent enforcement.
 *
 * @example
 * ```ts
 * import { provideCookies } from '@fireflyframework/core';
 *
 * // With consent (default — GDPR-compliant)
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideCookies(),
 *   ],
 * };
 *
 * // Without consent management
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideCookies({ consent: false }),
 *   ],
 * };
 *
 * // Custom categories
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideCookies({
 *       categories: ['essential', 'analytics', 'preferences', 'marketing'],
 *       consentMaxAgeDays: 180,
 *     }),
 *   ],
 * };
 * ```
 *
 * @param options - Optional configuration. See `CookieModuleOptions` for details.
 * @returns EnvironmentProviders to register in the application config
 */
export function provideCookies(
  options?: CookieModuleOptions,
): EnvironmentProviders {
  const consent = options?.consent ?? DEFAULTS.consent;

  const categories = options?.categories ?? DEFAULTS.categories;
  const normalizedCategories = categories.includes('essential')
    ? categories
    : ['essential', ...categories];

  const config: CookieConfig = {
    consent,
    consentCookieName:
      options?.consentCookieName ?? DEFAULTS.consentCookieName,
    consentMaxAgeDays:
      options?.consentMaxAgeDays ?? DEFAULTS.consentMaxAgeDays,
    categories: normalizedCategories,
    domain: options?.domain ?? DEFAULTS.domain,
    forceSecure: options?.forceSecure ?? DEFAULTS.forceSecure,
  };

  const providers: (Provider | EnvironmentProviders)[] = [
    { provide: COOKIE_CONFIG, useValue: config },
    CookieService,
  ];

  if (consent) {
    providers.push(CookieConsentService);
  }

  return makeEnvironmentProviders(providers);
}
