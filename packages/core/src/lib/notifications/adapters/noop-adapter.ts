import { FireflyEvent, NotificationAdapter } from '../notification.types';

/**
 * Adapter that does nothing — for use in test environments.
 *
 * Accepts all event types and resolves immediately without side effects.
 *
 * @example
 * ```typescript
 * const adapter = new NoopAdapter();
 * adapter.supports('any.event'); // true
 * await adapter.send(event);    // no-op
 * ```
 */
export class NoopAdapter implements NotificationAdapter {
  readonly name = 'noop';

  supports(): boolean {
    return true;
  }

  async send(_event: FireflyEvent): Promise<void> {
    // intentionally empty
  }
}
