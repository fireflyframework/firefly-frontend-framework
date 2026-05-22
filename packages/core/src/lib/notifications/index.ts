// Types
export type {
  EventSeverity,
  FireflyEvent,
  NotificationAdapter,
  SlackAdapterOptions,
  EmailAdapterOptions,
  WebhookAdapterOptions,
  NotificationOptions,
  NotificationConfig,
} from './notification.types';
export { NOTIFICATION_CONFIG } from './notification.types';

// Provider factory
export { provideNotifications } from './provide-notifications';

// Service
export { NotificationService } from './notification.service';

// Adapters
export { ConsoleAdapter } from './adapters/console-adapter';
export { NoopAdapter } from './adapters/noop-adapter';
export { SlackAdapter } from './adapters/slack-adapter';
export { WebhookAdapter } from './adapters/webhook-adapter';
export { EmailAdapter } from './adapters/email-adapter';
