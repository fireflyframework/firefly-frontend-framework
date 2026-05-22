import { TestBed } from '@angular/core/testing';
import { EventQueueService } from './event-queue.service';
import { EventBusService } from './event-bus.service';
import { DomainEvent, EVENT_BUS_CONFIG, EventBusConfig } from './event-bus.types';
import { StorageService } from '../storage/storage.service';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createEvent(overrides?: Partial<DomainEvent>): DomainEvent {
  return {
    type: 'queue:test',
    payload: null,
    timestamp: Date.now(),
    ...overrides,
  };
}

/**
 * Minimal StorageService mock using an in-memory Map.
 */
function createMockStorage() {
  const store = new Map<string, unknown>();
  return {
    get: vi.fn(<T>(key: string): T | null => (store.get(key) as T) ?? null),
    set: vi.fn(<T>(key: string, value: T): void => { store.set(key, value); }),
    remove: vi.fn((key: string): void => { store.delete(key); }),
    _store: store,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('EventQueueService', () => {
  function setup(config?: Partial<EventBusConfig>) {
    const mockStorage = createMockStorage();
    const publishSpy = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        EventQueueService,
        EventBusService,
        { provide: StorageService, useValue: mockStorage },
        ...(config
          ? [{ provide: EVENT_BUS_CONFIG, useValue: { enableQueue: true, maxQueueSize: 1000, enableHistory: false, historySize: 100, ...config } }]
          : []),
      ],
    });

    const queue = TestBed.inject(EventQueueService);
    const bus = TestBed.inject(EventBusService);

    // Spy on publish after injection
    vi.spyOn(bus, 'publish').mockImplementation(publishSpy);

    return { queue, bus, mockStorage, publishSpy };
  }

  // -----------------------------------------------------------------------
  // enqueue
  // -----------------------------------------------------------------------
  describe('enqueue', () => {
    it('should add an event to the queue', () => {
      const { queue, mockStorage } = setup();
      const event = createEvent();
      queue.enqueue(event);

      expect(mockStorage.set).toHaveBeenCalled();
      const savedQueue = mockStorage.set.mock.calls[0][1] as DomainEvent[];
      expect(savedQueue).toHaveLength(1);
      expect(savedQueue[0]).toEqual(event);
    });

    it('should update pending count', () => {
      const { queue } = setup();
      expect(queue.pending()()).toBe(0);

      queue.enqueue(createEvent());
      expect(queue.pending()()).toBe(1);

      queue.enqueue(createEvent());
      expect(queue.pending()()).toBe(2);
    });

    it('should drop oldest events when maxQueueSize is exceeded', () => {
      const { queue } = setup({ maxQueueSize: 3 });

      queue.enqueue(createEvent({ type: 'e1' }));
      queue.enqueue(createEvent({ type: 'e2' }));
      queue.enqueue(createEvent({ type: 'e3' }));
      queue.enqueue(createEvent({ type: 'e4' }));

      expect(queue.pending()()).toBe(3);

      // Verify the last save has e2, e3, e4 (e1 dropped)
      const lastCall = (queue as any).storage.set.mock.calls.at(-1);
      const savedQueue = lastCall[1] as DomainEvent[];
      expect(savedQueue.map((e: DomainEvent) => e.type)).toEqual(['e2', 'e3', 'e4']);
    });

    it('should persist events via StorageService', () => {
      const { queue, mockStorage } = setup();
      queue.enqueue(createEvent());

      expect(mockStorage.set).toHaveBeenCalledWith(
        'event-bus.queue',
        expect.any(Array),
      );
    });
  });

  // -----------------------------------------------------------------------
  // flush
  // -----------------------------------------------------------------------
  describe('flush', () => {
    it('should publish all queued events through EventBusService', () => {
      const { queue, publishSpy } = setup();

      queue.enqueue(createEvent({ type: 'f1' }));
      queue.enqueue(createEvent({ type: 'f2' }));

      const result = queue.flush();

      expect(publishSpy).toHaveBeenCalledTimes(2);
      expect(result.delivered).toBe(2);
      expect(result.failed).toBe(0);
    });

    it('should clear the queue after flush', () => {
      const { queue } = setup();
      queue.enqueue(createEvent());

      queue.flush();

      expect(queue.pending()()).toBe(0);
    });

    it('should return { delivered: 0, failed: 0 } for empty queue', () => {
      const { queue, publishSpy } = setup();
      const result = queue.flush();

      expect(result).toEqual({ delivered: 0, failed: 0 });
      expect(publishSpy).not.toHaveBeenCalled();
    });

    it('should count failed events when publish throws', () => {
      const { queue, publishSpy } = setup();

      queue.enqueue(createEvent({ type: 'ok' }));
      queue.enqueue(createEvent({ type: 'fail' }));
      queue.enqueue(createEvent({ type: 'ok2' }));

      publishSpy.mockImplementation((event: DomainEvent) => {
        if (event.type === 'fail') throw new Error('subscriber error');
      });

      const result = queue.flush();

      expect(result.delivered).toBe(2);
      expect(result.failed).toBe(1);
    });

    it('should set status to flushing during flush', () => {
      const { queue, publishSpy } = setup();
      queue.enqueue(createEvent());

      let statusDuringFlush: string | undefined;
      publishSpy.mockImplementation(() => {
        statusDuringFlush = queue.status()();
      });

      queue.flush();

      expect(statusDuringFlush).toBe('flushing');
    });

    it('should set status to idle after successful flush', () => {
      const { queue } = setup();
      queue.enqueue(createEvent());
      queue.flush();

      expect(queue.status()()).toBe('idle');
    });

    it('should set status to error if any event fails', () => {
      const { queue, publishSpy } = setup();
      queue.enqueue(createEvent());

      publishSpy.mockImplementation(() => { throw new Error('fail'); });
      queue.flush();

      expect(queue.status()()).toBe('error');
    });
  });

  // -----------------------------------------------------------------------
  // status / pending
  // -----------------------------------------------------------------------
  describe('status / pending', () => {
    it('should start with idle status', () => {
      const { queue } = setup();
      expect(queue.status()()).toBe('idle');
    });

    it('should start with 0 pending', () => {
      const { queue } = setup();
      expect(queue.pending()()).toBe(0);
    });

    it('should return readonly signals', () => {
      const { queue } = setup();
      // These are readonly — no set method exposed
      expect(typeof queue.status()).toBe('function');
      expect(typeof queue.pending()).toBe('function');
    });
  });
});
