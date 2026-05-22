import { FireflyEvent, NotificationAdapter, SlackAdapterOptions } from '../notification.types';

const SEVERITY_EMOJI: Record<string, string> = {
  info: '\u2139\uFE0F',
  warning: '\u26A0\uFE0F',
  error: '\u274C',
  critical: '\uD83D\uDEA8',
};

/**
 * Adapter that sends events to a Slack incoming webhook.
 *
 * Formats the message with a severity emoji prefix.
 *
 * @example
 * ```typescript
 * const adapter = new SlackAdapter({ webhookUrl: 'https://hooks.slack.com/...' });
 * await adapter.send(event); // POSTs formatted message to Slack
 * ```
 */
export class SlackAdapter implements NotificationAdapter {
  readonly name = 'slack';

  constructor(private readonly options: SlackAdapterOptions) {}

  supports(): boolean {
    return true;
  }

  async send(event: FireflyEvent): Promise<void> {
    const emoji = SEVERITY_EMOJI[event.severity] ?? '\u2139\uFE0F';
    const text = `${emoji} [${event.product}] ${event.type}: ${event.message}`;

    await fetch(this.options.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
  }
}
