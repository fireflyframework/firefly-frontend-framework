import { InjectionToken } from '@angular/core';
import { SessionTimeoutConfig } from './session.types';

/** Default session timeout configuration. */
export const DEFAULT_SESSION_TIMEOUT: SessionTimeoutConfig = {
  warningBeforeExpiry: 60,
  inactivityTimeout: 1800,
};

/**
 * Injection token for session timeout configuration.
 * Override via providers to customize timeout values per product.
 *
 * ```typescript
 * providers: [
 *   { provide: SESSION_TIMEOUT_CONFIG, useValue: { warningBeforeExpiry: 30, inactivityTimeout: 900 } }
 * ]
 * ```
 */
export const SESSION_TIMEOUT_CONFIG = new InjectionToken<SessionTimeoutConfig>(
  'SESSION_TIMEOUT_CONFIG',
  { factory: () => DEFAULT_SESSION_TIMEOUT },
);
