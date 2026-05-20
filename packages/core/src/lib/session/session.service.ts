import { Injectable, DestroyRef, inject, signal } from '@angular/core';
import { SessionState } from './session.types';
import { SESSION_TIMEOUT_CONFIG } from './session-timeout.config';

const ACTIVITY_EVENTS: (keyof DocumentEventMap)[] = [
  'mousemove',
  'keydown',
  'touchstart',
];

/** Minimum interval (ms) between activity resets to avoid excessive timer resets. */
const ACTIVITY_THROTTLE_MS = 5_000;

/**
 * Tracks user session lifecycle via inactivity detection.
 *
 * Manages a `sessionState` signal that transitions through:
 *   expired → active → expiring → expired
 *
 * - `startTracking(expiresIn)`: begins inactivity timer + DOM activity listeners
 * - `resetActivity()`: restarts the inactivity timer on user activity
 * - `stopTracking()`: cancels timer, removes listeners, resets state
 *
 * This service does NOT show dialogs or manage tokens — it only
 * emits state. The consumer decides how to react (show warning, logout, etc.).
 *
 * Configuration is injectable via `SESSION_TIMEOUT_CONFIG`.
 */
@Injectable()
export class SessionService {
  /** Current session lifecycle state. */
  readonly sessionState = signal<SessionState>('expired');

  private readonly config = inject(SESSION_TIMEOUT_CONFIG);
  private readonly destroyRef = inject(DestroyRef);

  private inactivityTimer: ReturnType<typeof setTimeout> | null = null;
  private warningTimer: ReturnType<typeof setTimeout> | null = null;
  private lastActivityTime = 0;

  /** Bound handler reference for adding/removing event listeners. */
  private readonly onActivity = () => this.handleActivity();

  constructor() {
    this.destroyRef.onDestroy(() => this.stopTracking());
  }

  /**
   * Start tracking session activity.
   * Sets state to 'active', registers DOM activity listeners,
   * and starts inactivity/warning timers.
   *
   * If already tracking, resets and restarts.
   *
   * @param expiresIn - Total session duration in seconds
   */
  startTracking(expiresIn: number): void {
    this.stopTracking();

    this.sessionState.set('active');
    this.addListeners();
    this.startTimers(expiresIn);
  }

  /**
   * Reset the inactivity timer due to user activity.
   * Only resets the inactivity timeout, not the absolute session expiry.
   */
  resetActivity(): void {
    if (this.sessionState() === 'expired') {
      return;
    }

    this.clearInactivityTimer();
    this.sessionState.set('active');
    this.startInactivityTimer();
  }

  /**
   * Stop all session tracking.
   * Cancels timers, removes DOM listeners, sets state to 'expired'.
   */
  stopTracking(): void {
    this.clearAllTimers();
    this.removeListeners();
    this.sessionState.set('expired');
  }

  /**
   * Start warning and inactivity timers for the session.
   *
   * @param expiresIn - Total session duration in seconds
   */
  private startTimers(expiresIn: number): void {
    const warningAt =
      (expiresIn - this.config.warningBeforeExpiry) * 1000;

    if (warningAt > 0) {
      this.warningTimer = setTimeout(() => {
        this.sessionState.set('expiring');
      }, warningAt);
    }

    this.startInactivityTimer();
  }

  /** Start the inactivity timer that expires the session after idle timeout. */
  private startInactivityTimer(): void {
    this.inactivityTimer = setTimeout(() => {
      this.sessionState.set('expired');
      this.removeListeners();
      this.clearAllTimers();
    }, this.config.inactivityTimeout * 1000);
  }

  /** Handle DOM activity events with throttling to avoid excessive timer resets. */
  private handleActivity(): void {
    const now = Date.now();
    if (now - this.lastActivityTime < ACTIVITY_THROTTLE_MS) {
      return;
    }
    this.lastActivityTime = now;
    this.resetActivity();
  }

  /** Register DOM event listeners for user activity detection. */
  private addListeners(): void {
    for (const event of ACTIVITY_EVENTS) {
      document.addEventListener(event, this.onActivity, { passive: true });
    }
  }

  /** Remove DOM event listeners for user activity detection. */
  private removeListeners(): void {
    for (const event of ACTIVITY_EVENTS) {
      document.removeEventListener(event, this.onActivity);
    }
  }

  /** Clear the inactivity timer if active. */
  private clearInactivityTimer(): void {
    if (this.inactivityTimer !== null) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }

  /** Clear both inactivity and warning timers. */
  private clearAllTimers(): void {
    this.clearInactivityTimer();
    if (this.warningTimer !== null) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
  }
}
