import { EnvironmentProviders, makeEnvironmentProviders, inject, provideAppInitializer } from '@angular/core';
import {
  NOTIFICATION_CONFIG,
  NotificationConfig,
  NotificationOptions,
} from './notification.types';
import { NotificationService } from './notification.service';
import { ConsoleAdapter } from './adapters/console-adapter';
import { SlackAdapter } from './adapters/slack-adapter';
import { WebhookAdapter } from './adapters/webhook-adapter';
import { EmailAdapter } from './adapters/email-adapter';

/**
 * Configure the Notifications module.
 *
 * Registers `NotificationService` and adapters based on options.
 * `ConsoleAdapter` is always registered as a fallback.
 *
 * This is an **EXTENDED** module — services are NOT available globally.
 * Call `provideNotifications()` in your `appConfig` to enable them.
 *
 * @example
 * ```ts
 * import { provideNotifications } from '@fireflyframework/core';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideNotifications({
 *       adapters: ['slack', 'webhook'],
 *       slack: { webhookUrl: 'https://hooks.slack.com/...' },
 *       webhook: { url: 'https://api.internal/events' },
 *     }),
 *   ],
 * };
 * ```
 *
 * @param options - Optional notification configuration. Only ConsoleAdapter is registered if omitted.
 * @returns EnvironmentProviders to register in the application config
 */
export function provideNotifications(
  options?: NotificationOptions,
): EnvironmentProviders {
  const enabledAdapters = ['console', ...(options?.adapters ?? [])];

  const config: NotificationConfig = {
    enabledAdapters,
    slack: options?.slack,
    email: options?.email,
    webhook: options?.webhook,
  };

  return makeEnvironmentProviders([
    NotificationService,
    { provide: NOTIFICATION_CONFIG, useValue: config },
    provideAppInitializer(() => {
      const service = inject(NotificationService);

      // ConsoleAdapter always registered
      service.registerAdapter(new ConsoleAdapter());

      if (options?.adapters?.includes('slack') && options.slack) {
        service.registerAdapter(new SlackAdapter(options.slack));
      }
      if (options?.adapters?.includes('webhook') && options.webhook) {
        service.registerAdapter(new WebhookAdapter(options.webhook));
      }
      if (options?.adapters?.includes('email') && options.email) {
        service.registerAdapter(new EmailAdapter(options.email));
      }
    }),
  ]);
}
