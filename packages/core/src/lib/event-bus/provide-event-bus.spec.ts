import { TestBed } from '@angular/core/testing';
import { provideEventBus } from './provide-event-bus';
import { EventBusService } from './event-bus.service';
import { EventQueueService } from './event-queue.service';
import { EventHistoryService } from './event-history.service';
import { EVENT_BUS_CONFIG, EventBusConfig } from './event-bus.types';
import { StorageService } from '../storage/storage.service';

// ---------------------------------------------------------------------------
// Mock StorageService (EventQueueService depends on it)
// ---------------------------------------------------------------------------

function createMockStorage() {
  const store = new Map<string, unknown>();
  return {
    get: vi.fn(<T>(key: string): T | null => (store.get(key) as T) ?? null),
    set: vi.fn(<T>(key: string, value: T): void => { store.set(key, value); }),
    remove: vi.fn((key: string): void => { store.delete(key); }),
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('provideEventBus', () => {
  function setup(options?: Parameters<typeof provideEventBus>[0]) {
    TestBed.configureTestingModule({
      providers: [
        provideEventBus(options),
        { provide: StorageService, useValue: createMockStorage() },
      ],
    });
  }

  it('should register EventBusService', () => {
    setup();
    expect(TestBed.inject(EventBusService)).toBeDefined();
  });

  it('should register EventQueueService', () => {
    setup();
    expect(TestBed.inject(EventQueueService)).toBeDefined();
  });

  it('should register EventHistoryService', () => {
    setup();
    expect(TestBed.inject(EventHistoryService)).toBeDefined();
  });

  it('should provide default config when no options given', () => {
    setup();
    const config = TestBed.inject(EVENT_BUS_CONFIG);
    expect(config).toEqual({
      enableQueue: true,
      maxQueueSize: 1000,
      enableHistory: false,
      historySize: 100,
    });
  });

  it('should merge user options with defaults', () => {
    setup({ enableHistory: true, historySize: 50 });
    const config = TestBed.inject(EVENT_BUS_CONFIG);
    expect(config).toEqual({
      enableQueue: true,
      maxQueueSize: 1000,
      enableHistory: true,
      historySize: 50,
    });
  });

  it('should allow overriding all options', () => {
    setup({
      enableQueue: false,
      maxQueueSize: 500,
      enableHistory: true,
      historySize: 200,
    });
    const config = TestBed.inject(EVENT_BUS_CONFIG);
    expect(config).toEqual({
      enableQueue: false,
      maxQueueSize: 500,
      enableHistory: true,
      historySize: 200,
    });
  });
});
