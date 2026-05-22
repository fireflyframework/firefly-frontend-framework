import { InjectionToken } from '@angular/core';

// ---------------------------------------------------------------------------
// Event payload
// ---------------------------------------------------------------------------

/**
 * Severity levels for system events.
 */
export type EventSeverity = 'info' | 'warning' | 'error' | 'critical';

/**
 * A system event emitted to notification adapters.
 *
 * Represents an internal event (deployment, error, threshold breach, etc.)
 * that should be dispatched to one or more external channels.
 *
 * @example
 * ```typescript
 * const event: FireflyEvent = {
 *   type: 'error.unhandled',
 *   product: 'distributor-portal',
 *   severity: 'critical',
 *   message: 'Database connection pool exhausted',
 *   timestamp: new Date().toISOString(),
 *   data: { pool: 'primary', active: 50, max: 50 },
 * };
 * ```
 */
export interface FireflyEvent {
  /** Event type identifier (dot-separated namespace, e.g. `'error.unhandled'`). */
  readonly type: string;

  /** Product or service that originated the event. */
  readonly product: string;

  /** Severity level of the event. */
  readonly severity: EventSeverity;

  /** Human-readable message describing the event. */
  readonly message: string;

  /** ISO-8601 timestamp of when the event occurred. */
  readonly timestamp: string;

  /** Arbitrary payload attached to the event. */
  readonly data?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Adapter contract
// ---------------------------------------------------------------------------

/**
 * Contract that all notification adapters must implement.
 *
 * An adapter receives a `FireflyEvent` and dispatches it to an external
 * channel (console, Slack, email, webhook, etc.).
 *
 * `supports()` enables event routing: the `NotificationService` only
 * calls `send()` on adapters that accept the given event type.
 *
 * @example
 * ```typescript
 * class MyAdapter implements NotificationAdapter {
 *   readonly name = 'my-adapter';
 *   supports(eventType: string): boolean { return true; }
 *   async send(event: FireflyEvent): Promise<void> { ... }
 * }
 * ```
 */
export interface NotificationAdapter {
  /** Unique name of this adapter (e.g. `'slack'`, `'console'`). */
  readonly name: string;

  /** Whether this adapter handles the given event type. */
  supports(eventType: string): boolean;

  /** Dispatch the event to the external channel. */
  send(event: FireflyEvent): Promise<void>;
}

// ---------------------------------------------------------------------------
// Adapter-specific options
// ---------------------------------------------------------------------------

/** Configuration for the Slack adapter. */
export interface SlackAdapterOptions {
  /** Slack incoming webhook URL. */
  readonly webhookUrl: string;
}

/** Configuration for the Email adapter (HTTP relay). */
export interface EmailAdapterOptions {
  /** URL of the HTTP relay endpoint that sends the email. */
  readonly smtpEndpoint: string;

  /** Default sender address. */
  readonly from: string;
}

/** Configuration for the generic Webhook adapter. */
export interface WebhookAdapterOptions {
  /** Target URL to POST events to. */
  readonly url: string;

  /** Additional HTTP headers to include in the request. */
  readonly headers?: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Module configuration (user-facing)
// ---------------------------------------------------------------------------

/**
 * Configuration input for `provideNotifications()`.
 *
 * Selects which adapters to enable and provides their settings.
 * All fields are optional — when omitted, only the `ConsoleAdapter`
 * (always-on fallback) is registered.
 *
 * @example
 * ```typescript
 * provideNotifications({
 *   adapters: ['slack', 'email'],
 *   slack: { webhookUrl: 'https://hooks.slack.com/...' },
 *   email: { smtpEndpoint: 'https://api.internal/send-email', from: 'noreply@acme.com' },
 * })
 * ```
 */
export interface NotificationOptions {
  /** Adapters to enable (in addition to the always-on ConsoleAdapter). */
  readonly adapters?: ReadonlyArray<'slack' | 'email' | 'webhook'>;

  /** Slack adapter configuration. Required when `'slack'` is in `adapters`. */
  readonly slack?: SlackAdapterOptions;

  /** Email adapter configuration. Required when `'email'` is in `adapters`. */
  readonly email?: EmailAdapterOptions;

  /** Webhook adapter configuration. Required when `'webhook'` is in `adapters`. */
  readonly webhook?: WebhookAdapterOptions;
}

// ---------------------------------------------------------------------------
// Resolved config (internal)
// ---------------------------------------------------------------------------

/**
 * Resolved configuration stored in the DI container.
 *
 * Built from `NotificationOptions` by `provideNotifications()`.
 * Services inject this via `NOTIFICATION_CONFIG`.
 */
export interface NotificationConfig {
  /** Names of enabled adapters (always includes `'console'`). */
  readonly enabledAdapters: ReadonlyArray<string>;

  /** Slack settings (undefined if not enabled). */
  readonly slack?: SlackAdapterOptions;

  /** Email settings (undefined if not enabled). */
  readonly email?: EmailAdapterOptions;

  /** Webhook settings (undefined if not enabled). */
  readonly webhook?: WebhookAdapterOptions;
}

// ---------------------------------------------------------------------------
// Injection token
// ---------------------------------------------------------------------------

/**
 * Injection token for the notifications module configuration.
 *
 * Provided by `provideNotifications()`. Services inject this to read config.
 */
export const NOTIFICATION_CONFIG = new InjectionToken<NotificationConfig>(
  'NOTIFICATION_CONFIG',
);
