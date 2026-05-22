import { FireflyEvent, NotificationAdapter } from '../notification.types';

const SEVERITY_PREFIX: Record<string, string> = {
  info: '[INFO]',
  warning: '[WARN]',
  error: '[ERROR]',
  critical: '[CRITICAL]',
};

/**
 * Adapter that logs events to the browser console.
 *
 * Always registered as a fallback — accepts all event types.
 * Formats output as: `[SEVERITY] [product] type: message`
 *
 * @example
 * ```typescript
 * const adapter = new ConsoleAdapter();
 * adapter.supports('any.event'); // true
 * await adapter.send(event);    // logs to console
 * ```
 */
export class ConsoleAdapter implements NotificationAdapter {
  readonly name = 'console';

  supports(): boolean {
    return true;
  }

  async send(event: FireflyEvent): Promise<void> {
    const prefix = SEVERITY_PREFIX[event.severity] ?? '[INFO]';
    const line = `${prefix} [${event.product}] ${event.type}: ${event.message}`;

    if (event.severity === 'error' || event.severity === 'critical') {
      console.error(line, event.data ?? '');
    } else if (event.severity === 'warning') {
      console.warn(line, event.data ?? '');
    } else {
      console.log(line, event.data ?? '');
    }
  }
}
