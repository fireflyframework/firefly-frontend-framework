import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';
import { FireflyEvent, NotificationAdapter, NOTIFICATION_CONFIG } from './notification.types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createEvent(overrides?: Partial<FireflyEvent>): FireflyEvent {
  return {
    type: 'test.event',
    product: 'test-app',
    severity: 'info',
    message: 'Test event',
    timestamp: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function createMockAdapter(
  name: string,
  supportsFn: (eventType: string) => boolean = () => true,
): NotificationAdapter & { send: ReturnType<typeof vi.fn> } {
  return {
    name,
    supports: supportsFn,
    send: vi.fn().mockResolvedValue(undefined),
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('NotificationService', () => {
  function setup() {
    TestBed.configureTestingModule({
      providers: [NotificationService],
    });
    return TestBed.inject(NotificationService);
  }

  // -----------------------------------------------------------------------
  // registerAdapter
  // -----------------------------------------------------------------------
  describe('registerAdapter', () => {
    it('should register an adapter', () => {
      const svc = setup();
      const adapter = createMockAdapter('test');
      svc.registerAdapter(adapter);
      expect(svc.getAdapters()).toEqual([adapter]);
    });

    it('should ignore duplicate adapters with the same name', () => {
      const svc = setup();
      const a1 = createMockAdapter('dup');
      const a2 = createMockAdapter('dup');
      svc.registerAdapter(a1);
      svc.registerAdapter(a2);
      expect(svc.getAdapters().length).toBe(1);
      expect(svc.getAdapters()[0]).toBe(a1);
    });

    it('should allow multiple adapters with different names', () => {
      const svc = setup();
      svc.registerAdapter(createMockAdapter('alpha'));
      svc.registerAdapter(createMockAdapter('beta'));
      svc.registerAdapter(createMockAdapter('gamma'));
      expect(svc.getAdapters().length).toBe(3);
    });
  });

  // -----------------------------------------------------------------------
  // emit
  // -----------------------------------------------------------------------
  describe('emit', () => {
    it('should call send() on all adapters that support the event type', async () => {
      const svc = setup();
      const a1 = createMockAdapter('a1');
      const a2 = createMockAdapter('a2');
      svc.registerAdapter(a1);
      svc.registerAdapter(a2);

      const event = createEvent();
      await svc.emit(event);

      expect(a1.send).toHaveBeenCalledWith(event);
      expect(a2.send).toHaveBeenCalledWith(event);
    });

    it('should skip adapters that do not support the event type', async () => {
      const svc = setup();
      const supported = createMockAdapter('yes', () => true);
      const unsupported = createMockAdapter('no', () => false);
      svc.registerAdapter(supported);
      svc.registerAdapter(unsupported);

      await svc.emit(createEvent());

      expect(supported.send).toHaveBeenCalledTimes(1);
      expect(unsupported.send).not.toHaveBeenCalled();
    });

    it('should filter based on event type passed to supports()', async () => {
      const svc = setup();
      const onlyCritical = createMockAdapter(
        'critical-only',
        (eventType) => eventType.startsWith('error.'),
      );
      svc.registerAdapter(onlyCritical);

      await svc.emit(createEvent({ type: 'info.deploy' }));
      expect(onlyCritical.send).not.toHaveBeenCalled();

      await svc.emit(createEvent({ type: 'error.unhandled' }));
      expect(onlyCritical.send).toHaveBeenCalledTimes(1);
    });

    it('should not throw when a single adapter fails (Promise.allSettled)', async () => {
      const svc = setup();
      const failing = createMockAdapter('failing');
      failing.send.mockRejectedValue(new Error('network error'));
      const healthy = createMockAdapter('healthy');
      svc.registerAdapter(failing);
      svc.registerAdapter(healthy);

      // Should not throw
      await expect(svc.emit(createEvent())).resolves.toBeUndefined();
      expect(healthy.send).toHaveBeenCalledTimes(1);
    });

    it('should resolve when no adapters are registered', async () => {
      const svc = setup();
      await expect(svc.emit(createEvent())).resolves.toBeUndefined();
    });

    it('should resolve when no adapters support the event type', async () => {
      const svc = setup();
      svc.registerAdapter(createMockAdapter('none', () => false));
      await expect(svc.emit(createEvent())).resolves.toBeUndefined();
    });

    it('should call all adapters in parallel (not sequentially)', async () => {
      const svc = setup();
      const order: string[] = [];

      const slow = createMockAdapter('slow');
      slow.send.mockImplementation(async () => {
        order.push('slow-start');
        await new Promise(r => setTimeout(r, 50));
        order.push('slow-end');
      });

      const fast = createMockAdapter('fast');
      fast.send.mockImplementation(async () => {
        order.push('fast-start');
        order.push('fast-end');
      });

      svc.registerAdapter(slow);
      svc.registerAdapter(fast);
      await svc.emit(createEvent());

      // Both should start before slow ends (parallel execution)
      expect(order.indexOf('fast-start')).toBeLessThan(order.indexOf('slow-end'));
    });
  });

  // -----------------------------------------------------------------------
  // getAdapters
  // -----------------------------------------------------------------------
  describe('getAdapters', () => {
    it('should return empty array initially', () => {
      const svc = setup();
      expect(svc.getAdapters()).toEqual([]);
    });

    it('should return adapters in registration order', () => {
      const svc = setup();
      const a = createMockAdapter('a');
      const b = createMockAdapter('b');
      const c = createMockAdapter('c');
      svc.registerAdapter(a);
      svc.registerAdapter(b);
      svc.registerAdapter(c);
      expect(svc.getAdapters()).toEqual([a, b, c]);
    });
  });
});
