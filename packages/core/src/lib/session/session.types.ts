/**
 * Possible states of a user session lifecycle.
 * - 'active': session is valid and user is active
 * - 'expiring': session is about to expire (warning window)
 * - 'expired': session has expired or was never started
 */
export type SessionState = 'active' | 'expiring' | 'expired';

/**
 * Configuration for session timeout behavior.
 */
export interface SessionTimeoutConfig {
  /** Seconds before token expiry to transition to 'expiring' state */
  warningBeforeExpiry: number;
  /** Seconds of inactivity before session is considered expired */
  inactivityTimeout: number;
}
