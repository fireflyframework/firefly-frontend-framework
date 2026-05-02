import { TestBed } from '@angular/core/testing';
import { AlertService } from './alert.service';

describe('AlertService — toasts & banners', () => {
  let service: AlertService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlertService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ---------------------------------------------------------------
  // Toasts
  // ---------------------------------------------------------------

  describe('toast()', () => {
    it('should add a toast to activeToasts', () => {
      service.toast('Hello', 'success');

      expect(service.activeToasts()).toHaveLength(1);
      expect(service.activeToasts()[0].message).toBe('Hello');
      expect(service.activeToasts()[0].type).toBe('success');
    });

    it('should auto-dismiss after default duration (3000ms)', () => {
      service.toast('Temp', 'info');
      expect(service.activeToasts()).toHaveLength(1);

      vi.advanceTimersByTime(2999);
      expect(service.activeToasts()).toHaveLength(1);

      vi.advanceTimersByTime(1);
      expect(service.activeToasts()).toHaveLength(0);
    });

    it('should use 5000ms duration for error toasts by default', () => {
      service.toast('Error occurred', 'error');

      vi.advanceTimersByTime(3000);
      expect(service.activeToasts()).toHaveLength(1);

      vi.advanceTimersByTime(2000);
      expect(service.activeToasts()).toHaveLength(0);
    });

    it('should respect custom duration', () => {
      service.toast('Custom', 'info', { duration: 1000 });

      vi.advanceTimersByTime(999);
      expect(service.activeToasts()).toHaveLength(1);

      vi.advanceTimersByTime(1);
      expect(service.activeToasts()).toHaveLength(0);
    });

    it('should stack multiple toasts in FIFO order', () => {
      service.toast('First', 'info');
      service.toast('Second', 'success');
      service.toast('Third', 'warning');

      const toasts = service.activeToasts();
      expect(toasts).toHaveLength(3);
      expect(toasts[0].message).toBe('First');
      expect(toasts[1].message).toBe('Second');
      expect(toasts[2].message).toBe('Third');
    });

    it('should limit visible toasts to maxVisibleToasts (5)', () => {
      for (let i = 0; i < 7; i++) {
        service.toast(`Toast ${i}`, 'info');
      }

      const toasts = service.activeToasts();
      expect(toasts).toHaveLength(5);
      expect(toasts[0].message).toBe('Toast 2');
      expect(toasts[4].message).toBe('Toast 6');
    });

    it('should preserve all alert types', () => {
      const types = [
        'success',
        'error',
        'warning',
        'info',
        'destructive',
        'custom',
      ] as const;
      types.forEach((type) => service.toast(`msg-${type}`, type));

      // 5 max visible, so first one is removed
      expect(service.activeToasts()).toHaveLength(5);
      service.activeToasts().forEach((t) => {
        expect(types).toContain(t.type);
      });
    });
  });

  // ---------------------------------------------------------------
  // dismiss()
  // ---------------------------------------------------------------

  describe('dismiss()', () => {
    it('should remove a specific toast by ID', () => {
      service.toast('A', 'info');
      service.toast('B', 'success');

      const idA = service.activeToasts()[0].id;
      service.dismiss(idA);

      expect(service.activeToasts()).toHaveLength(1);
      expect(service.activeToasts()[0].message).toBe('B');
    });

    it('should clear the auto-dismiss timer when dismissed manually', () => {
      service.toast('Manual', 'info');
      const id = service.activeToasts()[0].id;

      service.dismiss(id);
      expect(service.activeToasts()).toHaveLength(0);

      // Advancing time should not cause errors or re-add the toast
      vi.advanceTimersByTime(5000);
      expect(service.activeToasts()).toHaveLength(0);
    });

    it('should be a no-op for unknown IDs', () => {
      service.toast('A', 'info');
      service.dismiss('nonexistent');

      expect(service.activeToasts()).toHaveLength(1);
    });
  });

  // ---------------------------------------------------------------
  // Banners
  // ---------------------------------------------------------------

  describe('banner()', () => {
    it('should add a banner to activeBanners', () => {
      service.banner('Maintenance', 'warning');

      expect(service.activeBanners()).toHaveLength(1);
      expect(service.activeBanners()[0].message).toBe('Maintenance');
      expect(service.activeBanners()[0].type).toBe('warning');
    });

    it('should persist until dismissBanner() when no duration set', () => {
      service.banner('Persistent', 'info');

      vi.advanceTimersByTime(60_000);
      expect(service.activeBanners()).toHaveLength(1);
    });

    it('should auto-dismiss when duration is set', () => {
      service.banner('Temp', 'success', { duration: 5000 });

      vi.advanceTimersByTime(4999);
      expect(service.activeBanners()).toHaveLength(1);

      vi.advanceTimersByTime(1);
      expect(service.activeBanners()).toHaveLength(0);
    });

    it('should limit visible banners to maxVisibleBanners (3)', () => {
      for (let i = 0; i < 5; i++) {
        service.banner(`Banner ${i}`, 'info');
      }

      const banners = service.activeBanners();
      expect(banners).toHaveLength(3);
      expect(banners[0].message).toBe('Banner 2');
      expect(banners[2].message).toBe('Banner 4');
    });
  });

  // ---------------------------------------------------------------
  // dismissBanner()
  // ---------------------------------------------------------------

  describe('dismissBanner()', () => {
    it('should remove a specific banner by ID', () => {
      service.banner('A', 'info');
      service.banner('B', 'warning');

      const idA = service.activeBanners()[0].id;
      service.dismissBanner(idA);

      expect(service.activeBanners()).toHaveLength(1);
      expect(service.activeBanners()[0].message).toBe('B');
    });

    it('should clear the auto-dismiss timer when dismissed manually', () => {
      service.banner('Timed', 'info', { duration: 3000 });
      const id = service.activeBanners()[0].id;

      service.dismissBanner(id);
      expect(service.activeBanners()).toHaveLength(0);

      vi.advanceTimersByTime(5000);
      expect(service.activeBanners()).toHaveLength(0);
    });
  });

  // ---------------------------------------------------------------
  // dismissAll()
  // ---------------------------------------------------------------

  describe('dismissAll()', () => {
    it('should clear all toasts and banners', () => {
      service.toast('T1', 'info');
      service.toast('T2', 'success');
      service.banner('B1', 'warning');

      service.dismissAll();

      expect(service.activeToasts()).toHaveLength(0);
      expect(service.activeBanners()).toHaveLength(0);
    });

    it('should clear all pending timers', () => {
      service.toast('T', 'info');
      service.banner('B', 'info', { duration: 5000 });

      service.dismissAll();

      // Advancing time should not cause errors
      vi.advanceTimersByTime(10_000);
      expect(service.activeToasts()).toHaveLength(0);
      expect(service.activeBanners()).toHaveLength(0);
    });
  });
});
