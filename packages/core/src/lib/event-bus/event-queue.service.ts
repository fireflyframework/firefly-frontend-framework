import { inject, Injectable, signal, Signal } from '@angular/core';

import { StorageService } from '../storage/storage.service';
import { EventBusService } from './event-bus.service';
import {
  DomainEvent,
  EventBusConfig,
  EVENT_BUS_CONFIG,
  FlushResult,
  QueueStatus,
} from './event-bus.types';

/** Storage key for the persisted queue. */
const QUEUE_STORAGE_KEY = 'event-bus.queue';

/**
 * Persistent event queue that buffers events for later delivery.
 *
 * Events are persisted via `StorageService` (localStorage with
 * in-memory fallback). When `flush()` is called, all pending events
 * are published through the `EventBusService` and the queue is cleared.
 *
 * Queue size is bounded by `maxQueueSize` from `EventBusConfig` —
 * when the limit is reached, the oldest event is dropped.
 *
 * @example
 * ```typescript
 * const queue = inject(EventQueueService);
 *
 * // Enqueue when offline or deferred
 * queue.enqueue({ type: 'sync:pending', payload: { id: 42 }, timestamp: Date.now() });
 *
 * // Later, flush all pending events
 * const result = queue.flush();
 * console.log(`Delivered: ${result.delivered}, Failed: ${result.failed}`);
 * ```
 */
@Injectable()
export class EventQueueService {
  private readonly storage = inject(StorageService);
  private readonly eventBus = inject(EventBusService);
  private readonly config = inject(EVENT_BUS_CONFIG, { optional: true });

  private readonly maxQueueSize = this.config?.maxQueueSize ?? 1000;

  private readonly _status = signal<QueueStatus>('idle');
  private readonly _pending = signal<number>(this._loadQueue().length);

  /**
   * Current queue status as a reactive Signal.
   */
  status(): Signal<QueueStatus> {
    return this._status.asReadonly();
  }

  /**
   * Number of pending events as a reactive Signal.
   */
  pending(): Signal<number> {
    return this._pending.asReadonly();
  }

  /**
   * Add an event to the persistent queue.
   *
   * If the queue exceeds `maxQueueSize`, the oldest event is dropped.
   */
  enqueue(event: DomainEvent): void {
    const queue = this._loadQueue();
    queue.push(event);

    // Enforce max queue size — drop oldest
    while (queue.length > this.maxQueueSize) {
      queue.shift();
    }

    this._saveQueue(queue);
    this._pending.set(queue.length);
  }

  /**
   * Flush all pending events through the `EventBusService`.
   *
   * Each event is published individually. Events that fail to publish
   * (due to errors in subscribers) are counted as failed but do NOT
   * block other events from being delivered.
   *
   * The queue is cleared after flush regardless of failures.
   *
   * @returns Result with counts of delivered and failed events.
   */
  flush(): FlushResult {
    const queue = this._loadQueue();
    if (queue.length === 0) {
      return { delivered: 0, failed: 0 };
    }

    this._status.set('flushing');

    let delivered = 0;
    let failed = 0;

    for (const event of queue) {
      try {
        this.eventBus.publish(event);
        delivered++;
      } catch {
        failed++;
      }
    }

    // Clear the queue
    this._saveQueue([]);
    this._pending.set(0);
    this._status.set(failed > 0 ? 'error' : 'idle');

    return { delivered, failed };
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  private _loadQueue(): DomainEvent[] {
    return this.storage.get<DomainEvent[]>(QUEUE_STORAGE_KEY) ?? [];
  }

  private _saveQueue(queue: DomainEvent[]): void {
    this.storage.set(QUEUE_STORAGE_KEY, queue);
  }
}
