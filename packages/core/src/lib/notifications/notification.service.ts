import { Injectable, inject } from '@angular/core';
import {
  FireflyEvent,
  NotificationAdapter,
  NOTIFICATION_CONFIG,
} from './notification.types';

/**
 * Central notification service that dispatches events to registered adapters.
 *
 * This is the core orchestrator of the notifications module. It maintains
 * a registry of `NotificationAdapter` instances and routes events to
 * those that support the event type.
 *
 * Uses `Promise.allSettled` so a failing adapter never blocks other adapters.
 *
 * @example
 * ```typescript
 * const service = inject(NotificationService);
 *
 * service.registerAdapter(myAdapter);
 *
 * await service.emit({
 *   type: 'error.unhandled',
 *   product: 'my-app',
 *   severity: 'critical',
 *   message: 'Something went wrong',
 *   timestamp: new Date().toISOString(),
 * });
 * ```
 */
@Injectable()
export class NotificationService {
  private readonly config = inject(NOTIFICATION_CONFIG, { optional: true });
  private readonly adapters: NotificationAdapter[] = [];

  /**
   * Register an adapter to receive events.
   *
   * Duplicate adapters (same `name`) are silently ignored.
   */
  registerAdapter(adapter: NotificationAdapter): void {
    if (this.adapters.some(a => a.name === adapter.name)) {
      return;
    }
    this.adapters.push(adapter);
  }

  /**
   * Emit an event to all adapters that support its type.
   *
   * Adapters are called in parallel via `Promise.allSettled` —
   * a failure in one adapter does not prevent others from receiving the event.
   *
   * @returns Resolves when all adapters have completed (or failed).
   */
  async emit(event: FireflyEvent): Promise<void> {
    const targets = this.adapters.filter(a => a.supports(event.type));
    await Promise.allSettled(targets.map(a => a.send(event)));
  }

  /**
   * Returns a read-only snapshot of all registered adapters.
   *
   * Useful for debugging and the showcase inspector panel.
   */
  getAdapters(): ReadonlyArray<NotificationAdapter> {
    return this.adapters;
  }
}
