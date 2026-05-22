import { FireflyEvent, NotificationAdapter, WebhookAdapterOptions } from '../notification.types';

/**
 * Adapter that POSTs events as JSON to a generic HTTP endpoint.
 *
 * Sends the full `FireflyEvent` payload. Supports optional custom headers.
 *
 * @example
 * ```typescript
 * const adapter = new WebhookAdapter({
 *   url: 'https://api.internal/events',
 *   headers: { 'X-Api-Key': 'secret' },
 * });
 * await adapter.send(event);
 * ```
 */
export class WebhookAdapter implements NotificationAdapter {
  readonly name = 'webhook';

  constructor(private readonly options: WebhookAdapterOptions) {}

  supports(): boolean {
    return true;
  }

  async send(event: FireflyEvent): Promise<void> {
    await fetch(this.options.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.options.headers,
      },
      body: JSON.stringify(event),
    });
  }
}
