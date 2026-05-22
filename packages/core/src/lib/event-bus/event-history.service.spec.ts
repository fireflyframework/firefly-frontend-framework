import { TestBed } from '@angular/core/testing';
import { EventHistoryService } from './event-history.service';
import { DomainEvent, EVENT_BUS_CONFIG } from './event-bus.types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createEvent(overrides?: Partial<DomainEvent>): DomainEvent {
  return {
    type: 'test:event',
    payload: null,
    timestamp: Date.now(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('EventHistoryService', () => {
  function setup(historySize?: number) {
    TestBed.configureTestingModule({
      providers: [
        EventHistoryService,
        ...(historySize != null
          ? [{
              provide: EVENT_BUS_CONFIG,
              useValue: { enableQueue: true, maxQueueSize: 1000, enableHistory: true, historySize },
            }]
          : []),
      ],
    });
    return TestBed.inject(EventHistoryService);
  }

  // -----------------------------------------------------------------------
  // add
  // -----------------------------------------------------------------------
  describe('add', () => {
    it('should add an event to the buffer', () => {
      const svc = setup();
      svc.add(createEvent());
      expect(svc.size()).toBe(1);
    });

    it('should preserve events in insertion order', () => {
      const svc = setup();
      svc.add(createEvent({ type: 'a' }));
      svc.add(createEvent({ type: 'b' }));
      svc.add(createEvent({ type: 'c' }));

      const all = svc.query();
      expect(all.map((e) => e.type)).toEqual(['a', 'b', 'c']);
    });

    it('should drop oldest events when historySize is exceeded', () => {
      const svc = setup(3);

      svc.add(createEvent({ type: 'e1' }));
      svc.add(createEvent({ type: 'e2' }));
      svc.add(createEvent({ type: 'e3' }));
      svc.add(createEvent({ type: 'e4' }));

      expect(svc.size()).toBe(3);
      const types = svc.query().map((e) => e.type);
      expect(types).toEqual(['e2', 'e3', 'e4']);
    });

    it('should default to historySize 100 when no config', () => {
      const svc = setup();
      for (let i = 0; i < 105; i++) {
        svc.add(createEvent({ type: `e${i}` }));
      }
      expect(svc.size()).toBe(100);
      // First event should be e5 (e0-e4 dropped)
      expect(svc.query()[0].type).toBe('e5');
    });
  });

  // -----------------------------------------------------------------------
  // query
  // -----------------------------------------------------------------------
  describe('query', () => {
    it('should return all events when no filter is provided', () => {
      const svc = setup();
      svc.add(createEvent({ type: 'a' }));
      svc.add(createEvent({ type: 'b' }));

      expect(svc.query()).toHaveLength(2);
    });

    it('should filter by type', () => {
      const svc = setup();
      svc.add(createEvent({ type: 'auth:login' }));
      svc.add(createEvent({ type: 'auth:logout' }));
      svc.add(createEvent({ type: 'order:placed' }));

      const result = svc.query({ type: 'auth:login' });
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('auth:login');
    });

    it('should filter by source', () => {
      const svc = setup();
      svc.add(createEvent({ source: 'module-a' }));
      svc.add(createEvent({ source: 'module-b' }));
      svc.add(createEvent({ source: 'module-a' }));

      const result = svc.query({ source: 'module-a' });
      expect(result).toHaveLength(2);
    });

    it('should filter by since timestamp', () => {
      const svc = setup();
      const now = Date.now();
      svc.add(createEvent({ timestamp: now - 5000 }));
      svc.add(createEvent({ timestamp: now - 1000 }));
      svc.add(createEvent({ timestamp: now }));

      const result = svc.query({ since: now - 2000 });
      expect(result).toHaveLength(2);
    });

    it('should combine multiple filters (AND logic)', () => {
      const svc = setup();
      const now = Date.now();
      svc.add(createEvent({ type: 'auth:login', source: 'web', timestamp: now }));
      svc.add(createEvent({ type: 'auth:login', source: 'mobile', timestamp: now }));
      svc.add(createEvent({ type: 'auth:logout', source: 'web', timestamp: now }));

      const result = svc.query({ type: 'auth:login', source: 'web' });
      expect(result).toHaveLength(1);
      expect(result[0].source).toBe('web');
    });

    it('should return empty array when no events match', () => {
      const svc = setup();
      svc.add(createEvent({ type: 'a' }));

      expect(svc.query({ type: 'nonexistent' })).toEqual([]);
    });

    it('should return a copy (not a reference to internal buffer)', () => {
      const svc = setup();
      svc.add(createEvent());
      const result = svc.query();
      expect(result).not.toBe((svc as any).buffer);
    });
  });

  // -----------------------------------------------------------------------
  // clear
  // -----------------------------------------------------------------------
  describe('clear', () => {
    it('should remove all events from the buffer', () => {
      const svc = setup();
      svc.add(createEvent());
      svc.add(createEvent());
      expect(svc.size()).toBe(2);

      svc.clear();
      expect(svc.size()).toBe(0);
      expect(svc.query()).toEqual([]);
    });

    it('should not throw when buffer is already empty', () => {
      const svc = setup();
      expect(() => svc.clear()).not.toThrow();
    });
  });

  // -----------------------------------------------------------------------
  // size
  // -----------------------------------------------------------------------
  describe('size', () => {
    it('should return 0 for empty buffer', () => {
      const svc = setup();
      expect(svc.size()).toBe(0);
    });

    it('should track the current number of events', () => {
      const svc = setup();
      svc.add(createEvent());
      expect(svc.size()).toBe(1);
      svc.add(createEvent());
      expect(svc.size()).toBe(2);
      svc.clear();
      expect(svc.size()).toBe(0);
    });
  });
});
