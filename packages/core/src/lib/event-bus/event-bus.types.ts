import { InjectionToken } from '@angular/core';

// ---------------------------------------------------------------------------
// Domain event
// ---------------------------------------------------------------------------

/**
 * A typed domain event for internal pub/sub communication.
 *
 * Represents a message published through the `EventBusService` to
 * coordinate features and modules without direct coupling.
 *
 * @typeParam T - Type of the event payload. Defaults to `unknown`.
 *
 * @example
 * ```typescript
 * const event: DomainEvent<{ userId: string }> = {
 *   type: 'auth:login',
 *   payload: { userId: '123' },
 *   timestamp: Date.now(),
 *   source: 'auth-module',
 * };
 * ```
 */
export interface DomainEvent<T = unknown> {
  /** Event type identifier (colon-separated namespace, e.g. `'auth:login'`). */
  readonly type: string;

  /** Typed payload attached to the event. */
  readonly payload: T;

  /** Unix timestamp (ms) of when the event was created. */
  readonly timestamp: number;

  /** Optional correlation ID for tracing related events. */
  readonly correlationId?: string;

  /** Module or feature that originated the event. */
  readonly source?: string;

  /** Arbitrary metadata attached to the event. */
  readonly metadata?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Event handler
// ---------------------------------------------------------------------------

/**
 * Callback invoked when a matching event is received.
 *
 * @typeParam T - Type of the event payload.
 */
export type EventHandler<T = unknown> = (event: DomainEvent<T>) => void;

// ---------------------------------------------------------------------------
// Event filter (for history queries)
// ---------------------------------------------------------------------------

/**
 * Filter criteria for querying event history.
 *
 * All fields are optional — when omitted, no filtering is applied
 * for that criterion.
 */
export interface EventFilter {
  /** Filter by exact event type. */
  readonly type?: string;

  /** Filter by event source. */
  readonly source?: string;

  /** Return only events after this Unix timestamp (ms). */
  readonly since?: number;
}

// ---------------------------------------------------------------------------
// Queue status
// ---------------------------------------------------------------------------

/**
 * Status of the persistent event queue.
 */
export type QueueStatus = 'idle' | 'flushing' | 'error';

/**
 * Result returned by `EventQueueService.flush()`.
 */
export interface FlushResult {
  /** Number of events successfully delivered. */
  readonly delivered: number;

  /** Number of events that failed delivery. */
  readonly failed: number;
}

// ---------------------------------------------------------------------------
// Module configuration (user-facing)
// ---------------------------------------------------------------------------

/**
 * Configuration input for `provideEventBus()`.
 *
 * All fields are optional — defaults provide a sensible configuration
 * for most products.
 *
 * @example
 * ```typescript
 * provideEventBus({
 *   enableQueue: true,
 *   maxQueueSize: 500,
 *   enableHistory: true,
 *   historySize: 200,
 * })
 * ```
 */
export interface EventBusOptions {
  /** Enable the persistent event queue. Defaults to `true`. */
  readonly enableQueue?: boolean;

  /** Maximum number of events in the queue before oldest are dropped. Defaults to `1000`. */
  readonly maxQueueSize?: number;

  /** Enable the in-memory event history ring buffer. Defaults to `false`. */
  readonly enableHistory?: boolean;

  /** Maximum number of events kept in history. Defaults to `100`. */
  readonly historySize?: number;
}

// ---------------------------------------------------------------------------
// Resolved config (internal)
// ---------------------------------------------------------------------------

/**
 * Resolved configuration stored in the DI container.
 *
 * Built from `EventBusOptions` by `provideEventBus()`.
 * Services inject this via `EVENT_BUS_CONFIG`.
 */
export interface EventBusConfig {
  /** Whether the persistent event queue is enabled. */
  readonly enableQueue: boolean;

  /** Maximum queue size. */
  readonly maxQueueSize: number;

  /** Whether the event history ring buffer is enabled. */
  readonly enableHistory: boolean;

  /** Maximum history size. */
  readonly historySize: number;
}

// ---------------------------------------------------------------------------
// Injection token
// ---------------------------------------------------------------------------

/**
 * Injection token for the event-bus module configuration.
 *
 * Provided by `provideEventBus()`. Services inject this to read config.
 */
export const EVENT_BUS_CONFIG = new InjectionToken<EventBusConfig>(
  'EVENT_BUS_CONFIG',
);
