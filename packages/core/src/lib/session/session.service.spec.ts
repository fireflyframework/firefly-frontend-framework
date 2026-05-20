import { TestBed } from '@angular/core/testing';
import { SessionService } from './session.service';
import { SESSION_TIMEOUT_CONFIG } from './session-timeout.config';
import { SessionTimeoutConfig } from './session.types';
import { provideSession } from './provide-session';

describe('SessionService', () => {
  let service: SessionService;

  beforeEach(() => {
    vi.useFakeTimers();

    TestBed.configureTestingModule({ providers: [provideSession()] });
    service = TestBed.inject(SessionService);
  });

  afterEach(() => {
    service.stopTracking();
    vi.useRealTimers();
  });

  it('should have initial state as expired', () => {
    expect(service.sessionState()).toBe('expired');
  });

  it('should transition to active on startTracking', () => {
    service.startTracking(3600);
    expect(service.sessionState()).toBe('active');
  });

  it('should transition to expiring when warning timer fires', () => {
    // expiresIn=100, warningBeforeExpiry=60 → warning at 40s (before inactivity 1800s)
    service.startTracking(100);

    vi.advanceTimersByTime(39 * 1000);
    expect(service.sessionState()).toBe('active');

    vi.advanceTimersByTime(1 * 1000);
    expect(service.sessionState()).toBe('expiring');
  });

  it('should transition to expired when inactivity timer fires', () => {
    // default inactivityTimeout=1800s
    service.startTracking(3600);

    vi.advanceTimersByTime(1800 * 1000);
    expect(service.sessionState()).toBe('expired');
  });

  it('should reset inactivity timer on resetActivity', () => {
    service.startTracking(3600);

    // Advance 1700s (close to 1800s inactivity timeout)
    vi.advanceTimersByTime(1700 * 1000);
    expect(service.sessionState()).toBe('active');

    // Reset activity — timer restarts
    service.resetActivity();
    expect(service.sessionState()).toBe('active');

    // Advance another 1700s — still within new inactivity window
    vi.advanceTimersByTime(1700 * 1000);
    expect(service.sessionState()).toBe('active');

    // Advance remaining 100s to hit new inactivity timeout
    vi.advanceTimersByTime(100 * 1000);
    expect(service.sessionState()).toBe('expired');
  });

  it('should not reset activity when state is expired', () => {
    service.startTracking(3600);

    // Let inactivity expire
    vi.advanceTimersByTime(1800 * 1000);
    expect(service.sessionState()).toBe('expired');

    // resetActivity should be no-op
    service.resetActivity();
    expect(service.sessionState()).toBe('expired');
  });

  it('should cancel timers and set expired on stopTracking', () => {
    service.startTracking(3600);
    expect(service.sessionState()).toBe('active');

    service.stopTracking();
    expect(service.sessionState()).toBe('expired');

    // Advance past all timers — state should remain expired (timers cleared)
    vi.advanceTimersByTime(4000 * 1000);
    expect(service.sessionState()).toBe('expired');
  });

  it('should restart cleanly when startTracking is called multiple times', () => {
    service.startTracking(3600);
    vi.advanceTimersByTime(1000 * 1000);

    // Restart — should reset to active and restart timers
    service.startTracking(3600);
    expect(service.sessionState()).toBe('active');

    // Original inactivity timer (800s remaining) should NOT fire
    vi.advanceTimersByTime(800 * 1000);
    expect(service.sessionState()).toBe('active');

    // New inactivity timer fires at 1800s from restart
    vi.advanceTimersByTime(1000 * 1000);
    expect(service.sessionState()).toBe('expired');
  });

  it('should remove DOM listeners on stopTracking', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener');

    service.startTracking(3600);
    service.stopTracking();

    const removedEvents = removeSpy.mock.calls.map((c) => c[0]);
    expect(removedEvents).toContain('mousemove');
    expect(removedEvents).toContain('keydown');
    expect(removedEvents).toContain('touchstart');

    removeSpy.mockRestore();
  });

  it('should add DOM listeners on startTracking', () => {
    const addSpy = vi.spyOn(document, 'addEventListener');

    service.startTracking(3600);

    const addedEvents = addSpy.mock.calls.map((c) => c[0]);
    expect(addedEvents).toContain('mousemove');
    expect(addedEvents).toContain('keydown');
    expect(addedEvents).toContain('touchstart');

    addSpy.mockRestore();
  });

  it('should throttle activity events (5s interval)', () => {
    service.startTracking(3600);

    const resetSpy = vi.spyOn(service, 'resetActivity');

    // First event — should trigger
    document.dispatchEvent(new Event('mousemove'));
    expect(resetSpy).toHaveBeenCalledTimes(1);

    // Immediate second event — should be throttled
    document.dispatchEvent(new Event('mousemove'));
    expect(resetSpy).toHaveBeenCalledTimes(1);

    // After 5s — should trigger again
    vi.advanceTimersByTime(5000);
    document.dispatchEvent(new Event('mousemove'));
    expect(resetSpy).toHaveBeenCalledTimes(2);

    resetSpy.mockRestore();
  });

  it('should reset state to active on resetActivity from expiring', () => {
    // expiresIn=100, warningBeforeExpiry=60 → warning at 40s (before inactivity 1800s)
    service.startTracking(100);

    vi.advanceTimersByTime(40 * 1000);
    expect(service.sessionState()).toBe('expiring');

    // resetActivity should restore to active
    service.resetActivity();
    expect(service.sessionState()).toBe('active');
  });

  describe('with custom config', () => {
    const customConfig: SessionTimeoutConfig = {
      warningBeforeExpiry: 10,
      inactivityTimeout: 300,
    };

    beforeEach(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideSession(customConfig),
        ],
      });
      service = TestBed.inject(SessionService);
    });

    it('should respect custom inactivity timeout', () => {
      service.startTracking(600);

      vi.advanceTimersByTime(299 * 1000);
      expect(service.sessionState()).toBe('active');

      vi.advanceTimersByTime(1 * 1000);
      expect(service.sessionState()).toBe('expired');
    });

    it('should respect custom warning before expiry', () => {
      // expiresIn=600, warningBeforeExpiry=10 → warning at 590s
      service.startTracking(600);

      vi.advanceTimersByTime(289 * 1000);
      expect(service.sessionState()).toBe('active');

      // Inactivity fires first at 300s
      vi.advanceTimersByTime(11 * 1000);
      expect(service.sessionState()).toBe('expired');
    });
  });
});
