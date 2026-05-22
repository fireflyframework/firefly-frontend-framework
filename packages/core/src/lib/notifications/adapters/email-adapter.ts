import { FireflyEvent, NotificationAdapter, EmailAdapterOptions } from '../notification.types';

/**
 * Adapter that sends events as email via an HTTP relay endpoint.
 *
 * The browser cannot do SMTP directly, so this adapter POSTs an email
 * payload to an HTTP relay service that handles the actual sending.
 *
 * @example
 * ```typescript
 * const adapter = new EmailAdapter({
 *   smtpEndpoint: 'https://api.internal/send-email',
 *   from: 'noreply@acme.com',
 * });
 * await adapter.send(event);
 * ```
 */
export class EmailAdapter implements NotificationAdapter {
  readonly name = 'email';

  constructor(private readonly options: EmailAdapterOptions) {}

  supports(): boolean {
    return true;
  }

  async send(event: FireflyEvent): Promise<void> {
    const subject = `[${event.severity.toUpperCase()}] [${event.product}] ${event.type}`;

    await fetch(this.options.smtpEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: this.options.from,
        subject,
        body: event.message,
        data: event.data,
        timestamp: event.timestamp,
      }),
    });
  }
}
