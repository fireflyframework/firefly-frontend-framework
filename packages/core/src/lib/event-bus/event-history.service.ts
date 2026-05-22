import { inject, Injectable } from '@angular/core';

import {
  DomainEvent,
  EventBusConfig,
  EVENT_BUS_CONFIG,
  EventFilter,
} from './event-bus.types';

/**
 * In-memory ring buffer that stores recent domain events for querying.
 *
 * When the buffer reaches `historySize` (from `EventBusConfig`), the
 * oldest event is automatically dropped.
 *
 * @example
 * ```typescript
 * const history = inject(EventHistoryService);
 *
 * // Query all events of a specific type
 * const loginEvents = history.query({ type: 'auth:login' });
 *
 * // Query events from a specific source since a timestamp
 * const recent = history.query({ source: 'sync', since: Date.now() - 60_000 });
 *
 * // Get total stored events
 * console.log('History size:', history.size());
 * ```
 */
@Injectable()
export class EventHistoryService {
  private readonly config = inject(EVENT_BUS_CONFIG, { optional: true });
  private readonly maxSize = this.config?.historySize ?? 100;
  private readonly buffer: DomainEvent[] = [];

  /**
   * Add an event to the history buffer.
   *
   * If the buffer is at capacity, the oldest event is dropped.
   */
  add(event: DomainEvent): void {
    this.buffer.push(event);
    while (this.buffer.length > this.maxSize) {
      this.buffer.shift();
    }
  }

  /**
   * Query events in the history buffer.
   *
   * All filter fields are optional — when omitted, no filtering is
   * applied for that criterion. Returns events in chronological order.
   *
   * @param filter - Optional filter criteria (type, source, since)
   * @returns Matching events as a read-only array
   */
  query(filter?: EventFilter): ReadonlyArray<DomainEvent> {
    if (!filter) {
      return [...this.buffer];
    }

    return this.buffer.filter((event) => {
      if (filter.type && event.type !== filter.type) return false;
      if (filter.source && event.source !== filter.source) return false;
      if (filter.since && event.timestamp < filter.since) return false;
      return true;
    });
  }

  /**
   * Clear the entire history buffer.
   */
  clear(): void {
    this.buffer.length = 0;
  }

  /**
   * Get the number of events currently stored in the buffer.
   */
  size(): number {
    return this.buffer.length;
  }
}
