import { inject, Injectable, Injector, runInInjectionContext, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, Subject, Subscription, filter } from 'rxjs';

import { DomainEvent, EventHandler } from './event-bus.types';

/**
 * Central pub/sub service for internal event-driven communication.
 *
 * Allows features and modules to communicate without direct coupling.
 * Events are dispatched synchronously to all matching subscribers.
 *
 * Supports exact type matching via `subscribe()` and pattern matching
 * (wildcards / RegExp) via `subscribePattern()`.
 *
 * @example
 * ```typescript
 * const bus = inject(EventBusService);
 *
 * // Subscribe to a specific event type
 * const sub = bus.subscribe<{ userId: string }>('auth:login', (event) => {
 *   console.log('User logged in:', event.payload.userId);
 * });
 *
 * // Publish an event
 * bus.publish({ type: 'auth:login', payload: { userId: '123' }, timestamp: Date.now() });
 *
 * // Clean up
 * sub.unsubscribe();
 * ```
 */
@Injectable()
export class EventBusService {
  private readonly injector = inject(Injector);
  private readonly subject = new Subject<DomainEvent>();
  private readonly subscriptions: Subscription[] = [];

  /**
   * Publish an event to all matching subscribers.
   *
   * If `timestamp` is not set, it will be added automatically.
   */
  publish<T = unknown>(event: DomainEvent<T>): void {
    const stamped = event.timestamp
      ? event
      : { ...event, timestamp: Date.now() };
    this.subject.next(stamped as DomainEvent);
  }

  /**
   * Subscribe to events of an exact type.
   *
   * @returns A `Subscription` that can be used to unsubscribe.
   */
  subscribe<T = unknown>(
    eventType: string,
    handler: EventHandler<T>,
  ): Subscription {
    const sub = this.subject
      .pipe(filter((e) => e.type === eventType))
      .subscribe((e) => handler(e as DomainEvent<T>));
    this.subscriptions.push(sub);
    return sub;
  }

  /**
   * Subscribe to events matching a pattern.
   *
   * Accepts either:
   * - A string with `*` wildcard (e.g. `'auth:*'` matches `'auth:login'`, `'auth:logout'`)
   * - A `RegExp` for full control
   *
   * @returns A `Subscription` that can be used to unsubscribe.
   */
  subscribePattern<T = unknown>(
    pattern: string | RegExp,
    handler: EventHandler<T>,
  ): Subscription {
    const regex =
      pattern instanceof RegExp
        ? pattern
        : new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);

    const sub = this.subject
      .pipe(filter((e) => regex.test(e.type)))
      .subscribe((e) => handler(e as DomainEvent<T>));
    this.subscriptions.push(sub);
    return sub;
  }

  /**
   * Get an Observable stream of events for a specific type.
   *
   * Useful for integrating with RxJS pipelines.
   */
  stream<T = unknown>(eventType: string): Observable<DomainEvent<T>> {
    return this.subject.pipe(
      filter((e) => e.type === eventType),
    ) as Observable<DomainEvent<T>>;
  }

  /**
   * Get a Signal that holds the latest event of a specific type.
   *
   * Starts as `undefined` until the first matching event arrives.
   * Uses `toSignal()` from `@angular/core/rxjs-interop` with the
   * service's own injector to avoid requiring a component context.
   */
  signal<T = unknown>(eventType: string): Signal<DomainEvent<T> | undefined> {
    return runInInjectionContext(this.injector, () =>
      toSignal(this.stream<T>(eventType)),
    );
  }

  /**
   * Returns a snapshot of all events that have passed through the bus
   * during the current session (since last `destroy()`).
   *
   * Note: actual history storage is managed by `EventHistoryService`.
   * This method returns an empty array — use `EventHistoryService.query()`
   * for persistent history queries.
   */
  history(): ReadonlyArray<DomainEvent> {
    return [];
  }

  /**
   * Tear down the bus: complete the internal Subject and unsubscribe
   * all tracked subscriptions.
   *
   * After calling `destroy()`, no further events can be published.
   */
  destroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
    this.subscriptions.length = 0;
    this.subject.complete();
  }
}
