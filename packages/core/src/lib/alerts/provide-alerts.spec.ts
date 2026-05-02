import { TestBed } from '@angular/core/testing';
import { AlertService } from './alert.service';
import { ALERT_CONFIG, provideAlerts } from './provide-alerts';
import { AlertConfig } from './alert.types';

describe('provideAlerts()', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return valid EnvironmentProviders', () => {
    expect(() => {
      TestBed.configureTestingModule({
        providers: [provideAlerts()],
      });
    }).not.toThrow();
  });

  it('should register ALERT_CONFIG when config is provided', () => {
    const config: AlertConfig = { defaultToastDuration: 5000 };

    TestBed.configureTestingModule({
      providers: [provideAlerts(config)],
    });

    const injected = TestBed.inject(ALERT_CONFIG);
    expect(injected).toEqual(config);
  });

  it('should not register ALERT_CONFIG when no config is provided', () => {
    TestBed.configureTestingModule({
      providers: [provideAlerts()],
    });

    const injected = TestBed.inject(ALERT_CONFIG, undefined, { optional: true });
    expect(injected).toBeNull();
  });

  it('should make AlertService injectable', () => {
    TestBed.configureTestingModule({
      providers: [provideAlerts()],
    });

    const service = TestBed.inject(AlertService);
    expect(service).toBeInstanceOf(AlertService);
  });

  describe('config integration with AlertService', () => {
    it('should use defaultToastDuration from config', () => {
      vi.useFakeTimers();

      TestBed.configureTestingModule({
        providers: [provideAlerts({ defaultToastDuration: 1000 })],
      });

      const service = TestBed.inject(AlertService);
      service.toast('test', 'info');

      vi.advanceTimersByTime(999);
      expect(service.activeToasts()).toHaveLength(1);

      vi.advanceTimersByTime(1);
      expect(service.activeToasts()).toHaveLength(0);
    });

    it('should use built-in defaults when no config is provided', () => {
      vi.useFakeTimers();

      TestBed.configureTestingModule({
        providers: [provideAlerts()],
      });

      const service = TestBed.inject(AlertService);
      service.toast('test', 'info');

      // Default is 3000ms
      vi.advanceTimersByTime(2999);
      expect(service.activeToasts()).toHaveLength(1);

      vi.advanceTimersByTime(1);
      expect(service.activeToasts()).toHaveLength(0);
    });

    it('should use maxVisibleToasts from config', () => {
      TestBed.configureTestingModule({
        providers: [provideAlerts({ maxVisibleToasts: 2 })],
      });

      const service = TestBed.inject(AlertService);
      service.toast('A', 'info');
      service.toast('B', 'info');
      service.toast('C', 'info');

      expect(service.activeToasts()).toHaveLength(2);
      expect(service.activeToasts()[0].message).toBe('B');
      expect(service.activeToasts()[1].message).toBe('C');
    });

    it('should use maxVisibleBanners from config', () => {
      TestBed.configureTestingModule({
        providers: [provideAlerts({ maxVisibleBanners: 1 })],
      });

      const service = TestBed.inject(AlertService);
      service.banner('A', 'info');
      service.banner('B', 'info');

      expect(service.activeBanners()).toHaveLength(1);
      expect(service.activeBanners()[0].message).toBe('B');
    });

    it('should use defaultToastPosition from config', () => {
      TestBed.configureTestingModule({
        providers: [provideAlerts({ defaultToastPosition: 'bottom-left' })],
      });

      const service = TestBed.inject(AlertService);
      service.toast('test', 'info');

      expect(service.activeToasts()[0].options.position).toBe('bottom-left');
    });

    it('should allow per-toast position to override config default', () => {
      TestBed.configureTestingModule({
        providers: [provideAlerts({ defaultToastPosition: 'bottom-left' })],
      });

      const service = TestBed.inject(AlertService);
      service.toast('test', 'info', { position: 'top-right' });

      expect(service.activeToasts()[0].options.position).toBe('top-right');
    });

    it('should use defaultBannerPosition from config', () => {
      TestBed.configureTestingModule({
        providers: [provideAlerts({ defaultBannerPosition: 'bottom' })],
      });

      const service = TestBed.inject(AlertService);
      service.banner('test', 'info');

      expect(service.activeBanners()[0].options.position).toBe('bottom');
    });

    it('should still use error duration (5000ms) regardless of defaultToastDuration', () => {
      vi.useFakeTimers();

      TestBed.configureTestingModule({
        providers: [provideAlerts({ defaultToastDuration: 1000 })],
      });

      const service = TestBed.inject(AlertService);
      service.toast('error msg', 'error');

      // Error always uses ERROR_TOAST_DURATION (5000ms)
      vi.advanceTimersByTime(4999);
      expect(service.activeToasts()).toHaveLength(1);

      vi.advanceTimersByTime(1);
      expect(service.activeToasts()).toHaveLength(0);
    });
  });
});
