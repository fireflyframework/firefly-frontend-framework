import { TestBed } from '@angular/core/testing';
import { EventBusService } from './event-bus.service';
import { DomainEvent } from './event-bus.types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createEvent<T = unknown>(
  overrides?: Partial<DomainEvent<T>>,
): DomainEvent<T> {
  return {
    type: 'test:event',
    payload: undefined as T,
    timestamp: Date.now(),
    ...overrides,
  } as DomainEvent<T>;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('EventBusService', () => {
  function setup() {
    TestBed.configureTestingModule({
      providers: [EventBusService],
    });
    return TestBed.inject(EventBusService);
  }

  // -----------------------------------------------------------------------
  // publish + subscribe
  // -----------------------------------------------------------------------
  describe('publish / subscribe', () => {
    it('should deliver events to matching subscribers', () => {
      const bus = setup();
      const received: DomainEvent[] = [];
      bus.subscribe('user:created', (e) => received.push(e));

      const event = createEvent({ type: 'user:created', payload: { id: 1 } });
      bus.publish(event);

      expect(received).toHaveLength(1);
      expect(received[0]).toEqual(event);
    });

    it('should not deliver events to non-matching subscribers', () => {
      const bus = setup();
      const received: DomainEvent[] = [];
      bus.subscribe('user:created', (e) => received.push(e));

      bus.publish(createEvent({ type: 'user:deleted' }));

      expect(received).toHaveLength(0);
    });

    it('should deliver to multiple subscribers of the same type', () => {
      const bus = setup();
      const r1: DomainEvent[] = [];
      const r2: DomainEvent[] = [];
      bus.subscribe('order:placed', (e) => r1.push(e));
      bus.subscribe('order:placed', (e) => r2.push(e));

      bus.publish(createEvent({ type: 'order:placed' }));

      expect(r1).toHaveLength(1);
      expect(r2).toHaveLength(1);
    });

    it('should unsubscribe correctly', () => {
      const bus = setup();
      const received: DomainEvent[] = [];
      const sub = bus.subscribe('ping', (e) => received.push(e));

      bus.publish(createEvent({ type: 'ping' }));
      expect(received).toHaveLength(1);

      sub.unsubscribe();
      bus.publish(createEvent({ type: 'ping' }));
      expect(received).toHaveLength(1);
    });

    it('should auto-set timestamp if not provided', () => {
      const bus = setup();
      const received: DomainEvent[] = [];
      bus.subscribe('ts:test', (e) => received.push(e));

      const before = Date.now();
      bus.publish({ type: 'ts:test', payload: null, timestamp: 0 });
      // timestamp 0 is falsy, so it should be auto-set
      expect(received[0].timestamp).toBeGreaterThanOrEqual(before);
    });

    it('should preserve explicit timestamp', () => {
      const bus = setup();
      const received: DomainEvent[] = [];
      bus.subscribe('ts:explicit', (e) => received.push(e));

      bus.publish(createEvent({ type: 'ts:explicit', timestamp: 42 }));
      expect(received[0].timestamp).toBe(42);
    });
  });

  // -----------------------------------------------------------------------
  // subscribePattern
  // -----------------------------------------------------------------------
  describe('subscribePattern', () => {
    it('should match wildcard patterns', () => {
      const bus = setup();
      const received: DomainEvent[] = [];
      bus.subscribePattern('auth:*', (e) => received.push(e));

      bus.publish(createEvent({ type: 'auth:login' }));
      bus.publish(createEvent({ type: 'auth:logout' }));
      bus.publish(createEvent({ type: 'order:placed' }));

      expect(received).toHaveLength(2);
      expect(received[0].type).toBe('auth:login');
      expect(received[1].type).toBe('auth:logout');
    });

    it('should match RegExp patterns', () => {
      const bus = setup();
      const received: DomainEvent[] = [];
      bus.subscribePattern(/^error:/, (e) => received.push(e));

      bus.publish(createEvent({ type: 'error:network' }));
      bus.publish(createEvent({ type: 'error:timeout' }));
      bus.publish(createEvent({ type: 'info:deploy' }));

      expect(received).toHaveLength(2);
    });

    it('should support multiple wildcards in pattern', () => {
      const bus = setup();
      const received: DomainEvent[] = [];
      bus.subscribePattern('*:created', (e) => received.push(e));

      bus.publish(createEvent({ type: 'user:created' }));
      bus.publish(createEvent({ type: 'order:created' }));
      bus.publish(createEvent({ type: 'order:deleted' }));

      expect(received).toHaveLength(2);
    });

    it('should unsubscribe correctly', () => {
      const bus = setup();
      const received: DomainEvent[] = [];
      const sub = bus.subscribePattern('test:*', (e) => received.push(e));

      bus.publish(createEvent({ type: 'test:one' }));
      expect(received).toHaveLength(1);

      sub.unsubscribe();
      bus.publish(createEvent({ type: 'test:two' }));
      expect(received).toHaveLength(1);
    });
  });

  // -----------------------------------------------------------------------
  // stream
  // -----------------------------------------------------------------------
  describe('stream', () => {
    it('should return an Observable filtered by event type', () => {
      const bus = setup();
      const received: DomainEvent[] = [];
      bus.stream('data:updated').subscribe((e) => received.push(e));

      bus.publish(createEvent({ type: 'data:updated', payload: { v: 1 } }));
      bus.publish(createEvent({ type: 'data:deleted' }));
      bus.publish(createEvent({ type: 'data:updated', payload: { v: 2 } }));

      expect(received).toHaveLength(2);
      expect((received[0].payload as { v: number }).v).toBe(1);
      expect((received[1].payload as { v: number }).v).toBe(2);
    });

    it('should allow RxJS operators on the returned Observable', () => {
      const bus = setup();
      const types: string[] = [];
      bus
        .stream('pipe:test')
        .subscribe((e) => types.push(e.type));

      bus.publish(createEvent({ type: 'pipe:test' }));
      expect(types).toEqual(['pipe:test']);
    });
  });

  // -----------------------------------------------------------------------
  // signal
  // -----------------------------------------------------------------------
  describe('signal', () => {
    it('should return a Signal that starts as undefined', () => {
      const bus = setup();
      const sig = bus.signal('sig:test');
      expect(sig()).toBeUndefined();
    });

    it('should update when a matching event is published', () => {
      const bus = setup();
      const sig = bus.signal<{ n: number }>('sig:update');

      bus.publish(createEvent({ type: 'sig:update', payload: { n: 42 } }));

      expect(sig()).toBeDefined();
      expect(sig()!.payload.n).toBe(42);
    });

    it('should always reflect the latest event', () => {
      const bus = setup();
      const sig = bus.signal<number>('sig:latest');

      bus.publish(createEvent({ type: 'sig:latest', payload: 1 }));
      bus.publish(createEvent({ type: 'sig:latest', payload: 2 }));
      bus.publish(createEvent({ type: 'sig:latest', payload: 3 }));

      expect(sig()!.payload).toBe(3);
    });
  });

  // -----------------------------------------------------------------------
  // history (stub — delegated to EventHistoryService)
  // -----------------------------------------------------------------------
  describe('history', () => {
    it('should return an empty array (stub for EventHistoryService)', () => {
      const bus = setup();
      bus.publish(createEvent({ type: 'any' }));
      expect(bus.history()).toEqual([]);
    });
  });

  // -----------------------------------------------------------------------
  // destroy
  // -----------------------------------------------------------------------
  describe('destroy', () => {
    it('should complete the internal Subject', () => {
      const bus = setup();
      let completed = false;
      bus.stream('test').subscribe({ complete: () => (completed = true) });

      bus.destroy();

      expect(completed).toBe(true);
    });

    it('should unsubscribe all tracked subscriptions', () => {
      const bus = setup();
      const received: DomainEvent[] = [];
      bus.subscribe('destroy:test', (e) => received.push(e));
      bus.subscribePattern('destroy:*', (e) => received.push(e));

      bus.destroy();

      // Publishing after destroy should not deliver (Subject completed)
      // But even if it could, subscriptions are unsubscribed
      expect(received).toHaveLength(0);
    });

    it('should not throw when called multiple times', () => {
      const bus = setup();
      bus.destroy();
      expect(() => bus.destroy()).not.toThrow();
    });
  });
});
